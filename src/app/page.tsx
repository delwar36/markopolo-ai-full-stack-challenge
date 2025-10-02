'use client';

import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <ChatInterface 
        isSidebarOpen={isSidebarOpen} 
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
}
