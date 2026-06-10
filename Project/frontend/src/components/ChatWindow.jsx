import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Send, Zap, Plus } from 'lucide-react';
import MessageBubble from './MessageBubble';

const EXAMPLE_PROMPTS = [
  'Install Docker on Windows 11',
  'How do I get Python on macOS?',
  'Install VSCode on Ubuntu',
  'Install Node.js on Fedora',
  'Set up Git on Windows',
  'Install PostgreSQL on Linux',
];

function LoadingDots() {
  return (
    <div className="flex gap-3 px-6 py-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
           style={{ background: '#1c1c22', border: '1px solid #2a2a35' }}>
        <Zap size={14} style={{ color: '#7c3aed' }} />
      </div>
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5"
           style={{ background: '#1c1c22', border: '1px solid #2a2a35' }}>
        <span className="typing-dot w-2 h-2 rounded-full inline-block" style={{ background: '#7c3aed' }} />
        <span className="typing-dot w-2 h-2 rounded-full inline-block" style={{ background: '#7c3aed' }} />
        <span className="typing-dot w-2 h-2 rounded-full inline-block" style={{ background: '#7c3aed' }} />
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, isLoading, onSend, onNewChat }) {
  const [input, setInput] = useState('');
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const submit = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;
    onSend(text);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, isLoading, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
  };

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-full" style={{ background: '#0e0e11' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b flex-shrink-0"
              style={{ borderColor: '#1e1e28', background: '#0e0e11' }}>
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full" style={{ background: '#22d3ee', boxShadow: '0 0 6px #22d3ee' }} />
          <span className="font-semibold text-sm" style={{ color: '#f0eeff' }}>Assistant</span>
          <span className="text-xs hidden sm:inline" style={{ color: '#3d3a52' }}>· scripts &amp; document Q&amp;A</span>
        </div>
        <button onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors border"
          style={{ color: '#6e6b88', background: '#16161a', borderColor: '#2a2a35' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f0eeff'; e.currentTarget.style.borderColor = '#3d3a52'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#6e6b88'; e.currentTarget.style.borderColor = '#2a2a35'; }}>
          <Plus size={12} />
          New Chat
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto py-6" aria-label="Chat messages">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            {/* Hero icon */}
            <div className="w-18 h-18 rounded-3xl flex items-center justify-center mb-6"
                 style={{
                   width: 72, height: 72,
                   background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                   boxShadow: '0 0 40px rgba(124,58,237,0.4)',
                 }}>
              <Zap size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#f0eeff' }}>Instaboot</h3>
            <p className="text-sm max-w-sm mb-10 leading-relaxed" style={{ color: '#6e6b88' }}>
              Generate install scripts for any OS, run prompt pipelines from files, or ask questions about your data.
            </p>

            {/* Example prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {EXAMPLE_PROMPTS.map(p => (
                <button key={p} onClick={() => onSend(p)}
                  className="text-left px-4 py-3 rounded-xl text-sm transition-all duration-150 border"
                  style={{ background: '#16161a', borderColor: '#2a2a35', color: '#b8b5d0' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#7c3aed';
                    e.currentTarget.style.color = '#f0eeff';
                    e.currentTarget.style.background = '#1c1c22';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#2a2a35';
                    e.currentTarget.style.color = '#b8b5d0';
                    e.currentTarget.style.background = '#16161a';
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {messages.map((msg, idx) => {
              const isLast = idx === messages.length - 1;
              const hasReplies = isLast && !isLoading && msg.role === 'assistant' && msg.quickReplies?.length > 0;
              return (
                <div key={msg.id}>
                  <MessageBubble message={msg} />
                  {hasReplies && (
                    <div className="flex flex-wrap gap-2 px-14 pb-2">
                      {msg.quickReplies.map(r => (
                        <button key={r} onClick={() => onSend(r)}
                          className="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-150 border"
                          style={{ background: '#1c1c22', borderColor: '#2a2a35', color: '#b8b5d0' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#1c1c22'; e.currentTarget.style.color = '#b8b5d0'; }}>
                          {r}
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
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="flex-shrink-0 px-5 py-4 border-t" style={{ borderColor: '#1e1e28' }}>
        <div className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-200 border"
             style={{ background: '#16161a', borderColor: '#2a2a35' }}
             onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'}
             onBlurCapture={e => e.currentTarget.style.borderColor = '#2a2a35'}>
          <textarea ref={textareaRef} value={input} onChange={handleChange} onKeyDown={handleKeyDown}
            placeholder="Ask about installs or your documents… (Enter to send)"
            rows={1} disabled={isLoading} aria-label="Chat input"
            className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed"
            style={{ color: '#f0eeff', minHeight: 24, caretColor: '#7c3aed' }}
          />
          <button onClick={submit} disabled={!input.trim() || isLoading} aria-label="Send"
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: input.trim() && !isLoading
                ? 'linear-gradient(135deg,#7c3aed,#6d28d9)'
                : '#1c1c22',
              color: input.trim() && !isLoading ? '#fff' : '#3d3a52',
              boxShadow: input.trim() && !isLoading ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
              cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
            }}>
            <Send size={15} />
          </button>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: '#3d3a52' }}>
          Shift+Enter for new line · Enter to send
        </p>
      </footer>
    </div>
  );
}
