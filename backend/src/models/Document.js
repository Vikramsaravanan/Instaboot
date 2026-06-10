const { pool } = require('../config/db');

/**
 * Create a document record owned by a specific user.
 * @param {string} userId
 * @param {string} name
 * @param {string} type  'csv' | 'json' | 'chat' | 'text'
 */
async function createDocument(userId, name, type) {
  const result = await pool.query(
    'INSERT INTO documents (user_id, name, type) VALUES ($1, $2, $3) RETURNING *',
    [userId, name, type]
  );
  return result.rows[0];
}

/**
 * Get all documents uploaded by a specific user, newest first.
 * @param {string} userId
 */
async function getDocumentsByUser(userId) {
  const result = await pool.query(
    'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

/**
 * Get a single document by ID — only if it belongs to the given user.
 * @param {string} userId
 * @param {string} id
 */
async function getDocumentById(userId, id) {
  const result = await pool.query(
    'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

module.exports = { createDocument, getDocumentsByUser, getDocumentById };
