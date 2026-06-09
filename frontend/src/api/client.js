import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60 seconds – embedding can take time on first load
});

// ── Interceptors ──────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Upload ────────────────────────────────────────────────────────────────────

/**
 * Upload a CSV or JSON file to the backend.
 * @param {File} file
 * @param {function} [onProgress]
 * @returns {Promise<{ documentId, chunksCreated, message }>}
 */
export async function uploadFile(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => {
          if (e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        }
      : undefined,
  });
  return response.data;
}

/**
 * Send plain text to be stored in the vector store.
 * @param {string} text
 * @param {string} [name]
 */
export async function uploadText(text, name) {
  const response = await api.post('/upload/text', { text, name });
  return response.data;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

/**
 * Send a chat message and get an agent response.
 * @param {string} message
 * @param {string} sessionId
 * @returns {Promise<{ response, agentUsed, script, sessionId, software, os, version }>}
 */
export async function sendMessage(message, sessionId) {
  const response = await api.post('/chat', { message, sessionId });
  return response.data;
}

/**
 * Get the full chat history for a session.
 * @param {string} sessionId
 */
export async function getChatHistory(sessionId) {
  const response = await api.get(`/chat/history/${sessionId}`);
  return response.data;
}

/**
 * Get all chat sessions.
 */
export async function getSessions() {
  const response = await api.get('/chat/sessions');
  return response.data;
}

// ── Documents ─────────────────────────────────────────────────────────────────

/**
 * List all uploaded documents.
 */
export async function getDocuments() {
  const response = await api.get('/documents');
  return response.data;
}

export default api;
