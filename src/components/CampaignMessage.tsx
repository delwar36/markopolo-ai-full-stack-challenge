'use client';

import { useState } from 'react';
import { CampaignPayload } from '@/types';
import ReactMarkdown from 'react-markdown';

interface CampaignMessageProps {
  campaign: CampaignPayload;
}

export default function CampaignMessage({ campaign }: CampaignMessageProps) {
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
      <div className="max-w-4xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">🤖</span>
          <span className="font-semibold text-gray-900 dark:text-white">Campaign Generator</span>
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
                              onClick={() => setIsExpanded(!isExpanded)}
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
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium transition-colors text-gray-200"
                        >
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </button>
                      </div>
                    </div>
                    <pre className="text-gray-100 p-4 overflow-x-auto text-xs">
                      {isExpanded ? children : getJsonPreview(campaign)}
                    </pre>
                  </div>
                </div>
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
