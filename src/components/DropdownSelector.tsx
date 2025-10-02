'use client';

import { useState, useRef, useEffect } from 'react';
import { DataSource, Channel, DataSourceConfig, ChannelConfig } from '@/types';
import DataSourceConfigModal from './DataSourceConfigModal';
import ChannelConfigModal from './ChannelConfigModal';

interface DropdownSelectorProps {
  type: 'dataSource' | 'channel';
  options: (DataSource | Channel)[];
  selectedItems: (DataSource | Channel)[];
  onSelect: (item: DataSource | Channel, config?: DataSourceConfig | ChannelConfig) => void;
  onRemove: (item: DataSource | Channel) => void;
}

export default function DropdownSelector({ 
  type, 
  options, 
  selectedItems, 
  onSelect, 
  onRemove 
}: DropdownSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DataSource | Channel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (option: DataSource | Channel) => {
    const isSelected = selectedItems.some(item => item.id === option.id);
    
    if (isSelected) {
      // If already selected, remove it
      onRemove(option);
    } else {
      // If not selected, open configuration modal
      setSelectedOption(option);
      setIsModalOpen(true);
    }
    setIsOpen(false);
  };

  const handleModalConfirm = (option: DataSource | Channel, config?: DataSourceConfig | ChannelConfig) => {
    onSelect(option, config);
    setIsModalOpen(false);
    setSelectedOption(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOption(null);
  };

  const getIcon = () => {
    return type === 'dataSource' ? '📊' : '📡';
  };

  const getLabel = () => {
    return type === 'dataSource' ? 'Data Sources' : 'Channels';
  };

  const getButtonText = () => {
    const count = selectedItems.length;
    if (count === 0) return `+ ${getLabel()}`;
    return `${getLabel()} (${count})`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Add Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${selectedItems.length> 0? 'bg-gray-100 dark:bg-gray-700':''} flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600`}
      >
        <span className="text-lg">{getIcon()}</span>
        <span>{getButtonText()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Select {getLabel()}
            </h3>
            <div className="space-y-2">
              {options.map((option) => {
                const isSelected = selectedItems.some(item => item.id === option.id);
                return (
                  <div
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{option.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {option.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modals */}
      {type === 'dataSource' && selectedOption && (
        <DataSourceConfigModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          dataSource={selectedOption as DataSource}
          onConnect={handleModalConfirm}
        />
      )}
      
      {type === 'channel' && selectedOption && (
        <ChannelConfigModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          channel={selectedOption as Channel}
          onSelect={handleModalConfirm}
        />
      )}
    </div>
  );
}
