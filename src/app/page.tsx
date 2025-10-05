'use client';

import ChatInterface from '@/components/sections/ChatInterface';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { chats } = useChat();

  return (
    <div className="flex h-screen">
      <Header />
      {chats.length > 0 && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
      <div className="flex-1">
        <ChatInterface
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
    </div>
  );
}
