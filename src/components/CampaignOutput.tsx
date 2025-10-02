'use client';

import { useState } from 'react';
import { CampaignPayload } from '@/types';

interface CampaignOutputProps {
  campaign: CampaignPayload;
}

export default function CampaignOutput({ campaign }: CampaignOutputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(campaign, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Campaign Output</h3>
        <div className="flex space-x-3">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Campaign Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Channels</h4>
            <p className="text-white text-sm">{campaign.channels.join(', ')}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Data Sources</h4>
            <p className="text-white text-sm">{campaign.dataSources.join(', ')}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Expected Reach</h4>
            <p className="text-white text-sm font-semibold">{campaign.metrics.expectedReach.toLocaleString()}</p>
          </div>
        </div>

        {/* Audience & Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Audience Segments</h4>
            <div className="space-y-2">
              {campaign.audience.segments.map((segment, index) => (
                <span key={index} className="inline-block bg-blue-600 text-xs px-3 py-1 rounded-full mr-2 mb-2 font-medium">
                  {segment}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Timing</h4>
            <p className="text-sm text-white mb-1">
              {new Date(campaign.timing.startDate).toLocaleDateString()} - {new Date(campaign.timing.endDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-400">Frequency: {campaign.timing.frequency}</p>
          </div>
        </div>

        {/* Content Preview */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Content Preview</h4>
          <div className="space-y-3">
            {campaign.content.subject && (
              <div className="bg-gray-700 p-3 rounded">
                <span className="text-xs text-gray-400 font-medium">Subject: </span>
                <span className="text-white text-sm">{campaign.content.subject}</span>
              </div>
            )}
            <div className="bg-gray-700 p-3 rounded">
              <span className="text-xs text-gray-400 font-medium">Message: </span>
              <span className="text-white text-sm">{campaign.content.body}</span>
            </div>
            {campaign.content.cta && (
              <div className="bg-gray-700 p-3 rounded">
                <span className="text-xs text-gray-400 font-medium">CTA: </span>
                <span className="text-blue-400 text-sm font-medium">{campaign.content.cta}</span>
              </div>
            )}
          </div>
        </div>

        {/* Full JSON Output */}
        {isExpanded && (
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Full JSON Payload</h4>
            <pre className="text-xs text-gray-300 overflow-x-auto bg-gray-900 p-4 rounded border border-gray-600">
              {JSON.stringify(campaign, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
