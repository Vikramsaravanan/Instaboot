const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseCSV, parseJSON, extractTextFromData } = require('../utils/fileParser');
const { storeDocument } = require('../pipeline/vectorStore');
const { getAllDocuments } = require('../models/Document');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.csv', '.json'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .csv and .json files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/**
 * POST /api/upload
 * Upload a CSV or JSON file and ingest it into the vector store.
 */
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded or invalid file type.' });
  }

  const filePath = req.file.path;
  const originalName = req.file.originalname;
  const ext = path.extname(originalName).toLowerCase().replace('.', '');

  let parsedData;
  try {
    if (ext === 'csv') {
      parsedData = await parseCSV(filePath);
    } else if (ext === 'json') {
      parsedData = await parseJSON(filePath);
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file type.' });
    }
  } catch (err) {
    // Clean up uploaded file
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
    result = await storeDocument(originalName, ext, texts);
  } catch (err) {
    fs.unlink(filePath, () => {});
    return res.status(500).json({ success: false, message: `Ingestion failed: ${err.message}` });
  }

  // Clean up the temp file after ingestion
  fs.unlink(filePath, () => {});

  return res.json({
    success: true,
    documentId: result.documentId,
    chunksCreated: result.chunksCreated,
    message: `Successfully ingested "${originalName}" — ${result.chunksCreated} chunks stored.`,
  });
});

/**
 * POST /api/upload/text
 * Ingest plain text or chat content directly (no file needed).
 * Body: { text: string, name: string }
 */
router.post('/text', express.json(), async (req, res) => {
  const { text, name } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'text field is required and must not be empty.' });
  }

  const docName = name || `text-${Date.now()}`;

  let result;
  try {
    result = await storeDocument(docName, 'chat', [text]);
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

/**
 * GET /api/documents
 * List all uploaded documents.
 */
router.get('/', async (req, res) => {
  const documents = await getAllDocuments();
  return res.json({ success: true, documents });
});

module.exports = router;
