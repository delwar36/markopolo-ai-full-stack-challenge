'use client';

import { DataSource } from '@/types';

interface DataSourceSelectorProps {
  onConnect: (dataSource: DataSource) => void;
  connectedSources: DataSource[];
}

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

export default function DataSourceSelector({ onConnect, connectedSources }: DataSourceSelectorProps) {
  const getDataSourceStatus = (id: string) => {
    const connected = connectedSources.find(ds => ds.id === id);
    return connected?.connected || false;
  };

  return (
    <div className="p-2">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Data Sources</h3>
      <div className="space-y-4">
        {availableDataSources.map((dataSource) => {
          const isConnected = getDataSourceStatus(dataSource.id);
          
          return (
            <div
              key={dataSource.id}
              className={`p-5 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                isConnected
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
              onClick={() => onConnect(dataSource)}
            >
              <div className="flex items-start space-x-4">
                <span className="text-2xl flex-shrink-0">{dataSource.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-base">{dataSource.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{dataSource.description}</p>
                  <div className="flex items-center mt-3">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        isConnected ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
