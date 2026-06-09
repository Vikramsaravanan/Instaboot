import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot, FileText, Database, Clock, RefreshCw,
  ChevronDown, ChevronRight, MessageSquare,
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
 *  - sessionId      : current session UUID
 *  - onNewSession   : () => void
 */
export default function Sidebar({ sessionId, onNewSession }) {
  const [documents, setDocuments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [docsOpen, setDocsOpen] = useState(true);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);

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
    try {
      const data = await getSessions();
      setSessions(data.sessions || []);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    loadSessions();
    // Refresh every 30 seconds
    const interval = setInterval(() => { loadDocuments(); loadSessions(); }, 30000);
    return () => clearInterval(interval);
  }, [loadDocuments, loadSessions]);

  const handleUploadComplete = () => {
    loadDocuments();
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
            <h1 className="text-white font-bold text-base leading-tight">MultiAgent</h1>
            <p className="text-gray-500 text-xs">Chatbot</p>
          </div>
        </div>
      </div>

      {/* ── Upload section ── */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2 px-1">
          Upload Data
        </p>
        <FileUpload onUploadComplete={handleUploadComplete} />
      </div>

      {/* ── Scrollable content area ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">

        {/* Documents accordion */}
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
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-800/50 transition-colors group"
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

        {/* Sessions accordion */}
        <div className="mt-2">
          <button
            onClick={() => setSessionsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-2 py-1.5 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span className="text-xs font-medium uppercase tracking-wider">History</span>
            </div>
            {sessionsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          {sessionsOpen && (
            <div className="mt-1 space-y-0.5">
              {sessions.length === 0 ? (
                <p className="px-3 py-2 text-gray-600 text-xs text-center">No sessions yet</p>
              ) : (
                sessions.slice(0, 10).map((s) => (
                  <div
                    key={s.session_id}
                    className={`px-2 py-1.5 rounded-lg transition-colors ${
                      s.session_id === sessionId
                        ? 'bg-blue-900/40 border border-blue-700/40'
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={11} className={s.session_id === sessionId ? 'text-blue-400' : 'text-gray-600'} />
                      <p className="text-gray-400 text-xs truncate flex-1">
                        {s.first_message || 'Empty session'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 pl-5">
                      <span className="text-gray-600 text-xs">{s.message_count} msgs</span>
                      <span className="text-gray-700 text-xs">·</span>
                      <span className="text-gray-600 text-xs">{timeAgo(s.last_message_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── New Chat button ── */}
      <div className="px-4 py-4 border-t border-gray-800 flex-shrink-0">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-blue-900/30"
        >
          <MessageSquare size={15} />
          New Chat
        </button>
      </div>
    </aside>
  );
}
