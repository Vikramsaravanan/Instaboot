import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot, FileText, Database, Clock, RefreshCw,
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
  } catch {
    return '';
  }
}

/**
 * Sidebar – shows app title, document list, file upload, and session history.
 *
 * Props:
 *  - sessionId        : current session UUID
 *  - onNewSession     : () => void
 *  - onSelectSession  : (sessionId: string) => void   — switch to an existing session
 *  - onAnalysisComplete : ({ userMessage, analysis, agentUsed }) => void
 *  - user             : { name, email } | null
 *  - onLogout         : () => void
 */
export default function Sidebar({ sessionId, onNewSession, onSelectSession, onAnalysisComplete, user, onLogout }) {
  const [documents, setDocuments]     = useState([]);
  const [sessions, setSessions]       = useState([]);
  const [docsOpen, setDocsOpen]       = useState(true);
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const data = await getDocuments();
      setDocuments(data.documents || []);
    } catch {
      // Silently fail – backend might not be ready yet
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const data = await getSessions();
      setSessions(data.sessions || []);
    } catch {
      // Silently fail
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  // Initial load + refresh every 15 seconds
  useEffect(() => {
    loadDocuments();
    loadSessions();
    const interval = setInterval(() => {
      loadDocuments();
      loadSessions();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadDocuments, loadSessions]);

  // Refresh sessions whenever the active sessionId changes
  // (covers both new session and switching sessions)
  useEffect(() => {
    loadSessions();
  }, [sessionId, loadSessions]);

  const handleUploadComplete = () => loadDocuments();

  const handleSelectSession = (sid) => {
    if (sid === sessionId) return; // already active
    if (onSelectSession) onSelectSession(sid);
  };

  const getDocIcon = (type) => {
    switch (type) {
      case 'csv':  return '📊';
      case 'json': return '📋';
      case 'chat': return '💬';
      default:     return '📄';
    }
  };

  return (
    <aside className="flex flex-col h-full bg-gray-900 border-r border-gray-800 overflow-hidden">

      {/* ── Logo / Title ── */}
      <div className="px-5 py-5 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Instaboot</h1>
            <p className="text-gray-500 text-xs">AI Assistant</p>
          </div>
        </div>
      </div>

      {/* ── Upload section ── */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2 px-1">
          Upload Data
        </p>
        <FileUpload
          sessionId={sessionId}
          onUploadComplete={handleUploadComplete}
          onAnalysisComplete={onAnalysisComplete}
        />
      </div>

      {/* ── Scrollable content area ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">

        {/* ── Documents accordion ── */}
        <div className="mt-2">
          <button
            onClick={() => setDocsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-2 py-1.5 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Database size={14} />
              <span className="text-xs font-medium uppercase tracking-wider">Documents</span>
              <span className="bg-gray-700 text-gray-400 text-xs px-1.5 py-0.5 rounded-full">
                {documents.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {loadingDocs && <RefreshCw size={11} className="animate-spin text-gray-600" />}
              {docsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </div>
          </button>

          {docsOpen && (
            <div className="mt-1 space-y-0.5">
              {documents.length === 0 ? (
                <div className="px-3 py-3 text-center">
                  <FileText size={18} className="text-gray-700 mx-auto mb-1" />
                  <p className="text-gray-600 text-xs">No documents yet</p>
                  <p className="text-gray-700 text-xs">Upload a CSV or JSON file above</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-800/50 transition-colors"
                    title={doc.name}
                  >
                    <span className="text-sm flex-shrink-0">{getDocIcon(doc.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-300 text-xs font-medium truncate">{doc.name}</p>
                      <p className="text-gray-600 text-xs">{timeAgo(doc.created_at)}</p>
                    </div>
                    <span className="text-gray-700 text-xs uppercase flex-shrink-0">{doc.type}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── History accordion ── */}
        <div className="mt-2">
          <button
            onClick={() => setSessionsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-2 py-1.5 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span className="text-xs font-medium uppercase tracking-wider">History</span>
              {sessions.length > 0 && (
                <span className="bg-gray-700 text-gray-400 text-xs px-1.5 py-0.5 rounded-full">
                  {sessions.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {loadingSessions && <RefreshCw size={11} className="animate-spin text-gray-600" />}
              {sessionsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </div>
          </button>

          {sessionsOpen && (
            <div className="mt-1 space-y-0.5">
              {sessions.length === 0 ? (
                <div className="px-3 py-3 text-center">
                  <MessageSquare size={18} className="text-gray-700 mx-auto mb-1" />
                  <p className="text-gray-600 text-xs">No history yet</p>
                  <p className="text-gray-700 text-xs">Start chatting to see sessions here</p>
                </div>
              ) : (
                sessions.slice(0, 20).map((s) => {
                  const isActive = s.session_id === sessionId;
                  return (
                    <button
                      key={s.session_id}
                      onClick={() => handleSelectSession(s.session_id)}
                      className={`w-full text-left px-2 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-900/40 border border-blue-700/40'
                          : 'hover:bg-gray-800/60 border border-transparent'
                      }`}
                      title={s.first_message || 'Empty session'}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare
                          size={11}
                          className={`flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-600'}`}
                        />
                        <p className={`text-xs truncate flex-1 ${isActive ? 'text-blue-200' : 'text-gray-300'}`}>
                          {s.first_message
                            ? s.first_message.length > 35
                              ? s.first_message.slice(0, 35) + '…'
                              : s.first_message
                            : 'Empty session'}
                        </p>
                        {isActive && (
                          <span className="text-xs text-blue-500 flex-shrink-0">●</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 pl-[19px]">
                        <span className="text-gray-600 text-xs">{s.message_count} msgs</span>
                        <span className="text-gray-700 text-xs">·</span>
                        <span className="text-gray-600 text-xs">{timeAgo(s.last_message_at)}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer: New Chat + User info ── */}
      <div className="px-4 py-4 border-t border-gray-800 flex-shrink-0 space-y-3">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-blue-900/30"
        >
          <Plus size={15} />
          New Chat
        </button>

        {/* User info + logout */}
        {user && (
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <User size={13} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-200 text-xs font-medium truncate">{user.name}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              title="Sign out"
              className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
