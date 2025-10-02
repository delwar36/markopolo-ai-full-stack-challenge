'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Message, CampaignPayload, DataSource, Channel, DataSourceConfig, ChannelConfig } from '@/types';

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  campaignOutput?: CampaignPayload;
  connectedDataSources: DataSource[];
  selectedChannels: Channel[];
}

interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  currentChat: Chat | null;
  createNewChat: () => string;
  switchToChat: (chatId: string) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  setCampaignOutput: (chatId: string, campaign: CampaignPayload) => void;
  connectDataSource: (chatId: string, dataSource: DataSource, config?: DataSourceConfig) => void;
  removeDataSource: (chatId: string, dataSource: DataSource) => void;
  selectChannel: (chatId: string, channel: Channel, config?: ChannelConfig) => void;
  removeChannel: (chatId: string, channel: Channel) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('markopolo-chats');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: Chat & { createdAt: string; updatedAt: string; messages: (Message & { timestamp: string })[] }) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((message: Message & { timestamp: string }) => ({
            ...message,
            timestamp: new Date(message.timestamp),
          })),
        }));
        setChats(parsedChats);
        
        // Set the most recent chat as current
        if (parsedChats.length > 0) {
          const mostRecent = parsedChats.reduce((latest: Chat, current: Chat) => 
            current.updatedAt > latest.updatedAt ? current : latest
          );
          setCurrentChatId(mostRecent.id);
        }
      } catch (error) {
        console.error('Error loading chats from localStorage:', error);
      }
    }
    setMounted(true);
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (mounted && chats.length > 0) {
      localStorage.setItem('markopolo-chats', JSON.stringify(chats));
    }
  }, [chats, mounted]);

  const generateChatId = () => {
    return `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateChatTitle = (messages: Message[]) => {
    if (messages.length === 0) return 'New Chat';
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
    }
    return 'New Chat';
  };

  const createNewChat = (): string => {
    const newChat: Chat = {
      id: generateChatId(),
      title: 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      connectedDataSources: [],
      selectedChannels: [],
    };

    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  const switchToChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, ...updates, updatedAt: new Date() }
        : chat
    ));
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId);
      
      // If we're deleting the current chat, switch to another one
      if (currentChatId === chatId) {
        if (filtered.length > 0) {
          setCurrentChatId(filtered[0].id);
        } else {
          setCurrentChatId(null);
        }
      }
      
      return filtered;
    });
  };

  const addMessage = (chatId: string, message: Message) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = [...chat.messages, message];
        const title = chat.title === 'New Chat' ? generateChatTitle(updatedMessages) : chat.title;
        return {
          ...chat,
          messages: updatedMessages,
          title,
          updatedAt: new Date(),
        };
      }
      return chat;
    }));
  };

  const setCampaignOutput = (chatId: string, campaign: CampaignPayload) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, campaignOutput: campaign, updatedAt: new Date() }
        : chat
    ));
  };

  const connectDataSource = (chatId: string, dataSource: DataSource, _config?: DataSourceConfig) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const isAlreadyConnected = chat.connectedDataSources.some(ds => ds.id === dataSource.id);
        if (!isAlreadyConnected) {
          return {
            ...chat,
            connectedDataSources: [...chat.connectedDataSources, dataSource],
            updatedAt: new Date(),
          };
        }
      }
      return chat;
    }));
  };

  const removeDataSource = (chatId: string, dataSource: DataSource) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? {
            ...chat,
            connectedDataSources: chat.connectedDataSources.filter(ds => ds.id !== dataSource.id),
            updatedAt: new Date(),
          }
        : chat
    ));
  };

  const selectChannel = (chatId: string, channel: Channel, _config?: ChannelConfig) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const isAlreadySelected = chat.selectedChannels.some(ch => ch.id === channel.id);
        if (!isAlreadySelected) {
          return {
            ...chat,
            selectedChannels: [...chat.selectedChannels, channel],
            updatedAt: new Date(),
          };
        }
      }
      return chat;
    }));
  };

  const removeChannel = (chatId: string, channel: Channel) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? {
            ...chat,
            selectedChannels: chat.selectedChannels.filter(ch => ch.id !== channel.id),
            updatedAt: new Date(),
          }
        : chat
    ));
  };

  const currentChat = chats.find(chat => chat.id === currentChatId) || null;

  if (!mounted) {
    return null;
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        currentChat,
        createNewChat,
        switchToChat,
        updateChat,
        deleteChat,
        addMessage,
        setCampaignOutput,
        connectDataSource,
        removeDataSource,
        selectChannel,
        removeChannel,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
