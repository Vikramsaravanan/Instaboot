const { groqChat } = require('../utils/groqClient');
const { processMessage } = require('./scriptGeneratorAgent');

// ── Prompt extraction ─────────────────────────────────────────────────────────

/**
 * Extract an ordered list of prompt strings from any parsed file structure.
 *
 * Supports:
 *   - Array of strings:              ["prompt1", "prompt2"]
 *   - Array of objects (any key):    [{ prompt: "..." }, { query: "..." }, { text: "..." }]
 *   - Single object with array val:  { prompts: ["p1","p2"] }
 *   - Plain string:                  "one prompt"
 *
 * Priority for column detection (case-insensitive):
 *   prompt > query > question > text > input > message > content
 *   — falls back to the first string-valued column if none match.
 */
function extractPrompts(parsedData) {
  if (!parsedData) return [];

  // Plain string — treat as single prompt
  if (typeof parsedData === 'string') {
    const trimmed = parsedData.trim();
    return trimmed ? [trimmed] : [];
  }

  // Array
  if (Array.isArray(parsedData)) {
    if (parsedData.length === 0) return [];

    const first = parsedData[0];

    // Array of plain strings
    if (typeof first === 'string') {
      return parsedData.map((s) => String(s).trim()).filter(Boolean);
    }

    // Array of objects — find the best column
    if (typeof first === 'object' && first !== null) {
      const PRIORITY = ['prompt', 'query', 'question', 'text', 'input', 'message', 'content'];
      const keys = Object.keys(first).map((k) => k.toLowerCase());

      let chosenKey = null;

      // Try priority columns first
      for (const p of PRIORITY) {
        const match = Object.keys(first).find((k) => k.toLowerCase() === p);
        if (match) { chosenKey = match; break; }
      }

      // Fall back to first column that holds a string value
      if (!chosenKey) {
        chosenKey = Object.keys(first).find(
          (k) => typeof first[k] === 'string' || typeof first[k] === 'number'
        );
      }

      if (!chosenKey) return [];

      return parsedData
        .map((row) => (row[chosenKey] !== undefined && row[chosenKey] !== null ? String(row[chosenKey]).trim() : ''))
        .filter(Boolean);
    }

    return [];
  }

  // Single object — look for a key that holds an array of prompts
  if (typeof parsedData === 'object') {
    for (const key of Object.keys(parsedData)) {
      const val = parsedData[key];
      if (Array.isArray(val)) {
        const strs = val.map((v) => String(v).trim()).filter(Boolean);
        if (strs.length > 0) return strs;
      }
    }
    // Last resort: values of the object as prompts
    return Object.values(parsedData)
      .filter((v) => typeof v === 'string' || typeof v === 'number')
      .map((v) => String(v).trim())
      .filter(Boolean);
  }

  return [];
}

// ── Sequential prompt runner ──────────────────────────────────────────────────

/**
 * Run each extracted prompt through processMessage in order and collect results.
 *
 * @param {string[]} prompts   - Ordered list of prompt strings
 * @param {string}   sessionId - Current session (for context)
 * @returns {Promise<Array<{ index: number, prompt: string, response: string, agentUsed: string, script: string|null }>>}
 */
async function runPromptsSequentially(prompts, sessionId) {
  const results = [];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`[fileAnalysisAgent] Running prompt ${i + 1}/${prompts.length}: "${prompt.slice(0, 80)}"`);

    try {
      const result = await processMessage(prompt, sessionId);
      results.push({
        index:     i + 1,
        prompt,
        response:  result.response,
        agentUsed: result.agentUsed,
        script:    result.script   || null,
        os:        result.os       || null,
        software:  result.software || null,
        version:   result.version  || null,
      });
    } catch (err) {
      console.error(`[fileAnalysisAgent] Error on prompt ${i + 1}:`, err.message);
      results.push({
        index:     i + 1,
        prompt,
        response:  `⚠️ Failed to process this prompt: ${err.message}`,
        agentUsed: 'Error',
        script:    null,
        os:        null,
        software:  null,
        version:   null,
      });
    }
  }

  return results;
}

// ── Summary builder ───────────────────────────────────────────────────────────

/**
 * Build a markdown summary of all prompt results.
 * This is what gets shown as the FIRST assistant message after upload.
 */
function buildSummaryMessage(fileName, prompts, results) {
  const lines = [
    `## 📂 File Analysed: \`${fileName}\``,
    '',
    `Found **${prompts.length} prompt${prompts.length !== 1 ? 's' : ''}** — running each one in order.`,
    '',
    '---',
    '',
  ];

  for (const r of results) {
    lines.push(`### Prompt ${r.index}: *${r.prompt}*`);
    lines.push('');
    lines.push(r.response);
    if (r.script) {
      lines.push('');
      lines.push(`> 📋 Install script generated — click **"View Install Script"** in the chat.`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push(`*All ${results.length} prompt${results.length !== 1 ? 's' : ''} processed in order.*`);

  return lines.join('\n');
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Parse prompts from file, run each through the agent pipeline, return results.
 *
 * @param {any}    parsedData - Output from parseCSV / parseJSON
 * @param {string} fileName   - Original file name (for display)
 * @param {string} fileType   - 'csv' | 'json'
 * @param {string} sessionId  - Current chat session
 * @returns {Promise<{
 *   prompts:       string[],
 *   results:       Array<{index, prompt, response, agentUsed, script, os, software, version}>,
 *   summaryMessage: string,
 * }>}
 */
async function analyzeFileData(parsedData, fileName, fileType, sessionId) {
  // 1. Extract prompts
  const prompts = extractPrompts(parsedData);

  if (prompts.length === 0) {
    const fallback = `## ⚠️ No Prompts Found in \`${fileName}\`\n\nCould not extract any prompts from this file.\n\n**Expected formats:**\n- A CSV with a column named \`prompt\`, \`query\`, \`question\`, or \`text\`\n- A JSON array of strings: \`["prompt1", "prompt2"]\`\n- A JSON array of objects: \`[{ "prompt": "..." }]\`\n\nPlease check your file and try again.`;
    return { prompts: [], results: [], summaryMessage: fallback };
  }

  // 2. Run all prompts sequentially
  const results = await runPromptsSequentially(prompts, sessionId);

  // 3. Build summary
  const summaryMessage = buildSummaryMessage(fileName, prompts, results);

  return { prompts, results, summaryMessage };
}

module.exports = { analyzeFileData, extractPrompts };
