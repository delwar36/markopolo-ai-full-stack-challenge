'use client';

import { useChat } from '@/contexts/ChatContext';
import { useState } from 'react';
import Image from 'next/image';
import ThemeToggle from '../ui/ThemeToggle';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { chats, currentChatId, createNewChat, switchToChat, deleteChat } = useChat();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(true);

  const handleNewChat = () => {
    createNewChat();
    // Close drawer on mobile after creating new chat
    onClose();
  };

  const handlePinToggle = () => {
    setIsPinned(!isPinned);
  };

  const handleChatClick = (chatId: string) => {
    switchToChat(chatId);
    // Close drawer on mobile after selection
    onClose();
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(chatId);

    // Add a small delay to show the deleting state
    setTimeout(() => {
      deleteChat(chatId);
      setIsDeleting(null);
    }, 300);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

        {/* Collapsible Sidebar */}
        <div 
          className={`
            fixed lg:relative inset-y-0 left-0 z-50 bg-pure-white dark:bg-pure-black border-r border-pure-gray-300 dark:border-pure-gray-700 flex flex-col h-screen
            transform transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isOpen ? 'w-80' : (isPinned || isHovered ? 'w-80' : 'w-16')}
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Header */}
          <div className="p-4 border-b border-pure-gray-300 dark:border-pure-gray-700 bg-pure-white dark:bg-pure-black">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1">
                {/* Logo */}
                <div className="w-10 h-8 flex items-center justify-center">
                  {/* Logo Image */}
                  <Image 
                    src="/logo.png"
                    alt="Logo"
                    width={40}
                    height={32}
                  />
                </div>
                 {(isHovered || isOpen || isPinned) && (
                   <h2 className="text-lg whitespace-nowrap text-nowrap overflow-hidden font-semibold text-pure-black dark:text-pure-white">arkopolo AI</h2>
                 )}
               </div>
               <div className="flex items-center gap-2">
                 {/* Pin button - only show on desktop when expanded */}
                 {(isHovered || isOpen || isPinned) && (
                   <button
                     onClick={handlePinToggle}
                     className="hidden lg:block p-1.5 rounded-lg hover:bg-pure-gray-100 dark:hover:bg-pure-gray-700 transition-colors"
                     aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
                     title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
                   >
                     {isPinned ? (
                       <svg className="w-4 h-4 text-pure-black dark:text-pure-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
                       </svg>
                     ) : (
                       <svg className="w-4 h-4 text-gray-600 dark:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                         <path d="M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" />
                         <path d="M9 15l-4.5 4.5" />
                         <path d="M14.5 4l5.5 5.5" />
                       </svg>
                     )}
                   </button>
                 )}
                 {/* Close button for mobile */}
                 <button
                   onClick={onClose}
                   className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                   aria-label="Close sidebar"
                 >
                   <svg className="w-4 h-4 text-pure-gray-600 dark:text-pure-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
            </div>
           <button
             onClick={handleNewChat}
              className={`w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm ${(isHovered || isOpen || isPinned) ? '' : 'px-2'}`}
              title={(isHovered || isOpen || isPinned) ? "" : "New Chat"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {(isHovered || isOpen || isPinned) && <span>New Chat</span>}
           </button>
         </div>

         {/* Chat List */}
         <div className="flex-1 overflow-y-auto">
           {chats.length === 0 ? (
               <div className={`text-center text-pure-gray-500 dark:text-pure-gray-400 ${(isHovered || isOpen || isPinned) ? 'p-4' : 'p-2'}`}>
                 {(isHovered || isOpen || isPinned) && (
                   <>
                     <p className="text-sm">No chats yet</p>
                     <p className="text-xs mt-1">Create your first chat to get started</p>
                   </>
                 )}
             </div>
           ) : (
             <div className="p-2">
               {chats.map((chat) => (
                 <div
                   key={chat.id}
                   onClick={() => handleChatClick(chat.id)}
                   className={`group relative rounded-lg cursor-pointer transition-colors mb-2 ${
                     currentChatId === chat.id
                       ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                       : 'border border-pure-gray-200 dark:border-pure-gray-700 hover:bg-pure-gray-50 dark:hover:bg-pure-gray-700'
                     } ${isDeleting === chat.id ? 'opacity-50' : ''} ${(isHovered || isOpen || isPinned) ? 'p-3' : 'p-2 flex justify-center'}`}
                   >
                      {(isHovered || isOpen || isPinned) ? (
                     /* Expanded view - show full chat details */
                     <>
                       <div className="flex items-start justify-between">
                         <div className="flex-1 min-w-0">
                           <h3 className={`text-sm font-medium truncate ${
                             currentChatId === chat.id
                               ? 'text-green-900 dark:text-green-100'
                               : 'text-pure-black dark:text-pure-white'
                           }`}>
                             {chat.title}
                           </h3>
                           
                           {/* Chat Info */}
                           <div className="flex items-center space-x-2 mt-1">
                             <span className={`text-xs ${
                               currentChatId === chat.id
                                 ? 'text-green-600 dark:text-green-300'
                                 : 'text-pure-gray-500 dark:text-pure-gray-400'
                             }`}>
                               {formatDate(chat.updatedAt)}
                             </span>
                             
                             {/* Message Count */}
                             {chat.messages && chat.messages.length > 0 && (
                               <span className={`text-xs px-2 py-0.5 rounded-full ${
                                 currentChatId === chat.id
                                   ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200'
                                   : 'bg-pure-gray-100 dark:bg-pure-gray-700 text-pure-gray-600 dark:text-pure-gray-300'
                               }`}>
                                 {chat.messages.length} msg{chat.messages.length !== 1 ? 's' : ''}
                               </span>
                             )}
                           </div>
                         </div>

                         {/* Delete Button */}
                         <button
                           onClick={(e) => handleDeleteChat(chat.id, e)}
                           disabled={isDeleting === chat.id}
                           className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-pure-gray-200 dark:hover:bg-pure-gray-700 rounded text-pure-gray-600 hover:text-pure-black dark:hover:text-pure-white"
                           title="Delete chat"
                         >
                           {isDeleting === chat.id ? (
                             <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                           ) : (
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                             </svg>
                           )}
                         </button>
                       </div>

                       {/* Connected Sources & Channels */}
                       {(chat.connectedDataSources.length > 0 || chat.selectedChannels.length > 0) && (
                         <div className="flex flex-wrap gap-1 mt-2">
                           {chat.connectedDataSources.map((source) => (
                             <span
                               key={source.id}
                               className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full"
                             >
                               {source.icon} {source.name}
                             </span>
                           ))}
                           {chat.selectedChannels.map((channel) => (
                             <span
                               key={channel.id}
                               className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full"
                             >
                               {channel.icon} {channel.name}
                             </span>
                           ))}
                         </div>
                       )}
                     </>
                   ) : (
                     /* Collapsed view - just show a chat icon */
                     <div className="flex items-center justify-center">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                         currentChatId === chat.id
                           ? 'bg-green-100 dark:bg-green-800'
                           : 'bg-pure-gray-100 dark:bg-pure-gray-700'
                       }`}>
                         <svg className="w-4 h-4 text-pure-gray-600 dark:text-pure-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                         </svg>
                       </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
         </div>

         {/* Footer */}
         <div className="p-4 border-t border-pure-gray-300 dark:border-pure-gray-700 bg-pure-white dark:bg-pure-black">
             {(isHovered || isOpen || isPinned) ? (
               /* Expanded view - show chat count and theme toggle */
               <div className="space-y-3">
                 <div className="text-xs text-pure-gray-500 dark:text-pure-gray-400 text-center">
                   {chats.length} chat{chats.length !== 1 ? 's' : ''} total
                 </div>
                 <div className="flex justify-center">
                   <ThemeToggle showTitle={true} />
                 </div>
               </div>
             ) : (
               /* Collapsed view - just show theme toggle */
               <div className="flex justify-center">
                 <ThemeToggle />
               </div>
             )}
         </div>
       </div>

    </>
  );
}
