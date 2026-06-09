import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendMessage, getChatHistory } from '../api/client';

// Session key scoped per user so different accounts never share a session
function sessionKey(userId) {
  return `chatbot_session_${userId}`;
}

function makeMessage(role, content, extras = {}) {
  return {
    id: uuidv4(),
    role,
    content,
    timestamp: new Date().toISOString(),
    ...extras,
  };
}

/**
 * useChat — manages messages, session ID, and history loading.
 *
 * @param {string} userId — the logged-in user's ID (scopes localStorage key)
 *
 * Returns:
 *  - messages         : array of message objects
 *  - isLoading        : bool
 *  - sessionId        : current session UUID
 *  - error            : string | null
 *  - send(text)       : async — send a user message
 *  - newSession()     : start a fresh session
 *  - selectSession(id): switch to an existing session
 *  - clearError()     : dismiss error
 */
export function useChat(userId) {
  const key = sessionKey(userId);

  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved || uuidv4();
  });

  const [messages, setMessages]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);

  // Persist sessionId whenever it changes
  useEffect(() => {
    localStorage.setItem(key, sessionId);
  }, [key, sessionId]);

  // Load history whenever sessionId changes
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function loadHistory() {
      setMessages([]);
      try {
        const data = await getChatHistory(sessionId);
        if (!cancelled && data.history && data.history.length > 0) {
          setMessages(
            data.history.map((h) =>
              makeMessage(h.role, h.content, {
                agentUsed: h.agent_used || h.agentUsed || null,
                timestamp: h.created_at || h.timestamp,
              })
            )
          );
        }
      } catch (err) {
        console.warn('Could not load chat history:', err.message);
      }
    }

    loadHistory();
    return () => { cancelled = true; };
  }, [sessionId, userId]);

  const send = useCallback(async (text) => {
    if (!text || text.trim().length === 0) return;

    const userMsg = makeMessage('user', text.trim());
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const data = await sendMessage(text.trim(), sessionId);
      setMessages((prev) => [
        ...prev,
        makeMessage('assistant', data.response, {
          agentUsed:    data.agentUsed,
          script:       data.script,
          software:     data.software,
          os:           data.os,
          version:      data.version,
          quickReplies: data.quickReplies || [],
        }),
      ]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setMessages((prev) => [
        ...prev,
        makeMessage('assistant', `⚠️ ${err.message || 'Request failed. Please try again.'}`, {
          agentUsed: 'Error',
          isError: true,
        }),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const newSession = useCallback(() => {
    const id = uuidv4();
    setSessionId(id);
    setMessages([]);
    setError(null);
    localStorage.setItem(key, id);
  }, [key]);

  const selectSession = useCallback((id) => {
    if (!id || id === sessionId) return;
    setSessionId(id);
    setMessages([]);
    setError(null);
    localStorage.setItem(key, id);
  }, [key, sessionId]);

  const clearError = useCallback(() => setError(null), []);

  return { messages, isLoading, sessionId, error, send, newSession, selectSession, clearError };
}
