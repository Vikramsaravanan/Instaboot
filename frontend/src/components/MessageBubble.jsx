import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Zap, User, Terminal, Globe, Package } from 'lucide-react';
import ScriptModal from './ScriptModal';

function getAgentBadge(agentUsed) {
  if (!agentUsed) return null;
  const map = {
    'Script Generator Agent': { label: 'Script Generator', bg: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: 'rgba(124,58,237,0.3)' },
    'Knowledge Query Agent':  { label: 'Knowledge Agent',  bg: 'rgba(6,182,212,0.12)',  color: '#67e8f9', border: 'rgba(6,182,212,0.3)'  },
    'File Analysis Agent':    { label: 'File Analysis',    bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
    'General Chat Agent':     { label: 'General Chat',     bg: 'rgba(58,58,72,0.4)',    color: '#b8b5d0', border: '#2a2a35'               },
    'Error':                  { label: 'Error',            bg: 'rgba(239,68,68,0.1)',   color: '#fca5a5', border: 'rgba(239,68,68,0.25)'  },
  };
  return map[agentUsed] || { label: agentUsed, bg: 'rgba(58,58,72,0.4)', color: '#b8b5d0', border: '#2a2a35' };
}

function formatTime(ts) {
  try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

export default function MessageBubble({ message }) {
  const [modalOpen, setModalOpen] = useState(false);
  const isUser = message.role === 'user';
  const badge  = getAgentBadge(message.agentUsed);

  const codeComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter language={match[1]} style={vscDarkPlus}
          customStyle={{ borderRadius: '0.5rem', fontSize: '0.78rem', margin: '0.5rem 0', background: '#0d1117' }}
          {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code style={{ background: '#1c1c22', color: '#67e8f9', padding: '2px 7px', borderRadius: 5, fontSize: '0.82em', border: '1px solid #2a2a35' }} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <>
      <div className={`flex gap-3 px-5 py-2 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
             style={{
               background: isUser
                 ? 'linear-gradient(135deg,#7c3aed,#6d28d9)'
                 : '#1c1c22',
               border: isUser ? 'none' : '1px solid #2a2a35',
             }}>
          {isUser
            ? <User size={15} className="text-white" />
            : <Zap size={14} style={{ color: '#a78bfa' }} />}
        </div>

        {/* Content */}
        <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>

          {/* Agent badge */}
          {!isUser && badge && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs mb-1.5 border"
                 style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}>
              <Zap size={9} />
              {badge.label}
            </div>
          )}

          {/* Bubble */}
          <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
               style={isUser ? {
                   background: 'linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)',
                   color: '#fff',
                   borderRadius: '1rem 1rem 0.35rem 1rem',
                   boxShadow: '0 4px 20px rgba(124,58,237,0.25)',
                 } : message.isError ? {
                   background: 'rgba(239,68,68,0.08)',
                   border: '1px solid rgba(239,68,68,0.2)',
                   color: '#fca5a5',
                   borderRadius: '0.35rem 1rem 1rem 1rem',
                 } : {
                   background: '#16161a',
                   border: '1px solid #2a2a35',
                   color: '#d4d0ec',
                   borderRadius: '0.35rem 1rem 1rem 1rem',
                 }}>
            {isUser
              ? <p className="whitespace-pre-wrap break-words">{message.content}</p>
              : <div className="prose-chat"><ReactMarkdown components={codeComponents}>{String(message.content || '')}</ReactMarkdown></div>}
          </div>

          {/* Software / OS tags */}
          {!isUser && (message.software || message.os) && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {message.software && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border"
                      style={{ background: 'rgba(124,58,237,0.1)', color: '#c4b5fd', borderColor: 'rgba(124,58,237,0.25)' }}>
                  <Package size={9} />{message.software}
                </span>
              )}
              {message.os && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border"
                      style={{ background: 'rgba(6,182,212,0.08)', color: '#67e8f9', borderColor: 'rgba(6,182,212,0.2)' }}>
                  <Globe size={9} />{message.os}
                </span>
              )}
            </div>
          )}

          {/* View Script button */}
          {!isUser && message.script && (
            <button onClick={() => setModalOpen(true)}
              className="mt-2 flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
              style={{ background: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.28)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; }}>
              <Terminal size={12} />
              View Install Script
            </button>
          )}

          {/* Timestamp */}
          <span className="text-xs mt-1" style={{ color: '#3d3a52' }}>{formatTime(message.timestamp)}</span>
        </div>
      </div>

      {message.script && (
        <ScriptModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
          script={message.script} software={message.software} os={message.os} version={message.version} />
      )}
    </>
  );
}
