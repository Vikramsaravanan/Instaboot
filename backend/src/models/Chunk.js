const { pool } = require('../config/db');

/**
 * Cosine similarity between two plain JS arrays.
 */
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Insert a chunk with its embedding into the DB.
 * embedding can be Float32Array or regular Array.
 */
async function insertChunk(documentId, content, embedding, metadata = {}) {
  const embArray = Array.from(embedding);
  const result = await pool.query(
    `INSERT INTO chunks (document_id, content, embedding, metadata)
     VALUES ($1, $2, $3, $4)
     RETURNING id, document_id, content, metadata, created_at`,
    [documentId, content, embArray, JSON.stringify(metadata)]
  );
  return result.rows[0];
}

/**
 * Search for the most similar chunks using cosine similarity.
 * Fetches all embeddings from DB and ranks in Node.js
 * (efficient for up to ~50k chunks; use pgvector for larger scale).
 */
async function searchSimilarChunks(queryEmbedding, topK = 5) {
  const qArr = Array.from(queryEmbedding);

  const result = await pool.query(
    `SELECT c.id, c.document_id, c.content, c.embedding, c.metadata,
            d.name AS document_name, d.type AS document_type
     FROM chunks c
     JOIN documents d ON d.id = c.document_id`
  );

  if (result.rows.length === 0) return [];

  // Rank by cosine similarity in Node.js
  const scored = result.rows.map((row) => ({
    ...row,
    similarity: cosineSimilarity(qArr, row.embedding),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}

async function getChunksByDocumentId(documentId) {
  const result = await pool.query(
    'SELECT * FROM chunks WHERE document_id = $1 ORDER BY created_at ASC',
    [documentId]
  );
  return result.rows;
}

module.exports = { insertChunk, searchSimilarChunks, getChunksByDocumentId };
