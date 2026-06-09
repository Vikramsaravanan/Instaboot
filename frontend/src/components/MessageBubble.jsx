import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User, Terminal, Globe, Package } from 'lucide-react';
import ScriptModal from './ScriptModal';

/** Map agent name to a display label and colour */
function getAgentBadge(agentUsed) {
  if (!agentUsed) return null;
  const map = {
    'Script Generator Agent': { label: 'Script Generator', color: 'bg-purple-900/60 text-purple-300 border-purple-700/50' },
    'Knowledge Query Agent':  { label: 'Knowledge Agent',  color: 'bg-green-900/60  text-green-300  border-green-700/50'  },
    'General Chat Agent':     { label: 'General Chat',     color: 'bg-gray-700      text-gray-300   border-gray-600'       },
    'Intent Agent':           { label: 'Intent Agent',     color: 'bg-yellow-900/60 text-yellow-300 border-yellow-700/50' },
    'Error':                  { label: 'Error',            color: 'bg-red-900/60    text-red-300    border-red-700/50'     },
  };
  return map[agentUsed] || { label: agentUsed, color: 'bg-gray-700 text-gray-300 border-gray-600' };
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

/**
 * MessageBubble – renders a single chat message.
 *
 * Props:
 *  - message : { id, role, content, agentUsed, script, software, os, version, timestamp, isError }
 */
export default function MessageBubble({ message }) {
  const [modalOpen, setModalOpen] = useState(false);
  const isUser = message.role === 'user';
  const badge = getAgentBadge(message.agentUsed);

  const renderers = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          language={match[1]}
          style={vscDarkPlus}
          customStyle={{ borderRadius: '0.5rem', fontSize: '0.78rem', margin: '0.5rem 0' }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <>
      <div className={`flex gap-3 px-4 py-2 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
          isUser ? 'bg-blue-600' : 'bg-gray-700'
        }`}>
          {isUser
            ? <User size={16} className="text-white" />
            : <Bot size={16} className="text-gray-300" />
          }
        </div>

        {/* Bubble */}
        <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>

          {/* Agent badge (only on assistant messages) */}
          {!isUser && badge && (
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border mb-1.5 ${badge.color}`}>
              <Bot size={10} />
              {badge.label}
            </div>
          )}

          {/* Main content bubble */}
          <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : message.isError
                ? 'bg-red-950 border border-red-800 text-red-200 rounded-tl-sm'
                : 'bg-gray-800 text-gray-100 rounded-tl-sm'
          }`}>
            {isUser ? (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <div className="prose-chat">
                <ReactMarkdown components={renderers}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Software + OS badges */}
          {!isUser && (message.software || message.os) && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {message.software && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-700/40 text-xs">
                  <Package size={10} />
                  {message.software}
                </span>
              )}
              {message.os && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-700/60 text-gray-300 border border-gray-600/40 text-xs">
                  <Globe size={10} />
                  {message.os}
                </span>
              )}
            </div>
          )}

          {/* View Install Script button */}
          {!isUser && message.script && (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/30"
            >
              <Terminal size={13} />
              View Install Script
            </button>
          )}

          {/* Timestamp */}
          <span className="text-gray-600 text-xs mt-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>

      {/* Script Modal */}
      {message.script && (
        <ScriptModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          script={message.script}
          software={message.software}
          os={message.os}
          version={message.version}
        />
      )}
    </>
  );
}
