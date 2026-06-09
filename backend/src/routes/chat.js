const express = require('express');
const { processMessage } = require('../agents/scriptGeneratorAgent');
const { saveChatMessage, getChatHistory, getAllSessions } = require('../models/ChatHistory');

const router = express.Router();

/**
 * POST /api/chat
 * Send a message and get a response from the multiagent pipeline.
 * Body: { message: string, sessionId: string }
 */
router.post('/', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'message is required' });
  }

  if (!sessionId || sessionId.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'sessionId is required' });
  }

  // Persist user message
  try {
    await saveChatMessage(sessionId, 'user', message.trim(), null);
  } catch (err) {
    console.error('Failed to save user message:', err.message);
    // Non-fatal — continue processing
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
    await saveChatMessage(sessionId, 'assistant', result.response, result.agentUsed);
  } catch (err) {
    console.error('Failed to save assistant message:', err.message);
  }

  return res.json({
    success: true,
    response: result.response,
    agentUsed: result.agentUsed,
    script: result.script || null,
    sessionId,
    software: result.software || null,
    os: result.os || null,
    version: result.version || null,
  });
});

/**
 * GET /api/chat/history/:sessionId
 * Retrieve full chat history for a session.
 */
router.get('/history/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'sessionId param is required' });
  }
  const history = await getChatHistory(sessionId);
  return res.json({ success: true, sessionId, history });
});

/**
 * GET /api/chat/sessions
 * List all known chat sessions with metadata.
 */
router.get('/sessions', async (req, res) => {
  const sessions = await getAllSessions();
  return res.json({ success: true, sessions });
});

module.exports = router;
