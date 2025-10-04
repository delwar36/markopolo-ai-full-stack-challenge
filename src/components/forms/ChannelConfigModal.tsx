'use client';

import { useState } from 'react';
import { Channel, ChannelConfig } from '@/types';
import Modal from '../ui/Modal';

interface ChannelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel | null;
  onSelect: (channel: Channel, config: ChannelConfig) => void;
}

export default function ChannelConfigModal({ isOpen, onClose, channel, onSelect }: ChannelConfigModalProps) {
  const [config, setConfig] = useState<ChannelConfig>({});

  if (!channel) return null;

  const handleSelect = () => {
    onSelect(channel, config);
    setConfig({});
    onClose();
  };

  const renderConfigFields = () => {
    switch (channel.id) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Email Service Provider
              </label>
              <select
                value={config.provider || ''}
                onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              >
                <option value="">Select provider</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailchimp">Mailchimp</option>
                <option value="ses">Amazon SES</option>
                <option value="postmark">Postmark</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="Enter your email service API key"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                From Email
              </label>
              <input
                type="email"
                value={config.fromEmail || ''}
                onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                placeholder="noreply@yourcompany.com"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                SMS Service Provider
              </label>
              <select
                value={config.provider || ''}
                onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              >
                <option value="">Select provider</option>
                <option value="twilio">Twilio</option>
                <option value="aws-sns">AWS SNS</option>
                <option value="messagebird">MessageBird</option>
                <option value="vonage">Vonage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Account SID / API Key
              </label>
              <input
                type="password"
                value={config.accountSid || ''}
                onChange={(e) => setConfig({ ...config, accountSid: e.target.value })}
                placeholder="Enter your SMS service account SID or API key"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Auth Token / Secret
              </label>
              <input
                type="password"
                value={config.authToken || ''}
                onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
                placeholder="Enter your SMS service auth token or secret"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                WhatsApp Business Account ID
              </label>
              <input
                type="text"
                value={config.accountId || ''}
                onChange={(e) => setConfig({ ...config, accountId: e.target.value })}
                placeholder="Enter your WhatsApp Business Account ID"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Access Token
              </label>
              <input
                type="password"
                value={config.accessToken || ''}
                onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                placeholder="Enter your WhatsApp access token"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Phone Number ID
              </label>
              <input
                type="text"
                value={config.phoneNumberId || ''}
                onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                placeholder="Enter your WhatsApp phone number ID"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
          </div>
        );

      case 'push':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Push Service Provider
              </label>
              <select
                value={config.provider || ''}
                onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              >
                <option value="">Select provider</option>
                <option value="firebase">Firebase Cloud Messaging</option>
                <option value="onesignal">OneSignal</option>
                <option value="pusher">Pusher</option>
                <option value="web-push">Web Push Protocol</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Server Key / API Key
              </label>
              <input
                type="password"
                value={config.serverKey || ''}
                onChange={(e) => setConfig({ ...config, serverKey: e.target.value })}
                placeholder="Enter your push service server key or API key"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
          </div>
        );

      case 'ads':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Ad Platform
              </label>
              <select
                value={config.platform || ''}
                onChange={(e) => setConfig({ ...config, platform: e.target.value })}
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              >
                <option value="">Select platform</option>
                <option value="google-ads">Google Ads</option>
                <option value="facebook-ads">Facebook Ads</option>
                <option value="tiktok-ads">TikTok Ads</option>
                <option value="linkedin-ads">LinkedIn Ads</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Account ID
              </label>
              <input
                type="text"
                value={config.accountId || ''}
                onChange={(e) => setConfig({ ...config, accountId: e.target.value })}
                placeholder="Enter your ad platform account ID"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Access Token / API Key
              </label>
              <input
                type="password"
                value={config.accessToken || ''}
                onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                placeholder="Enter your ad platform access token or API key"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Service URL
              </label>
              <input
                type="url"
                value={config.url || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://api.example.com"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="Enter your API key"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Configure ${channel.name}`} size="md">
      <div className="space-y-6">
        {/* Channel Info */}
        <div className="flex items-start space-x-4 p-4 bg-pure-gray-50 dark:bg-pure-gray-700 rounded-lg">
          <span className="text-3xl flex-shrink-0">{channel.icon}</span>
          <div>
            <h3 className="font-semibold text-pure-black dark:text-pure-white">{channel.name}</h3>
            <p className="text-sm text-pure-gray-600 dark:text-pure-gray-300 mt-1">{channel.description}</p>
          </div>
        </div>

        {/* Configuration Fields */}
        <div>
          <h4 className="text-lg font-medium text-pure-black dark:text-pure-white mb-4">Channel Settings</h4>
          {renderConfigFields()}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-pure-gray-300 dark:border-pure-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 bg-pure-gray-100 dark:bg-pure-gray-700 rounded-lg hover:bg-pure-gray-200 dark:hover:bg-pure-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Select Channel
          </button>
        </div>
      </div>
    </Modal>
  );
}
