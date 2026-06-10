require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { initDB } = require('./config/db');
const uploadRouter = require('./routes/upload');
const chatRouter = require('./routes/chat');
const authRouter = require('./routes/auth');
const { requireAuth } = require('./middleware/auth');
const { getDocumentsByUser } = require('./models/Document');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
// /api/documents — convenience alias for /api/upload, auth-protected, user-scoped
app.get('/api/documents', requireAuth, async (req, res) => {
  const documents = await getDocumentsByUser(req.user.id);
  return res.json({ success: true, documents });
});
app.use('/api/chat', chatRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large. Max size is 10 MB.' });
  }
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Startup ───────────────────────────────────────────────────────────────────
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`   API health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
