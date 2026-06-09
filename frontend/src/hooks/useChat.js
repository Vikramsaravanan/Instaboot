import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendMessage, getChatHistory } from '../api/client';

const SESSION_KEY = 'chatbot_session_id';

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
 * Custom hook that manages chat state and session persistence.
 *
 * Returns:
 *  - messages        : array of message objects
 *  - isLoading       : bool
 *  - sessionId       : current session UUID
 *  - error           : string | null
 *  - send(text)      : async function to send a user message
 *  - newSession()    : start a fresh session
 *  - clearError()    : dismiss error
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved || uuidv4();
  });

  // Persist sessionId whenever it changes
  useEffect(() => {
    localStorage.setItem(SESSION_KEY, sessionId);
  }, [sessionId]);

  // Load history on mount / session change
  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const data = await getChatHistory(sessionId);
        if (!cancelled && data.history && data.history.length > 0) {
          const loaded = data.history.map((h) =>
            makeMessage(h.role, h.content, {
              agentUsed: h.agent_used || h.agentUsed || null,
              timestamp: h.created_at || h.timestamp,
            })
          );
          setMessages(loaded);
        }
      } catch (err) {
        // History load failing is non-fatal; start with empty messages
        console.warn('Could not load chat history:', err.message);
      }
    }

    loadHistory();
    return () => { cancelled = true; };
  }, [sessionId]);

  const send = useCallback(async (text) => {
    if (!text || text.trim().length === 0) return;

    const userMsg = makeMessage('user', text.trim());
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const data = await sendMessage(text.trim(), sessionId);

      const assistantMsg = makeMessage('assistant', data.response, {
        agentUsed:    data.agentUsed,
        script:       data.script,
        software:     data.software,
        os:           data.os,
        version:      data.version,
        quickReplies: data.quickReplies || [],
      });
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      // Add an error bubble so the user sees feedback in chat
      const errMsg = makeMessage('assistant', `⚠️ ${err.message || 'Request failed. Please try again.'}`, {
        agentUsed: 'Error',
        isError: true,
      });
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const newSession = useCallback(() => {
    const newId = uuidv4();
    setSessionId(newId);
    setMessages([]);
    setError(null);
    localStorage.setItem(SESSION_KEY, newId);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    messages,
    isLoading,
    sessionId,
    error,
    send,
    newSession,
    clearError,
  };
}
