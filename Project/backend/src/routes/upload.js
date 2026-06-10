const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseCSV, parseJSON, extractTextFromData } = require('../utils/fileParser');
const { storeDocument } = require('../pipeline/vectorStore');
const { getDocumentsByUser } = require('../models/Document');
const { analyzeFileData } = require('../agents/fileAnalysisAgent');
const { saveChatMessage } = require('../models/ChatHistory');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All upload routes require a valid JWT
router.use(requireAuth);

// ── Multer config ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.csv', '.json'].includes(ext)) cb(null, true);
  else cb(new Error('Only .csv and .json files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

async function parseUploadedFile(filePath, ext) {
  if (ext === 'csv') return parseCSV(filePath);
  if (ext === 'json') return parseJSON(filePath);
  throw new Error('Unsupported file type.');
}

// ── GET /api/upload — list THIS user's documents ──────────────────────────────
router.get('/', async (req, res) => {
  const documents = await getDocumentsByUser(req.user.id);
  return res.json({ success: true, documents });
});

// ── POST /api/upload — index only ────────────────────────────────────────────
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded or invalid file type.' });
  }

  const userId = req.user.id;
  const filePath = req.file.path;
  const originalName = req.file.originalname;
  const ext = path.extname(originalName).toLowerCase().replace('.', '');

  let parsedData;
  try {
    parsedData = await parseUploadedFile(filePath, ext);
  } catch (err) {
    fs.unlink(filePath, () => {});
    return res.status(422).json({ success: false, message: `Failed to parse file: ${err.message}` });
  }

  const texts = extractTextFromData(parsedData);
  if (texts.length === 0) {
    fs.unlink(filePath, () => {});
    return res.status(422).json({ success: false, message: 'File appears to be empty or has no extractable text.' });
  }

  let result;
  try {
    result = await storeDocument(userId, originalName, ext, texts);
  } catch (err) {
    fs.unlink(filePath, () => {});
    return res.status(500).json({ success: false, message: `Ingestion failed: ${err.message}` });
  }

  fs.unlink(filePath, () => {});
  return res.json({
    success: true,
    documentId: result.documentId,
    chunksCreated: result.chunksCreated,
    message: `Successfully ingested "${originalName}" — ${result.chunksCreated} chunks stored.`,
  });
});

// ── POST /api/upload/analyze — index + run prompts + save to chat ─────────────
router.post('/analyze', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded or invalid file type.' });
  }

  const { sessionId } = req.body;
  if (!sessionId) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ success: false, message: 'sessionId is required.' });
  }

  const userId   = req.user.id;
  const filePath = req.file.path;
  const fileName = req.file.originalname;
  const ext      = path.extname(fileName).toLowerCase().replace('.', '');

  // 1. Parse
  let parsedData;
  try {
    parsedData = await parseUploadedFile(filePath, ext);
  } catch (err) {
    fs.unlink(filePath, () => {});
    return res.status(422).json({ success: false, message: `Failed to parse file: ${err.message}` });
  }

  const texts = extractTextFromData(parsedData);
  if (texts.length === 0) {
    fs.unlink(filePath, () => {});
    return res.status(422).json({ success: false, message: 'File appears to be empty or has no extractable text.' });
  }

  // 2. Index — scoped to this user
  let storeResult;
  try {
    storeResult = await storeDocument(userId, fileName, ext, texts);
  } catch (err) {
    fs.unlink(filePath, () => {});
    return res.status(500).json({ success: false, message: `Ingestion failed: ${err.message}` });
  }

  fs.unlink(filePath, () => {});

  // 3. Run prompt pipeline
  let analysisResult;
  try {
    analysisResult = await analyzeFileData(parsedData, fileName, ext, sessionId);
  } catch (err) {
    console.error('analyzeFileData error:', err.message);
    const fallback = `## 📂 File Indexed: \`${fileName}\`\n\n**${storeResult.chunksCreated} chunks** stored.\n\nCould not run the prompt pipeline: ${err.message}`;
    await saveChatMessage(userId, sessionId, 'user',      `📎 Uploaded: **${fileName}**`, null).catch(() => {});
    await saveChatMessage(userId, sessionId, 'assistant', fallback, 'File Analysis Agent').catch(() => {});
    return res.json({
      success: true, documentId: storeResult.documentId, chunksCreated: storeResult.chunksCreated,
      analysis: fallback, userMessage: `📎 Uploaded: **${fileName}**`,
      agentUsed: 'File Analysis Agent', results: [],
      message: `"${fileName}" indexed (analysis failed).`,
    });
  }

  const { prompts, results, summaryMessage } = analysisResult;
  const uploadMsg = `📎 Uploaded file: **${fileName}** (${storeResult.chunksCreated} chunks indexed)\n\nRunning **${prompts.length} prompt${prompts.length !== 1 ? 's' : ''}** in order…`;

  // 4. Save all messages to this user's chat history
  await saveChatMessage(userId, sessionId, 'user', uploadMsg, null).catch(() => {});
  for (const r of results) {
    await saveChatMessage(userId, sessionId, 'user',      r.prompt,   null).catch(() => {});
    await saveChatMessage(userId, sessionId, 'assistant', r.response, r.agentUsed).catch(() => {});
  }

  return res.json({
    success:       true,
    documentId:    storeResult.documentId,
    chunksCreated: storeResult.chunksCreated,
    analysis:      summaryMessage,
    userMessage:   uploadMsg,
    agentUsed:     'File Analysis Agent',
    results,
    promptCount:   prompts.length,
    message:       `"${fileName}" — ${prompts.length} prompt${prompts.length !== 1 ? 's' : ''} processed.`,
  });
});

// ── POST /api/upload/text ─────────────────────────────────────────────────────
router.post('/text', express.json(), async (req, res) => {
  const { text, name } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'text field is required.' });
  }

  const docName = name || `text-${Date.now()}`;
  let result;
  try {
    result = await storeDocument(req.user.id, docName, 'chat', [text]);
  } catch (err) {
    return res.status(500).json({ success: false, message: `Ingestion failed: ${err.message}` });
  }

  return res.json({
    success: true,
    documentId: result.documentId,
    chunksCreated: result.chunksCreated,
    message: `Text content "${docName}" stored — ${result.chunksCreated} chunks.`,
  });
});

module.exports = router;
