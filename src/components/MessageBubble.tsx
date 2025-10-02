'use client';

import { Message } from '@/types';
import { useState, useEffect } from 'react';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [displayText, setDisplayText] = useState(message.content);
  
  // Update display text when message content changes (for streaming)
  useEffect(() => {
    setDisplayText(message.content);
  }, [message.content]);
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div
          className={`max-w-xs sm:max-w-md lg:max-w-3xl px-3 sm:px-4 py-3 rounded-lg shadow-sm ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
          }`}
        >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {displayText}
          {message.isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-blue-500 dark:bg-blue-400 ml-1 animate-pulse"></span>
          )}
        </p>
        <p className={`text-xs mt-2 ${
          isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
