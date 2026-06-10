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
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Upload ────────────────────────────────────────────────────────────────────

/**
 * Upload a CSV or JSON file to the backend (index only, no analysis).
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
 * Upload a file AND get an LLM analysis injected into the chat session.
 * @param {File}     file
 * @param {string}   sessionId
 * @param {function} [onProgress]
 * @returns {Promise<{ documentId, chunksCreated, analysis, userMessage, agentUsed, message }>}
 */
export async function uploadAndAnalyzeFile(file, sessionId, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sessionId', sessionId);

  const response = await api.post('/upload/analyze', formData, {
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

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} data
 */
export async function register(data) {
  const response = await api.post('/auth/register', data);
  return response.data;
}

/**
 * Login with email + password.
 * @param {{ email: string, password: string }} data
 */
export async function login(data) {
  const response = await api.post('/auth/login', data);
  return response.data;
}

/**
 * Fetch the currently authenticated user from the token.
 */
export async function getMe() {
  const response = await api.get('/auth/me');
  return response.data;
}
