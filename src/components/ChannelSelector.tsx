'use client';

import { Channel } from '@/types';

interface ChannelSelectorProps {
  onSelect: (channel: Channel) => void;
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
  const isChannelSelected = (id: string) => {
    return selectedChannels.some(ch => ch.id === id);
  };

  return (
    <div className="p-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Channels</h3>
      <div className="space-y-4">
        {availableChannels.map((channel) => {
          const isSelected = isChannelSelected(channel.id);
          
          return (
            <div
              key={channel.id}
              className={`p-5 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              onClick={() => onSelect(channel)}
            >
              <div className="flex items-start space-x-4">
                <span className="text-2xl flex-shrink-0">{channel.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-base">{channel.name}</h4>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{channel.description}</p>
                  <div className="flex items-center mt-3">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        isSelected ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-xs text-gray-500">
                      {isSelected ? 'Selected' : 'Not Selected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedChannels.length > 0 && (
        <div className="mt-8 p-5 bg-purple-50 rounded-xl border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-3 text-base">Selected Channels</h4>
          <div className="space-y-3">
            {selectedChannels.map((channel) => (
              <div key={channel.id} className="flex items-center space-x-3 py-1">
                <span className="text-lg">{channel.icon}</span>
                <span className="text-sm font-medium text-purple-800">{channel.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
