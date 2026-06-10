const { detectIntent } = require('./intentAgent');
const { getLatestVersion } = require('./versionCheckAgent');
const { getScript, getSupportedSoftware } = require('../utils/scriptTemplates');
const { searchContext } = require('../pipeline/vectorStore');

/**
 * Format a version info object into a readable string.
 */
function formatVersion(software, versionInfo) {
  const { version, releaseDate } = versionInfo;
  let text = `**Latest ${software} Version:** \`${version}\``;
  if (releaseDate) text += `  ·  Released: ${releaseDate}`;
  return text;
}

/**
 * Build a human-friendly install response for the install_software intent.
 */
async function handleInstallSoftware(intent) {
  const { software, os, distro } = intent;

  if (!software) {
    const supported = getSupportedSoftware().join(', ');
    return {
      response: `I can generate install scripts for the following software:\n\n**${supported}**\n\nJust tell me what you'd like to install and on which operating system (Windows, macOS, or Linux).`,
      agentUsed: 'Script Generator Agent',
      script: null,
      os: null,
      software: null,
    };
  }

  // Get version info and install script in parallel
  const [versionInfo, scriptData] = await Promise.all([
    getLatestVersion(software),
    Promise.resolve(getScript(software, os, distro)),
  ]);

  if (!scriptData) {
    return {
      response: `I don't have an install script for **${software}** on **${os}** yet. Try asking about: ${getSupportedSoftware().join(', ')}.`,
      agentUsed: 'Script Generator Agent',
      script: null,
      os,
      software,
    };
  }

  const osLabel = scriptData.os;
  const versionLine = versionInfo ? formatVersion(software, versionInfo) : '';

  const response = [
    `## Installing **${software.charAt(0).toUpperCase() + software.slice(1)}** on ${osLabel}`,
    '',
    versionLine,
    '',
    `### Instructions`,
    scriptData.instructions,
    '',
    `Click **"View Install Script"** below to see the full terminal commands, then copy and paste them into your terminal.`,
  ].filter((l) => l !== undefined).join('\n');

  return {
    response,
    agentUsed: 'Script Generator Agent',
    script: scriptData.script,
    os: osLabel,
    software,
    version: versionInfo ? versionInfo.version : null,
  };
}

/**
 * Build a response based on context retrieved from the vector store.
 */
async function handleQueryKnowledge(message) {
  let chunks;
  try {
    chunks = await searchContext(message, 5);
  } catch (err) {
    console.error('searchContext error:', err.message);
    return {
      response: `I tried to search your uploaded documents but encountered an error: ${err.message}. Please make sure documents have been uploaded and the embedding service is running.`,
      agentUsed: 'Knowledge Query Agent',
      script: null,
      os: null,
      software: null,
    };
  }

  if (!chunks || chunks.length === 0) {
    return {
      response: `I searched your uploaded documents but couldn't find relevant information for: **"${message}"**.\n\nTry uploading a CSV or JSON file with relevant data first, then ask your question.`,
      agentUsed: 'Knowledge Query Agent',
      script: null,
      os: null,
      software: null,
    };
  }

  const contextText = chunks
    .map((c, i) => `**Source ${i + 1}** *(from "${c.documentName}", similarity: ${(c.similarity * 100).toFixed(1)}%)*:\n> ${c.content}`)
    .join('\n\n');

  const response = [
    `## Answer from Your Documents`,
    '',
    `Here is the most relevant information I found related to your question:`,
    '',
    contextText,
    '',
    `---`,
    `*Retrieved ${chunks.length} relevant passage(s) from your uploaded documents.*`,
  ].join('\n');

  return {
    response,
    agentUsed: 'Knowledge Query Agent',
    script: null,
    os: null,
    software: null,
  };
}

/**
 * Build a general chat response.
 */
function handleGeneralChat(message) {
  const lower = message.toLowerCase();

  let response;

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    response = `👋 Hello! I'm **Instaboot**, your AI assistant. I can help you with:\n\n- 🖥️ **Install scripts** – Just say "install Docker on Windows" or "how do I get Python on Mac"\n- 📄 **Document Q&A** – Upload a CSV or JSON file and ask questions about it\n- 💬 **General assistance** – Ask me anything!\n\nWhat would you like to do today?`;
  } else if (lower.includes('help') || lower.includes('what can you do')) {
    response = `## What Instaboot Can Do\n\n**1. Generate Install Scripts**\nAsk me to install any of these:\n- Ubuntu/WSL, Docker, Node.js, Python, Git, VSCode\n- Chrome, Firefox, Zoom, VLC, 7-Zip, Steam\n\nWorks for Windows, macOS, and Linux (Ubuntu/Fedora).\n\n**2. Answer Questions from Your Documents**\nUpload a CSV or JSON file using the sidebar, then ask questions about its contents.\n\n**3. General Conversation**\nAsk me anything and I'll do my best to help!\n\n**Example prompts:**\n- "Install Docker on my Windows 11 machine"\n- "How do I get Python on macOS?"\n- "I want ubuntu on linux"`;
  } else if (lower.includes('thank')) {
    response = `You're welcome! Let me know if there's anything else I can help with. 😊`;
  } else if (lower.includes('bye') || lower.includes('goodbye')) {
    response = `Goodbye! Come back anytime you need help with installs or your data. 👋`;
  } else if (lower.includes('version') || lower.includes('latest')) {
    response = `Tell me which software you're asking about and I'll look up the latest version!\n\nFor example: "What's the latest version of Python?" or "Install the latest Node.js on Windows"`;
  } else {
    response = `I understand you're asking about: **"${message}"**\n\nI specialize in:\n- 📦 **Software install scripts** for Windows, macOS, and Linux\n- 📄 **Answering questions** from uploaded CSV/JSON documents\n\nTry asking something like:\n- "Install VSCode on Windows"\n- "How do I install Docker on Ubuntu?"\n- Or upload a file and ask "What's in the data?"`;
  }

  return {
    response,
    agentUsed: 'General Chat Agent',
    script: null,
    os: null,
    software: null,
  };
}

/**
 * Main orchestrator: process a user message and return a structured response.
 *
 * @param {string} message   - User's message
 * @param {string} sessionId - Current session ID (not used in logic but available for context)
 * @returns {Promise<{ response: string, agentUsed: string, script: string|null, os: string|null, software: string|null }>}
 */
async function processMessage(message, sessionId) {
  if (!message || message.trim() === '') {
    return {
      response: 'Please type a message and I\'ll be happy to help!',
      agentUsed: 'General Chat Agent',
      script: null,
      os: null,
      software: null,
    };
  }

  let intent;
  try {
    intent = detectIntent(message);
  } catch (err) {
    console.error('intentAgent error:', err);
    intent = { intent: 'general_chat', software: null, os: 'windows', distro: null };
  }

  console.log(`[scriptGeneratorAgent] intent="${intent.intent}" software="${intent.software}" os="${intent.os}" distro="${intent.distro}"`);

  switch (intent.intent) {
    case 'install_software':
      return await handleInstallSoftware(intent);

    case 'query_knowledge':
      return await handleQueryKnowledge(message);

    case 'general_chat':
    default:
      return handleGeneralChat(message);
  }
}

module.exports = { processMessage };
