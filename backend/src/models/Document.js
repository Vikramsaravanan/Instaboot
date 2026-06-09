const { pool } = require('../config/db');

async function createDocument(name, type) {
  const result = await pool.query(
    'INSERT INTO documents (name, type) VALUES ($1, $2) RETURNING *',
    [name, type]
  );
  return result.rows[0];
}

async function getAllDocuments() {
  const result = await pool.query(
    'SELECT * FROM documents ORDER BY created_at DESC'
  );
  return result.rows;
}

async function getDocumentById(id) {
  const result = await pool.query(
    'SELECT * FROM documents WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { createDocument, getAllDocuments, getDocumentById };
