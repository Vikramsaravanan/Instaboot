import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap, FileText, Database, Clock, RefreshCw,
  ChevronDown, ChevronRight, MessageSquare, LogOut, User, Plus,
} from 'lucide-react';
import { getDocuments, getSessions } from '../api/client';
import FileUpload from './FileUpload';

function timeAgo(isoString) {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch { return ''; }
}

export default function Sidebar({ sessionId, onNewSession, onSelectSession, onAnalysisComplete, user, onLogout }) {
  const [documents, setDocuments]           = useState([]);
  const [sessions, setSessions]             = useState([]);
  const [docsOpen, setDocsOpen]             = useState(true);
  const [sessionsOpen, setSessionsOpen]     = useState(true);
  const [loadingDocs, setLoadingDocs]       = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try { const d = await getDocuments(); setDocuments(d.documents || []); }
    catch {} finally { setLoadingDocs(false); }
  }, []);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try { const d = await getSessions(); setSessions(d.sessions || []); }
    catch {} finally { setLoadingSessions(false); }
  }, []);

  useEffect(() => {
    loadDocuments(); loadSessions();
    const t = setInterval(() => { loadDocuments(); loadSessions(); }, 15000);
    return () => clearInterval(t);
  }, [loadDocuments, loadSessions]);

  useEffect(() => { loadSessions(); }, [sessionId, loadSessions]);

  const getDocIcon = (type) =>
    ({ csv: '📊', json: '📋', chat: '💬' }[type] || '📄');

  // ── accordion header style ──────────────────────────────────────────────────
  const accordionBtn =
    'w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors ' +
    'text-[#6e6b88] hover:text-[#b8b5d0] hover:bg-[#1c1c22]';

  return (
    <aside className="flex flex-col h-full border-r overflow-hidden"
           style={{ background: '#13131a', borderColor: '#1e1e28' }}>

      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b flex-shrink-0" style={{ borderColor: '#1e1e28' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_0_18px_rgba(124,58,237,0.4)]"
               style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight" style={{ color: '#f0eeff' }}>Instaboot</h1>
            <p className="text-xs" style={{ color: '#6e6b88' }}>AI Assistant</p>
          </div>
        </div>
      </div>

      {/* ── Upload ── */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: '#6e6b88' }}>
          Upload Data
        </p>
        <FileUpload sessionId={sessionId} onUploadComplete={loadDocuments} onAnalysisComplete={onAnalysisComplete} />
      </div>

      {/* ── Scrollable ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">

        {/* Documents */}
        <div className="mt-3">
          <button onClick={() => setDocsOpen(v => !v)} className={accordionBtn}>
            <div className="flex items-center gap-2">
              <Database size={13} />
              <span className="text-xs font-semibold uppercase tracking-wider">Documents</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#1c1c22', color: '#6e6b88' }}>
                {documents.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {loadingDocs && <RefreshCw size={11} className="animate-spin opacity-50" />}
              {docsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </div>
          </button>

          {docsOpen && (
            <div className="mt-1 space-y-0.5">
              {documents.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <FileText size={18} className="mx-auto mb-1.5 opacity-20" style={{ color: '#6e6b88' }} />
                  <p className="text-xs" style={{ color: '#3d3a52' }}>No documents yet</p>
                </div>
              ) : documents.map(doc => (
                <div key={doc.id}
                     className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-[#1c1c22]"
                     title={doc.name}>
                  <span className="text-sm flex-shrink-0">{getDocIcon(doc.type)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate" style={{ color: '#b8b5d0' }}>{doc.name}</p>
                    <p className="text-xs" style={{ color: '#3d3a52' }}>{timeAgo(doc.created_at)}</p>
                  </div>
                  <span className="text-xs uppercase flex-shrink-0" style={{ color: '#3d3a52' }}>{doc.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div className="mt-2">
          <button onClick={() => setSessionsOpen(v => !v)} className={accordionBtn}>
            <div className="flex items-center gap-2">
              <Clock size={13} />
              <span className="text-xs font-semibold uppercase tracking-wider">History</span>
              {sessions.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#1c1c22', color: '#6e6b88' }}>
                  {sessions.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {loadingSessions && <RefreshCw size={11} className="animate-spin opacity-50" />}
              {sessionsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </div>
          </button>

          {sessionsOpen && (
            <div className="mt-1 space-y-0.5">
              {sessions.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <MessageSquare size={18} className="mx-auto mb-1.5 opacity-20" style={{ color: '#6e6b88' }} />
                  <p className="text-xs" style={{ color: '#3d3a52' }}>No history yet</p>
                </div>
              ) : sessions.slice(0, 20).map(s => {
                const active = s.session_id === sessionId;
                return (
                  <button key={s.session_id}
                    onClick={() => !active && onSelectSession && onSelectSession(s.session_id)}
                    className="w-full text-left px-2 py-2 rounded-lg transition-colors"
                    style={{
                      background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                      border: active ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                    }}
                    title={s.first_message || 'Empty session'}>
                    <div className="flex items-center gap-2">
                      <MessageSquare size={11} className="flex-shrink-0"
                        style={{ color: active ? '#a78bfa' : '#3d3a52' }} />
                      <p className="text-xs truncate flex-1"
                         style={{ color: active ? '#c4b5fd' : '#b8b5d0' }}>
                        {s.first_message
                          ? s.first_message.length > 34 ? s.first_message.slice(0, 34) + '…' : s.first_message
                          : 'Empty session'}
                      </p>
                      {active && <span style={{ color: '#7c3aed', fontSize: 8 }}>●</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 pl-[19px]">
                      <span className="text-xs" style={{ color: '#3d3a52' }}>{s.message_count} msgs</span>
                      <span style={{ color: '#3d3a52', fontSize: 10 }}>·</span>
                      <span className="text-xs" style={{ color: '#3d3a52' }}>{timeAgo(s.last_message_at)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-4 border-t flex-shrink-0 space-y-3" style={{ borderColor: '#1e1e28' }}>
        <button onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all btn-primary">
          <Plus size={15} />
          New Chat
        </button>

        {user && (
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              <User size={13} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#b8b5d0' }}>{user.name}</p>
              <p className="text-xs truncate" style={{ color: '#3d3a52' }}>{user.email}</p>
            </div>
            <button onClick={onLogout} title="Sign out" aria-label="Sign out"
              className="flex-shrink-0 transition-colors hover:text-red-400"
              style={{ color: '#3d3a52' }}>
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
