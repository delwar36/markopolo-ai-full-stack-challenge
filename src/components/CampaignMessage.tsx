'use client';

import { useState } from 'react';
import { CampaignPayload } from '@/types';
import ReactMarkdown from 'react-markdown';
import { useToast } from './ToastContainer';

interface CampaignMessageProps {
  campaign: CampaignPayload;
}

export default function CampaignMessage({ campaign }: CampaignMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { showToast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(campaign, null, 2));
      setCopied(true);
      showToast({
        type: 'success',
        title: 'Copied!',
        message: 'Campaign JSON has been copied to clipboard',
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      showToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy campaign JSON to clipboard',
        duration: 3000,
      });
    }
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRunCampaign = async () => {
    setIsRunning(true);
    
    // Show loading toast
    showToast({
      type: 'info',
      title: 'Starting Campaign',
      message: 'Please wait while we execute your campaign...',
      duration: 2000,
    });
    
    // Simulate campaign execution
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically make an API call to execute the campaign
      console.log('Running campaign:', campaign);
      
      // Show success message
      showToast({
        type: 'success',
        title: 'Campaign Started!',
        message: 'Your campaign is now running. Check your connected channels for execution status.',
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Error running campaign:', error);
      showToast({
        type: 'error',
        title: 'Campaign Failed',
        message: 'Failed to start campaign. Please check your configuration and try again.',
        duration: 5000,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const formatCampaignAsMarkdown = (campaign: CampaignPayload) => {
    return `## 🎯 Campaign Generated Successfully!

### 📊 Campaign Summary
- **Name**: ${campaign.name}
- **Channels**: ${campaign.channels.join(', ')}
- **Data Sources**: ${campaign.dataSources.join(', ')}
- **Expected Reach**: ${campaign.metrics.expectedReach.toLocaleString()}

### 👥 Audience Targeting
- **Segments**: ${campaign.audience.segments.join(', ')}
- **Demographics**: ${Object.entries(campaign.audience.demographics).map(([key, value]) => `${key}: ${value}`).join(', ')}
- **Behaviors**: ${Object.entries(campaign.audience.behaviors).map(([key, value]) => `${key}: ${value}`).join(', ')}

### ⏰ Timing Strategy
- **Duration**: ${new Date(campaign.timing.startDate).toLocaleDateString()} - ${new Date(campaign.timing.endDate).toLocaleDateString()}
- **Frequency**: ${campaign.timing.frequency}
- **Timezone**: ${campaign.timing.timezone}

### 📝 Content Strategy
${campaign.content.subject ? `- **Subject**: ${campaign.content.subject}` : ''}
- **Message**: ${campaign.content.body}
${campaign.content.cta ? `- **Call-to-Action**: ${campaign.content.cta}` : ''}

### 💰 Budget Allocation
- **Total Budget**: $${campaign.budget?.total.toLocaleString() || 'N/A'}
${campaign.budget?.perChannel ? Object.entries(campaign.budget.perChannel).map(([channel, amount]) => `- **${channel}**: $${amount.toLocaleString()}`).join('\n') : ''}

### 📈 Expected Performance
- **Reach**: ${campaign.metrics.expectedReach.toLocaleString()}
- **Engagement Rate**: ${(campaign.metrics.expectedEngagement * 100).toFixed(1)}%
- **Conversion Rate**: ${(campaign.metrics.expectedConversion * 100).toFixed(1)}%

---

### 🔧 Raw JSON Payload
\`\`\`json
${JSON.stringify(campaign, null, 2)}
\`\`\``;
  };

  const getJsonPreview = (campaign: CampaignPayload) => {
    const jsonString = JSON.stringify(campaign, null, 2);
    const lines = jsonString.split('\n');
    return lines.slice(0, 3).join('\n') + (lines.length > 3 ? '\n  ...' : '');
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="w-full max-w-xs sm:max-w-md lg:max-w-5xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 lg:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <span className="font-semibold text-gray-900 dark:text-white">Campaign Generator</span>
          </div>
          
          {/* Run Campaign Button */}
          <button
            onClick={handleRunCampaign}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 text-white rounded-lg transition-colors font-medium text-sm"
          >
            {isRunning ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Running...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Run Campaign</span>
              </>
            )}
          </button>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2 first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-2">
                  {children}
                </h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="text-sm text-gray-700 dark:text-gray-300">{children}</li>
              ),
              p: ({ children }) => (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
              ),
              code: ({ children, className }) => {
                const isJson = className?.includes('language-json');
                if (isJson) {
                  return (
                    <div className="mt-4">
                      <div className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                          <span className="text-xs font-medium text-gray-300">JSON Payload</span>
                          <div className="flex space-x-3">
                            <button
                              onClick={copyToClipboard}
                              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium transition-colors text-gray-200"
                            >
                              {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                              onClick={handleExpand}
                              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium transition-colors text-gray-200"
                            >
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </button>
                          </div>
                        </div>
                        <pre className="text-gray-100 p-4 overflow-x-auto text-xs">
                          <code>{isExpanded ? children : getJsonPreview(campaign)}</code>
                        </pre>
                      </div>
                    </div>
                  );
                }
                return (
                  <code className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="text-gray-100 p-4 overflow-x-auto text-xs bg-gray-900 rounded-lg">
                  {children}
                </pre>
              ),
              hr: () => (
                <hr className="border-gray-200 dark:border-gray-700 my-4" />
              ),
            }}
          >
            {formatCampaignAsMarkdown(campaign)}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
