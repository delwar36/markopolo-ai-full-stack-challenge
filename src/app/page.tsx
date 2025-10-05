'use client';

import ChatInterface from '@/components/sections/ChatInterface';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { chats } = useChat();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle any URL parameters that need to be cleaned up
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString()) {
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

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
