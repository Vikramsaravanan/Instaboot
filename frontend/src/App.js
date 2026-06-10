import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useChat } from './hooks/useChat';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

// ── Protected route wrapper ───────────────────────────────────────────────────
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ── Main chat layout ──────────────────────────────────────────────────────────
function ChatLayout() {
  const { user, logout } = useAuth();
  const { messages, isLoading, sessionId, send, newSession, selectSession, injectMessages } = useChat(user?.id);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
      <div className="flex-shrink-0 h-full" style={{ width: '280px' }} aria-label="Sidebar">
        <Sidebar
          sessionId={sessionId}
          onNewSession={newSession}
          onSelectSession={selectSession}
          onAnalysisComplete={injectMessages}
          user={user}
          onLogout={logout}
        />
      </div>
      <div className="flex-1 min-w-0 h-full">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSend={send}
          onNewChat={newSession}
        />
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute user={user}>
              <ChatLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
