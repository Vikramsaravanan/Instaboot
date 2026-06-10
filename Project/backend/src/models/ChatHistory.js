const { pool } = require('../config/db');

/**
 * Save a single chat message, scoped to a user.
 */
async function saveChatMessage(userId, sessionId, role, content, agentUsed = null) {
  const result = await pool.query(
    `INSERT INTO chat_history (user_id, session_id, role, content, agent_used)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, sessionId, role, content, agentUsed]
  );
  return result.rows[0];
}

/**
 * Get full message history for a session — only if it belongs to the user.
 */
async function getChatHistory(userId, sessionId) {
  const result = await pool.query(
    `SELECT * FROM chat_history
     WHERE user_id = $1 AND session_id = $2
     ORDER BY created_at ASC`,
    [userId, sessionId]
  );
  return result.rows;
}

/**
 * Get all sessions that belong to a specific user, ordered by most recent.
 */
async function getAllSessions(userId) {
  const result = await pool.query(
    `SELECT
       session_id,
       COUNT(*)                    AS message_count,
       MIN(created_at)             AS started_at,
       MAX(created_at)             AS last_message_at,
       (
         SELECT content FROM chat_history ch2
         WHERE ch2.user_id    = ch.user_id
           AND ch2.session_id = ch.session_id
           AND ch2.role       = 'user'
         ORDER BY ch2.created_at ASC
         LIMIT 1
       ) AS first_message
     FROM chat_history ch
     WHERE user_id = $1
     GROUP BY session_id, user_id
     ORDER BY last_message_at DESC`,
    [userId]
  );
  return result.rows;
}

module.exports = { saveChatMessage, getChatHistory, getAllSessions };
