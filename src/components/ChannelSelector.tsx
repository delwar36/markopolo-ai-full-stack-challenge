'use client';

import { useState } from 'react';
import { Channel, ChannelConfig } from '@/types';
import ChannelConfigModal from './ChannelConfigModal';

interface ChannelSelectorProps {
  onSelect: (channel: Channel, config?: ChannelConfig) => void;
  selectedChannels: Channel[];
}

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

export default function ChannelSelector({ onSelect, selectedChannels }: ChannelSelectorProps) {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isChannelSelected = (id: string) => {
    return selectedChannels.some(ch => ch.id === id);
  };

  const handleChannelClick = (channel: Channel) => {
    const isSelected = isChannelSelected(channel.id);
    if (isSelected) {
      // If already selected, just select again (could be for reconfiguration)
      onSelect(channel);
    } else {
      // If not selected, open configuration modal
      setSelectedChannel(channel);
      setIsModalOpen(true);
    }
  };

  const handleModalSelect = (channel: Channel, config: ChannelConfig) => {
    onSelect(channel, config);
    setIsModalOpen(false);
    setSelectedChannel(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedChannel(null);
  };

  return (
    <div className="p-2">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Channels</h3>
      <div className="space-y-4">
        {availableChannels.map((channel) => {
          const isSelected = isChannelSelected(channel.id);
          
          return (
            <div
              key={channel.id}
              className={`p-5 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
              onClick={() => handleChannelClick(channel)}
            >
              <div className="flex items-start space-x-4">
                <span className="text-2xl flex-shrink-0">{channel.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-base">{channel.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{channel.description}</p>
                  <div className="flex items-center mt-3">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        isSelected ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {isSelected ? 'Selected' : 'Not Selected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      <ChannelConfigModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        channel={selectedChannel}
        onSelect={handleModalSelect}
      />
    </div>
  );
}
