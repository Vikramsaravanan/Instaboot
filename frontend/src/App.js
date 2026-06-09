import React from 'react';
import { useChat } from './hooks/useChat';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

export default function App() {
  const { messages, isLoading, sessionId, send, newSession } = useChat();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">

      {/* Sidebar – fixed width */}
      <div
        className="flex-shrink-0 h-full"
        style={{ width: '280px' }}
        aria-label="Sidebar"
      >
        <Sidebar
          sessionId={sessionId}
          onNewSession={newSession}
        />
      </div>

      {/* Chat area – fills remaining space */}
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
