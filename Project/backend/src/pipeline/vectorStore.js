require('dotenv').config();
const { createDocument } = require('../models/Document');
const { insertChunk, searchSimilarChunks } = require('../models/Chunk');
const { chunkText } = require('./chunker');
const { getEmbedding, getEmbeddings } = require('./embedder');

const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE, 10) || 500;
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP, 10) || 50;
const TOP_K = parseInt(process.env.TOP_K, 10) || 5;

/**
 * Full ingestion pipeline:
 *  1. Create a document record in the DB (scoped to userId)
 *  2. Chunk all provided texts
 *  3. Embed every chunk
 *  4. Insert chunks + embeddings into the DB
 *
 * @param {string}   userId - Owner of this document
 * @param {string}   name   - Human-readable name for the document
 * @param {string}   type   - 'csv' | 'json' | 'chat' | 'text'
 * @param {string[]} texts  - Array of raw text strings to ingest
 * @returns {Promise<{ documentId: string, chunksCreated: number }>}
 */
async function storeDocument(userId, name, type, texts) {
  // 1. Create document record
  const doc = await createDocument(userId, name, type);
  const documentId = doc.id;

  // 2. Chunk all texts
  const allChunks = [];
  for (let i = 0; i < texts.length; i++) {
    const chunks = chunkText(texts[i], CHUNK_SIZE, CHUNK_OVERLAP);
    chunks.forEach((chunkContent, chunkIdx) => {
      allChunks.push({
        content: chunkContent,
        metadata: { sourceIndex: i, chunkIndex: chunkIdx },
      });
    });
  }

  if (allChunks.length === 0) {
    return { documentId, chunksCreated: 0 };
  }

  // 3. Embed all chunks
  console.log(`Embedding ${allChunks.length} chunks for document "${name}"...`);
  const chunkContents = allChunks.map((c) => c.content);
  const embeddings = await getEmbeddings(chunkContents);

  // 4. Store each chunk + embedding
  for (let i = 0; i < allChunks.length; i++) {
    await insertChunk(documentId, allChunks[i].content, embeddings[i], allChunks[i].metadata);
  }

  console.log(`Stored ${allChunks.length} chunks for document "${name}" (id: ${documentId})`);
  return { documentId, chunksCreated: allChunks.length };
}

/**
 * Search for chunks most semantically similar to a query string.
 *
 * @param {string} query
 * @param {number} [topK]
 * @returns {Promise<{ content: string, similarity: number, documentName: string }[]>}
 */
async function searchContext(query, topK = TOP_K) {
  const queryEmbedding = await getEmbedding(query);
  const results = await searchSimilarChunks(queryEmbedding, topK);
  return results.map((row) => ({
    content: row.content,
    similarity: parseFloat(row.similarity),
    documentName: row.document_name,
    documentType: row.document_type,
    metadata: row.metadata,
  }));
}

module.exports = { storeDocument, searchContext };
