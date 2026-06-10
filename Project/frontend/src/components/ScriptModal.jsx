import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, Copy, CheckCheck, Terminal, Monitor } from 'lucide-react';

export default function ScriptModal({ isOpen, onClose, script, software, os, version, instructions }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (isOpen) setCopied(false); }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(script || ''); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = script || '';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  const lang = os?.toLowerCase().includes('windows') ? 'powershell' : 'bash';
  const softwareLabel = software ? software.charAt(0).toUpperCase() + software.slice(1) : 'Software';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
         style={{ background: 'rgba(0,0,0,0.75)' }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}
         role="dialog" aria-modal="true" aria-labelledby="modal-title">

      <div className="relative w-full max-w-3xl mx-4 rounded-2xl flex flex-col animate-fade-in"
           style={{
             background: '#16161a',
             border: '1px solid #2a2a35',
             boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(124,58,237,0.1)',
             maxHeight: '90vh',
           }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
             style={{ borderColor: '#2a2a35' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                 style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
              <Terminal size={17} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <h2 id="modal-title" className="font-semibold text-lg leading-tight" style={{ color: '#f0eeff' }}>
                Install {softwareLabel}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Monitor size={11} style={{ color: '#6e6b88' }} />
                <span className="text-xs" style={{ color: '#6e6b88' }}>{os || 'Unknown OS'}</span>
                {version && (
                  <>
                    <span style={{ color: '#3d3a52', fontSize: 10 }}>·</span>
                    <span className="text-xs font-mono" style={{ color: '#6ee7b7' }}>v{version.replace(/^v/, '')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#6e6b88', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1c1c22'; e.currentTarget.style.color = '#f0eeff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6e6b88'; }}>
            <X size={17} />
          </button>
        </div>

        {/* Instructions banner */}
        {instructions && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl text-sm flex-shrink-0 border"
               style={{ background: 'rgba(124,58,237,0.08)', borderColor: 'rgba(124,58,237,0.2)', color: '#b8b5d0' }}>
            <strong style={{ color: '#c4b5fd' }}>Instructions: </strong>{instructions}
          </div>
        )}

        <div className="mx-6 mt-3 flex-shrink-0">
          <p className="text-sm" style={{ color: '#6e6b88' }}>
            Copy and paste into your terminal{os?.toLowerCase().includes('windows') ? ' (PowerShell as Administrator)' : ''}.
          </p>
        </div>

        {/* Code */}
        <div className="flex-1 overflow-auto mx-6 mt-3 mb-2 rounded-xl border"
             style={{ borderColor: '#2a2a35' }}>
          <SyntaxHighlighter language={lang} style={vscDarkPlus} wrapLongLines
            customStyle={{ margin: 0, padding: '1.25rem', background: '#0d1117', fontSize: '0.79rem', lineHeight: 1.65, borderRadius: '0.75rem', minHeight: 120 }}>
            {script || '# No script available'}
          </SyntaxHighlighter>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0"
             style={{ borderColor: '#2a2a35' }}>
          <p className="text-xs" style={{ color: '#3d3a52' }}>Always review scripts before running.</p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg transition-colors border"
              style={{ color: '#b8b5d0', background: '#1c1c22', borderColor: '#2a2a35' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2a2a35'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1c1c22'; }}>
              Close
            </button>
            <button onClick={handleCopy}
              className="px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all duration-200"
              style={copied ? {
                background: 'rgba(16,185,129,0.15)', color: '#6ee7b7',
                border: '1px solid rgba(16,185,129,0.3)',
              } : {
                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                color: '#fff', border: 'none',
                boxShadow: '0 0 18px rgba(124,58,237,0.35)',
              }}>
              {copied ? <><CheckCheck size={14} />Copied!</> : <><Copy size={14} />Copy Script</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
