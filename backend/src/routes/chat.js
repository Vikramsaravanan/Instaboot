const express = require('express');
const { processMessage } = require('../agents/scriptGeneratorAgent');
const { saveChatMessage, getChatHistory, getAllSessions } = require('../models/ChatHistory');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All chat routes require a valid JWT
router.use(requireAuth);

/**
 * POST /api/chat
 * Send a message and get a response from the multiagent pipeline.
 * Body: { message: string, sessionId: string }
 */
router.post('/', async (req, res) => {
  const { message, sessionId } = req.body;
  const userId = req.user.id;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'message is required' });
  }
  if (!sessionId || sessionId.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'sessionId is required' });
  }

  // Persist user message
  try {
    await saveChatMessage(userId, sessionId, 'user', message.trim(), null);
  } catch (err) {
    console.error('Failed to save user message:', err.message);
  }

  // Run the agent pipeline
  let result;
  try {
    result = await processMessage(message.trim(), sessionId);
  } catch (err) {
    console.error('processMessage error:', err);
    return res.status(500).json({
      success: false,
      message: `Agent processing failed: ${err.message}`,
    });
  }

  // Persist assistant response
  try {
    await saveChatMessage(userId, sessionId, 'assistant', result.response, result.agentUsed);
  } catch (err) {
    console.error('Failed to save assistant message:', err.message);
  }

  return res.json({
    success: true,
    response:  result.response,
    agentUsed: result.agentUsed,
    script:    result.script   || null,
    sessionId,
    software:  result.software || null,
    os:        result.os       || null,
    version:   result.version  || null,
  });
});

/**
 * GET /api/chat/history/:sessionId
 * Retrieve full chat history for a session — only returns rows owned by the caller.
 */
router.get('/history/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'sessionId param is required' });
  }

  const history = await getChatHistory(userId, sessionId);
  return res.json({ success: true, sessionId, history });
});

/**
 * GET /api/chat/sessions
 * List all sessions for the currently authenticated user only.
 */
router.get('/sessions', async (req, res) => {
  const userId = req.user.id;
  const sessions = await getAllSessions(userId);
  return res.json({ success: true, sessions });
});

module.exports = router;
