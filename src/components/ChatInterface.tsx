'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Message, DataSource, Channel, DataSourceConfig, ChannelConfig } from '@/types';
import MessageBubble from './MessageBubble';
import CampaignMessage from './CampaignMessage';
import ThemeToggle from './ThemeToggle';
import DropdownSelector from './DropdownSelector';
import DataSourceConfigModal from './DataSourceConfigModal';
import ChannelConfigModal from './ChannelConfigModal';
import Chip from './Chip';
import { generateCampaignPayload } from '@/utils/campaignGenerator';
import { useChat } from '@/contexts/ChatContext';
import { Chat } from '@/contexts/ChatContext';

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
  const {
    currentChat,
    tempDataSources,
    tempChannels,
    addMessage,
    setCampaignOutput,
    connectDataSource,
    removeDataSource,
    selectChannel,
    removeChannel,
    createNewChat,
    addTempDataSource,
    removeTempDataSource,
    addTempChannel,
    removeTempChannel
  } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataSourceModalOpen, setIsDataSourceModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current chat data
  const messages = useMemo(() => currentChat?.messages || [], [currentChat?.messages]);
  const campaignOutput = currentChat?.campaignOutput || null;
  const connectedDataSources = useMemo(() => {
    return currentChat?.connectedDataSources || tempDataSources;
  }, [currentChat?.connectedDataSources, tempDataSources]);
  const selectedChannels = useMemo(() => {
    return currentChat?.selectedChannels || tempChannels;
  }, [currentChat?.selectedChannels, tempChannels]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, campaignOutput]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;


    if (!currentChat) {
      // Create a new chat
      const newChat = {
        id: generateChatId(),
        title: inputValue.trim() || "New Chat",
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        connectedDataSources: connectedDataSources,
        selectedChannels: selectedChannels,
      };

      createNewChat(newChat);

      // Process message for this newly created chat
      processMessage(newChat.id, inputValue);
    } else {
      // Process message for existing chat
      processMessage(currentChat.id, inputValue);
    }
  };

  const processMessage = async (chatId: string, messageContent: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: "user",
      timestamp: new Date(),
    };

    addMessage(chatId, userMessage);
    setInputValue("");
    setIsLoading(true);

    // Check if we should generate a campaign
    const shouldGenerateCampaign =
      connectedDataSources.length > 0 && selectedChannels.length > 0;

    if (shouldGenerateCampaign) {
      // Simulate AI response
      setTimeout(async () => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "Generating your targeted campaign based on your connected data sources and selected channels...",
          role: "assistant",
          timestamp: new Date(),
        };
        addMessage(chatId, assistantMessage);

        // Actually generate campaign
        const campaign = await generateCampaignPayload(
          connectedDataSources,
          selectedChannels
        );
        setCampaignOutput(chatId, campaign);
        setIsLoading(false);
      }, 1000);
    } else {
      // Regular AI response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "I'll help you create a targeted campaign. Please connect your data sources and select channels to get started.",
          role: "assistant",
          timestamp: new Date(),
        };
        addMessage(chatId, assistantMessage);
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
    } else {
      removeTempDataSource(dataSource);
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
    } else {
      removeTempChannel(channel);
    }
  };

  const handleEmptyDataSourceClick = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setIsDataSourceModalOpen(true);
  };

  const handleEmptyChannelClick = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsChannelModalOpen(true);
  };

  const handleDataSourceModalConnect = (dataSource: DataSource, config?: DataSourceConfig) => {
    if (currentChat) {
      connectDataSource(currentChat.id, dataSource, config);
    } else {
      addTempDataSource(dataSource, config);
    }

    setIsDataSourceModalOpen(false);
    setSelectedDataSource(null);
  };

  const handleChannelModalSelect = (channel: Channel, config?: ChannelConfig) => {
    if (currentChat) {
      selectChannel(currentChat.id, channel, config);
    } else {
      addTempChannel(channel, config);
    }

    setIsChannelModalOpen(false);
    setSelectedChannel(null);
  };

  const handleDataSourceModalClose = () => {
    setIsDataSourceModalOpen(false);
    setSelectedDataSource(null);
  };

  const handleChannelModalClose = () => {
    setIsChannelModalOpen(false);
    setSelectedChannel(null);
  };


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
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{currentChat?.title}</h1>
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
            <div className="flex flex-col items-center justify-center px-4 py-8 min-h-[95%]">
              {/* Empty State - Perplexity Style */}
              <div className="flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-4xl">
                  {/* Main Input Area */}
                  <div className="relative mb-8">
                    <div className="flex items-center gap-2 p-4 rounded-2xl bg-gray-800 dark:bg-gray-800 shadow-lg border border-gray-700 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                      {/* Left Icons */}
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-gray-700 dark:bg-gray-700">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <div className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="w-full flex flex-wrap items-center gap-2">
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
                          disabled={isLoading}
                          className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
                        />

                      </div>

                      {/* Right Icons */}
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </div>
                        <div className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isLoading}
                          className="px-6 py-2 bg-gray-600 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500 disabled:bg-gray-700 dark:disabled:bg-gray-700 text-white rounded-xl transition-colors font-medium text-sm disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Data Sources and Channels Selection */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <div className="flex-1 max-w-xs">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Connect Data Sources</h3>
                      <div className="space-y-2">
                        {availableDataSources.slice(0, 3).map((source) => (
                          <button
                            key={source.id}
                            onClick={() => handleEmptyDataSourceClick(source)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            <span className="text-xl">{source.icon}</span>
                            <div>
                              <div className="font-medium text-sm text-gray-900 dark:text-white">{source.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{source.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 max-w-xs">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Select Channels</h3>
                      <div className="space-y-2">
                        {availableChannels.slice(0, 3).map((channel) => (
                          <button
                            key={channel.id}
                            onClick={() => handleEmptyChannelClick(channel)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            <span className="text-xl">{channel.icon}</span>
                            <div>
                              <div className="font-medium text-sm text-gray-900 dark:text-white">{channel.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{channel.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Modals for Empty State */}
              {selectedDataSource && (
                <DataSourceConfigModal
                  isOpen={isDataSourceModalOpen}
                  onClose={handleDataSourceModalClose}
                  dataSource={selectedDataSource}
                  onConnect={handleDataSourceModalConnect}
                />
              )}

              {selectedChannel && (
                <ChannelConfigModal
                  isOpen={isChannelModalOpen}
                  onClose={handleChannelModalClose}
                  channel={selectedChannel}
                  onSelect={handleChannelModalSelect}
                />
              )}
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
        {messages.length > 0 && <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 lg:p-6">
          {/* Input with Chips */}
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 mb-4">
            <div className="flex-1 relative">
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-gray-800 dark:bg-gray-800 shadow-lg border border-gray-700 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                {/* Left Icons */}
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-gray-700 dark:bg-gray-700">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                </div>

                <div className="w-full flex flex-wrap items-center gap-2">
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
                    disabled={isLoading}
                    className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
                  />

                </div>


                {/* Right Icons */}
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  <div className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="px-6 py-2 bg-gray-600 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500 disabled:bg-gray-700 dark:disabled:bg-gray-700 text-white rounded-xl transition-colors font-medium text-sm disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>

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
        </div>}
      </div>
    </div>
  );
}

const generateChatId = () => {
  return `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

