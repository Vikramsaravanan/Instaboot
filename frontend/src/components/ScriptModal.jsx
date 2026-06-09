import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, Copy, CheckCheck, Terminal, Monitor } from 'lucide-react';

/**
 * ScriptModal – displays an install script with syntax highlighting,
 * copy-to-clipboard, and clear instructions.
 *
 * Props:
 *  - isOpen    : bool
 *  - onClose   : () => void
 *  - script    : string  (the terminal commands)
 *  - software  : string
 *  - os        : string
 *  - version   : string | null
 *  - instructions : string (optional short instructions text)
 */
export default function ScriptModal({ isOpen, onClose, script, software, os, version, instructions }) {
  const [copied, setCopied] = useState(false);

  // Reset copied state when modal opens
  useEffect(() => {
    if (isOpen) setCopied(false);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = script || '';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  // Determine the language for syntax highlighting based on OS
  const lang = os && (os.toLowerCase().includes('windows')) ? 'powershell' : 'bash';

  const softwareLabel = software
    ? software.charAt(0).toUpperCase() + software.slice(1)
    : 'Software';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-3xl mx-4 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col max-h-[90vh] animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <Terminal size={18} className="text-blue-400" />
            </div>
            <div>
              <h2 id="modal-title" className="text-white font-semibold text-lg leading-tight">
                Install {softwareLabel}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Monitor size={12} className="text-gray-400" />
                <span className="text-gray-400 text-xs">{os || 'Unknown OS'}</span>
                {version && (
                  <>
                    <span className="text-gray-600 text-xs">·</span>
                    <span className="text-green-400 text-xs font-mono">v{version.replace(/^v/, '')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Instructions banner ── */}
        {instructions && (
          <div className="mx-6 mt-4 px-4 py-3 bg-blue-900/30 border border-blue-700/50 rounded-lg text-blue-200 text-sm flex-shrink-0">
            <strong className="text-blue-300">Instructions: </strong>{instructions}
          </div>
        )}

        {/* ── Paste hint ── */}
        <div className="mx-6 mt-3 flex-shrink-0">
          <p className="text-gray-400 text-sm">
            Copy the script below and paste it in your terminal{os && os.toLowerCase().includes('windows') ? ' (PowerShell as Administrator)' : ''}.
          </p>
        </div>

        {/* ── Code block ── */}
        <div className="flex-1 overflow-auto mx-6 mt-3 mb-2 rounded-xl border border-gray-700 relative group">
          <SyntaxHighlighter
            language={lang}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1.25rem',
              background: '#0d1117',
              fontSize: '0.8rem',
              lineHeight: '1.6',
              borderRadius: '0.75rem',
              minHeight: '120px',
            }}
            showLineNumbers={false}
            wrapLongLines
          >
            {script || '# No script available'}
          </SyntaxHighlighter>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700 flex-shrink-0">
          <p className="text-gray-500 text-xs">
            Always review scripts before running them.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all duration-200 ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {copied ? (
                <>
                  <CheckCheck size={15} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={15} />
                  Copy Script
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
