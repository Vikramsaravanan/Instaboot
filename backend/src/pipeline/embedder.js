require('dotenv').config();

const MODEL_NAME = process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2';

let _pipeline = null;
let _loading = false;
let _waiters = [];

/**
 * Lazily initialize and cache the embedding pipeline (singleton).
 * @returns {Promise<Function>} The HuggingFace feature-extraction pipeline
 */
async function getPipeline() {
  if (_pipeline) return _pipeline;

  if (_loading) {
    // Wait for the ongoing initialization
    return new Promise((resolve, reject) => {
      _waiters.push({ resolve, reject });
    });
  }

  _loading = true;
  try {
    console.log(`Loading embedding model: ${MODEL_NAME} ...`);
    const { pipeline } = await import('@xenova/transformers');
    _pipeline = await pipeline('feature-extraction', MODEL_NAME, {
      quantized: true,
    });
    console.log('Embedding model loaded successfully');

    // Resolve all pending waiters
    for (const w of _waiters) w.resolve(_pipeline);
    _waiters = [];
    return _pipeline;
  } catch (err) {
    _loading = false;
    for (const w of _waiters) w.reject(err);
    _waiters = [];
    throw err;
  }
}

/**
 * Get an embedding vector for a single text string.
 * @param {string} text
 * @returns {Promise<Float32Array>} 384-dimensional embedding
 */
async function getEmbedding(text) {
  const pipe = await getPipeline();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  return output.data; // Float32Array of length 384
}

/**
 * Get embeddings for multiple texts.
 * Processes them sequentially to avoid memory issues.
 * @param {string[]} texts
 * @returns {Promise<Float32Array[]>}
 */
async function getEmbeddings(texts) {
  const embeddings = [];
  for (const text of texts) {
    const emb = await getEmbedding(text);
    embeddings.push(emb);
  }
  return embeddings;
}

module.exports = { getEmbedding, getEmbeddings };
