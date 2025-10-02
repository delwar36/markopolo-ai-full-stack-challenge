'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, DataSource, Channel, CampaignPayload } from '@/types';
import MessageBubble from './MessageBubble';
import DataSourceSelector from './DataSourceSelector';
import ChannelSelector from './ChannelSelector';
import CampaignMessage from './CampaignMessage';
import { generateCampaignPayload } from '@/utils/campaignGenerator';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDataSources, setShowDataSources] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [campaignOutput, setCampaignOutput] = useState<CampaignPayload | null>(null);
  const [connectedDataSources, setConnectedDataSources] = useState<DataSource[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'll help you create a targeted campaign. Let me analyze your data sources and channels to generate the optimal campaign strategy.",
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleDataSourceConnect = (dataSource: DataSource) => {
    setConnectedDataSources(prev => {
      const exists = prev.find(ds => ds.id === dataSource.id);
      if (exists) {
        return prev.map(ds => 
          ds.id === dataSource.id 
            ? { ...ds, connected: !ds.connected }
            : ds
        );
      }
      return [...prev, { ...dataSource, connected: true }];
    });
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannels(prev => {
      const exists = prev.find(ch => ch.id === channel.id);
      if (exists) {
        return prev.filter(ch => ch.id !== channel.id);
      }
      return [...prev, { ...channel, enabled: true }];
    });
  };

  const handleGenerateCampaign = async () => {
    if (connectedDataSources.length === 0 || selectedChannels.length === 0) {
      alert('Please connect at least one data source and select one channel');
      return;
    }

    setIsLoading(true);
    
    // Add a message indicating campaign generation is starting
    const generatingMessage: Message = {
      id: Date.now().toString(),
      content: "Generating your targeted campaign based on your connected data sources and selected channels...",
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, generatingMessage]);
    
    // Simulate streaming campaign generation
    const campaign = await generateCampaignPayload(connectedDataSources, selectedChannels);
    setCampaignOutput(campaign);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Markopolo Chats</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDataSources(!showDataSources)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Data Sources ({connectedDataSources.filter(ds => ds.connected).length})
            </button>
            <button
              onClick={() => setShowChannels(!showChannels)}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              Channels ({selectedChannels.length})
            </button>
            <button
              onClick={handleGenerateCampaign}
              disabled={isLoading || connectedDataSources.length === 0 || selectedChannels.length === 0}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {isLoading ? 'Generating...' : 'Generate Campaign'}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {(showDataSources || showChannels) && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            {showDataSources && (
              <DataSourceSelector
                onConnect={handleDataSourceConnect}
                connectedSources={connectedDataSources}
              />
            )}
            {showChannels && (
              <ChannelSelector
                onSelect={handleChannelSelect}
                selectedChannels={selectedChannels}
              />
            )}
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <h2 className="text-3xl font-bold mb-6">Welcome to Markopolo Chats</h2>
                <p className="text-xl text-gray-600">Connect your data sources and channels to create targeted campaigns</p>
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
                <div className="bg-white border border-gray-200 rounded-xl p-5 max-w-xs shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>


          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me about your campaign strategy..."
                className="flex-1 px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
