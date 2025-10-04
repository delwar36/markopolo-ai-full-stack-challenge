'use client';

import { useState } from 'react';
import { DataSource, DataSourceConfig } from '@/types';
import DataSourceConfigModal from '../forms/DataSourceConfigModal';

interface DataSourceSelectorProps {
  onConnect: (dataSource: DataSource, config?: DataSourceConfig) => void;
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
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getDataSourceStatus = (id: string) => {
    const connected = connectedSources.find(ds => ds.id === id);
    return connected?.connected || false;
  };

  const handleDataSourceClick = (dataSource: DataSource) => {
    const isConnected = getDataSourceStatus(dataSource.id);
    if (isConnected) {
      // If already connected, just connect again (could be for reconfiguration)
      onConnect(dataSource);
    } else {
      // If not connected, open configuration modal
      setSelectedDataSource(dataSource);
      setIsModalOpen(true);
    }
  };

  const handleModalConnect = (dataSource: DataSource, config: DataSourceConfig) => {
    onConnect(dataSource, config);
    setIsModalOpen(false);
    setSelectedDataSource(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDataSource(null);
  };

  return (
    <div className="p-2">
      <h3 className="text-lg font-semibold text-pure-black dark:text-pure-white mb-6">Data Sources</h3>
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
              onClick={() => handleDataSourceClick(dataSource)}
            >
              <div className="flex items-start space-x-4">
                <span className="text-2xl flex-shrink-0">{dataSource.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-pure-black dark:text-pure-white text-base">{dataSource.name}</h4>
                  <p className="text-sm text-pure-gray-600 dark:text-pure-gray-300 mt-2 leading-relaxed">{dataSource.description}</p>
                  <div className="flex items-center mt-3">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        isConnected ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                    <span className="text-xs text-pure-gray-500 dark:text-pure-gray-400">
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      <DataSourceConfigModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        dataSource={selectedDataSource}
        onConnect={handleModalConnect}
      />
    </div>
  );
}
