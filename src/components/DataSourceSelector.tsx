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
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Sources</h3>
      <div className="space-y-4">
        {availableDataSources.map((dataSource) => {
          const isConnected = getDataSourceStatus(dataSource.id);
          
          return (
            <div
              key={dataSource.id}
              className={`p-5 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                isConnected
                  ? 'border-green-500 bg-green-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              onClick={() => onConnect(dataSource)}
            >
              <div className="flex items-start space-x-4">
                <span className="text-2xl flex-shrink-0">{dataSource.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-base">{dataSource.name}</h4>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{dataSource.description}</p>
                  <div className="flex items-center mt-3">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        isConnected ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-xs text-gray-500">
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {connectedSources.filter(ds => ds.connected).length > 0 && (
        <div className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 text-base">Connected Sources</h4>
          <div className="space-y-3">
            {connectedSources
              .filter(ds => ds.connected)
              .map((source) => (
                <div key={source.id} className="flex items-center space-x-3 py-1">
                  <span className="text-lg">{source.icon}</span>
                  <span className="text-sm font-medium text-blue-800">{source.name}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
