'use client';

import { useState } from 'react';
import { DataSource, DataSourceConfig } from '@/types';
import Modal from './Modal';

interface DataSourceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSource: DataSource | null;
  onConnect: (dataSource: DataSource, config: DataSourceConfig) => void;
}

export default function DataSourceConfigModal({ isOpen, onClose, dataSource, onConnect }: DataSourceConfigModalProps) {
  const [config, setConfig] = useState<DataSourceConfig>({});

  if (!dataSource) return null;

  const handleConnect = () => {
    onConnect(dataSource, config);
    setConfig({});
    onClose();
  };

  const renderConfigFields = () => {
    switch (dataSource.id) {
      case 'gtm':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Google Tag Manager Container ID
              </label>
              <input
                type="text"
                value={config.containerId || ''}
                onChange={(e) => setConfig({ ...config, containerId: e.target.value })}
                placeholder="GTM-XXXXXXX"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={config.websiteUrl || ''}
                onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
          </div>
        );

      case 'facebook-pixel':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Facebook Pixel ID
              </label>
              <input
                type="text"
                value={config.pixelId || ''}
                onChange={(e) => setConfig({ ...config, pixelId: e.target.value })}
                placeholder="123456789012345"
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
                placeholder="Enter your Facebook access token"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
          </div>
        );

      case 'google-ads':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Google Ads Customer ID
              </label>
              <input
                type="text"
                value={config.customerId || ''}
                onChange={(e) => setConfig({ ...config, customerId: e.target.value })}
                placeholder="123-456-7890"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Conversion Tracking ID
              </label>
              <input
                type="text"
                value={config.conversionId || ''}
                onChange={(e) => setConfig({ ...config, conversionId: e.target.value })}
                placeholder="AW-XXXXXXXXX"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
          </div>
        );

      case 'shopify':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                Shopify Store URL
              </label>
              <input
                type="url"
                value={config.storeUrl || ''}
                onChange={(e) => setConfig({ ...config, storeUrl: e.target.value })}
                placeholder="https://your-store.myshopify.com"
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
                placeholder="Enter your Shopify API key"
                className="w-full px-3 py-2 border border-pure-gray-300 dark:border-pure-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pure-black bg-pure-white dark:bg-pure-gray-700 text-pure-black dark:text-pure-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pure-gray-700 dark:text-pure-gray-300 mb-2">
                API Secret
              </label>
              <input
                type="password"
                value={config.apiSecret || ''}
                onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                placeholder="Enter your Shopify API secret"
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
                Connection URL
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Configure ${dataSource.name}`} size="md">
      <div className="space-y-6">
        {/* Data Source Info */}
        <div className="flex items-start space-x-4 p-4 bg-pure-gray-50 dark:bg-pure-gray-700 rounded-lg">
          <span className="text-3xl flex-shrink-0">{dataSource.icon}</span>
          <div>
            <h3 className="font-semibold text-pure-black dark:text-pure-white">{dataSource.name}</h3>
            <p className="text-sm text-pure-gray-600 dark:text-pure-gray-300 mt-1">{dataSource.description}</p>
          </div>
        </div>

        {/* Configuration Fields */}
        <div>
          <h4 className="text-lg font-medium text-pure-black dark:text-pure-white mb-4">Connection Settings</h4>
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
            onClick={handleConnect}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Connect
          </button>
        </div>
      </div>
    </Modal>
  );
}
