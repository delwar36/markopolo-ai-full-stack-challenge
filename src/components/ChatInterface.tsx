'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Message, DataSource, Channel, DataSourceConfig, ChannelConfig } from '@/types';
import MessageBubble from './MessageBubble';
import CampaignMessage from './CampaignMessage';
import ThemeToggle from './ThemeToggle';
import DropdownSelector from './DropdownSelector';
import Chip from './Chip';
import { generateCampaignPayload } from '@/utils/campaignGenerator';
import { useChat } from '@/contexts/ChatContext';

// Available data sources
const availableDataSources: DataSource[] = [
  {
    id: 'gtm',
    name: 'Google Tag Manager',
    description: 'Track website interactions and user behavior',
    icon: '🏷️',
    connected: false,
  },
  {
    id: 'facebook-pixel',
    name: 'Facebook Pixel',
    description: 'Track conversions and optimize ad delivery',
    icon: '📘',
    connected: false,
  },
  {
    id: 'google-ads-tag',
    name: 'Google Ads Tag',
    description: 'Track Google Ads performance and conversions',
    icon: '🎯',
    connected: false,
  },
];

// Available channels
const availableChannels: Channel[] = [
  {
    id: 'email',
    name: 'Email',
    description: 'Send targeted email campaigns',
    icon: '📧',
    enabled: false,
  },
  {
    id: 'sms',
    name: 'SMS',
    description: 'Send text message notifications',
    icon: '📱',
    enabled: false,
  },
  {
    id: 'push',
    name: 'Push Notifications',
    description: 'Send mobile and web push notifications',
    icon: '🔔',
    enabled: false,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Send WhatsApp business messages',
    icon: '💬',
    enabled: false,
  },
];

interface ChatInterfaceProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export default function ChatInterface({ onSidebarToggle }: ChatInterfaceProps) {
  const { currentChat, addMessage, setCampaignOutput, connectDataSource, removeDataSource, selectChannel, removeChannel, createNewChat } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current chat data
  const messages = useMemo(() => currentChat?.messages || [], [currentChat?.messages]);
  const campaignOutput = currentChat?.campaignOutput || null;
  const connectedDataSources = useMemo(() => currentChat?.connectedDataSources || [], [currentChat?.connectedDataSources]);
  const selectedChannels = useMemo(() => currentChat?.selectedChannels || [], [currentChat?.selectedChannels]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, campaignOutput]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentChat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    addMessage(currentChat.id, userMessage);
    setInputValue('');
    setIsLoading(true);

    // Check if we should generate a campaign
    const shouldGenerateCampaign = connectedDataSources.length > 0 && selectedChannels.length > 0;

    if (shouldGenerateCampaign) {
      // Generate campaign
      setTimeout(async () => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Generating your targeted campaign based on your connected data sources and selected channels...",
          role: 'assistant',
          timestamp: new Date(),
        };
        addMessage(currentChat.id, assistantMessage);

        // Generate campaign
        const campaign = await generateCampaignPayload(connectedDataSources, selectedChannels);
        setCampaignOutput(currentChat.id, campaign);
        setIsLoading(false);
      }, 1000);
    } else {
      // Regular AI response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'll help you create a targeted campaign. Please connect your data sources and select channels to get started.",
          role: 'assistant',
          timestamp: new Date(),
        };
        addMessage(currentChat.id, assistantMessage);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleDataSourceConnect = (dataSource: DataSource, config?: DataSourceConfig) => {
    if (currentChat) {
      connectDataSource(currentChat.id, dataSource, config);
    }
  };

  const handleDataSourceRemove = (dataSource: DataSource) => {
    if (currentChat) {
      removeDataSource(currentChat.id, dataSource);
    }
  };

  const handleChannelSelect = (channel: Channel, config?: ChannelConfig) => {
    if (currentChat) {
      selectChannel(currentChat.id, channel, config);
    }
  };

  const handleChannelRemove = (channel: Channel) => {
    if (currentChat) {
      removeChannel(currentChat.id, channel);
    }
  };


  if (!currentChat) {
    return (
      <div className="flex flex-col flex-1 h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome to Markopolo Chats</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Create a new chat to get started</p>
          <button
            onClick={createNewChat}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Create New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 lg:py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Mobile hamburger menu */}
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{currentChat.title}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 min-h-0 scroll-smooth">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10 lg:mt-20 px-4">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6 text-gray-900 dark:text-white">Welcome to Markopolo Chats</h2>
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300">Connect your data sources and channels to create targeted campaigns</p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {campaignOutput && (
            <CampaignMessage campaign={campaignOutput} />
          )}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 max-w-xs shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>


        {/* Input Area */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 lg:p-6">
          {/* Input with Chips */}
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 mb-4">
            <div className="flex-1 relative">
              <div className={`flex flex-wrap items-center gap-2 ${(connectedDataSources.length > 0 && selectedChannels.length > 0) ? 'p-1.5' : 'p-3'} border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent`}>
                {/* Chips */}
                {connectedDataSources.map((dataSource) => (
                  <Chip
                    key={dataSource.id}
                    label={dataSource.name}
                    icon={dataSource.icon}
                    variant="dataSource"
                    onRemove={() => handleDataSourceRemove(dataSource)}
                  />
                ))}
                {selectedChannels.map((channel) => (
                  <Chip
                    key={channel.id}
                    label={channel.name}
                    icon={channel.icon}
                    variant="channel"
                    onRemove={() => handleChannelRemove(channel)}
                  />
                ))}

                {/* Input Field */}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={
                    connectedDataSources.length > 0 || selectedChannels.length > 0
                      ? "Describe your campaign strategy..."
                      : "Ask me about your campaign strategy..."
                  }
                  className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Send/Generate Campaign Button */}
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className={`px-4 lg:px-6 py-2 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm ${connectedDataSources.length > 0 && selectedChannels.length > 0
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isLoading
                ? 'Generating...'
                : connectedDataSources.length > 0 && selectedChannels.length > 0
                  ? 'Generate Campaign'
                  : 'Send'
              }
            </button>
          </div>

          {/* Add Data Sources and Channels */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <DropdownSelector
              type="dataSource"
              options={availableDataSources}
              selectedItems={connectedDataSources}
              onSelect={(item, config) => handleDataSourceConnect(item as DataSource, config as DataSourceConfig)}
              onRemove={(item) => handleDataSourceRemove(item as DataSource)}
            />
            <DropdownSelector
              type="channel"
              options={availableChannels}
              selectedItems={selectedChannels}
              onSelect={(item, config) => handleChannelSelect(item as Channel, config as ChannelConfig)}
              onRemove={(item) => handleChannelRemove(item as Channel)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
