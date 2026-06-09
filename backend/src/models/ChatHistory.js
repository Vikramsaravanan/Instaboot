const { pool } = require('../config/db');

async function saveChatMessage(sessionId, role, content, agentUsed = null) {
  const result = await pool.query(
    `INSERT INTO chat_history (session_id, role, content, agent_used)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [sessionId, role, content, agentUsed]
  );
  return result.rows[0];
}

async function getChatHistory(sessionId) {
  const result = await pool.query(
    `SELECT * FROM chat_history
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId]
  );
  return result.rows;
}

async function getAllSessions() {
  const result = await pool.query(
    `SELECT
       session_id,
       COUNT(*) AS message_count,
       MIN(created_at) AS started_at,
       MAX(created_at) AS last_message_at,
       (
         SELECT content FROM chat_history ch2
         WHERE ch2.session_id = ch.session_id
           AND ch2.role = 'user'
         ORDER BY ch2.created_at ASC
         LIMIT 1
       ) AS first_message
     FROM chat_history ch
     GROUP BY session_id
     ORDER BY last_message_at DESC`
  );
  return result.rows;
}

module.exports = { saveChatMessage, getChatHistory, getAllSessions };
