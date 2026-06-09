import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Send, Bot, Zap } from 'lucide-react';
import MessageBubble from './MessageBubble';

const EXAMPLE_PROMPTS = [
  'Install Docker on Windows 11',
  'How do I get Python on macOS?',
  'I want to install VSCode on Ubuntu',
  'Install Node.js on Fedora Linux',
  'How to set up Git on Windows?',
];

function LoadingDots() {
  return (
    <div className="flex gap-3 px-4 py-2">
      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
        <Bot size={16} className="text-gray-300" />
      </div>
      <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block" />
        <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block" />
        <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block" />
      </div>
    </div>
  );
}

/**
 * ChatWindow – the main chat interface.
 *
 * Props:
 *  - messages   : message array from useChat
 *  - isLoading  : bool
 *  - onSend     : (text: string) => void
 *  - onNewChat  : () => void
 */
export default function ChatWindow({ messages, isLoading, onSend, onNewChat }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const submit = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;
    onSend(text);
    setInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isLoading, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    // Auto-resize textarea
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
  };

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-full bg-gray-950">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
          <h2 className="text-white font-semibold text-sm">Assistant</h2>
          <span className="text-gray-600 text-xs hidden sm:inline">
            · Install scripts &amp; document Q&amp;A
          </span>
        </div>
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700/50"
        >
          <Zap size={12} />
          New Chat
        </button>
      </header>

      {/* ── Message list ── */}
      <main className="flex-1 overflow-y-auto py-4 scroll-smooth" aria-label="Chat messages">
        {isEmpty ? (
          /* Welcome screen */
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-5 shadow-2xl shadow-blue-900/50">
              <Bot size={30} className="text-white" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">MultiAgent Chatbot</h3>
            <p className="text-gray-400 text-sm max-w-md mb-8 leading-relaxed">
              Generate install scripts for Windows, macOS, and Linux, or ask questions about your uploaded documents.
            </p>

            {/* Example prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSend(prompt)}
                  className="text-left px-4 py-3 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl text-gray-300 hover:text-white text-sm transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message bubbles */
          <div className="space-y-0.5">
            {messages.map((msg, idx) => {
              const isLast = idx === messages.length - 1;
              const hasReplies = isLast && !isLoading && msg.role === 'assistant' && msg.quickReplies?.length > 0;
              return (
                <div key={msg.id}>
                  <MessageBubble message={msg} />
                  {hasReplies && (
                    <div className="flex flex-wrap gap-2 px-14 pb-2">
                      {msg.quickReplies.map((reply) => (
                        <button
                          key={reply}
                          onClick={() => onSend(reply)}
                          className="px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white border border-gray-600 hover:border-blue-500 rounded-full transition-all duration-200"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {isLoading && <LoadingDots />}
          </div>
        )}
        <div ref={bottomRef} aria-hidden="true" />
      </main>

      {/* ── Input area ── */}
      <footer className="flex-shrink-0 px-4 py-4 border-t border-gray-800">
        <div className="flex items-end gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 focus-within:border-blue-600/60 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder='Ask about software installs or your documents… (Enter to send, Shift+Enter for newline)'
            rows={1}
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 text-sm resize-none outline-none leading-relaxed min-h-[24px]"
            disabled={isLoading}
            aria-label="Chat input"
          />
          <button
            onClick={submit}
            disabled={!input.trim() || isLoading}
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
              input.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-gray-700 text-xs mt-2">
          Shift+Enter for new line · Enter to send
        </p>
      </footer>
    </div>
  );
}
