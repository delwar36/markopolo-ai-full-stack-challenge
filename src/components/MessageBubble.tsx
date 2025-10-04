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
              ? 'bg-green-600 text-white'
              : 'bg-pure-white dark:bg-pure-gray-800 text-pure-black dark:text-pure-white border border-pure-gray-300 dark:border-pure-gray-700'
          }`}
        >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {displayText}
          {message.isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-green-500 dark:bg-green-400 ml-1 animate-pulse"></span>
          )}
        </p>
        <p className={`text-xs mt-2 ${
          isUser ? 'text-green-100' : 'text-pure-gray-500 dark:text-pure-gray-400'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
