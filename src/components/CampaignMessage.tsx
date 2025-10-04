'use client';

import { useState } from 'react';
import { CampaignPayload } from '@/types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from './ToastContainer';

interface CampaignMessageProps {
  campaign: CampaignPayload;
}

export default function CampaignMessage({ campaign }: CampaignMessageProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { showToast } = useToast();
  const { theme } = useTheme();

  // Custom style that removes background highlighting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCustomStyle = (baseStyle: Record<string, any>) => {
    const customStyle = { ...baseStyle };
    // Remove background from all token types
    Object.keys(customStyle).forEach(key => {
      if (customStyle[key] && typeof customStyle[key] === 'object') {
        customStyle[key] = {
          ...customStyle[key],
          background: 'transparent',
          backgroundColor: 'transparent',
        };
      }
    });
    return customStyle;
  };

  const copyToClipboard = async () => {
    try {
      // Filter out streamingCode from the copied JSON
      const campaignWithoutStreamingCode = { ...campaign };
      delete campaignWithoutStreamingCode.streamingCode;
      await navigator.clipboard.writeText(JSON.stringify(campaignWithoutStreamingCode, null, 2));
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

  const handleExpand = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsExpanded(!isExpanded);
    // Keep focus on the button after clicking
    setTimeout(() => {
      event.currentTarget?.focus();
    }, 0);
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
    const sections = [];
    const strSections = campaign.streamingSections || [];
    
    sections.push(`## 🎯 Campaign Generated Successfully!`);
    
    // Always show summary
    sections.push(`### 📊 Campaign Summary
- **Name**: ${campaign.name}
- **Channels**: ${campaign.channels.join(', ')}
- **Data Sources**: ${campaign.dataSources.join(', ')}
- **Expected Reach**: ${campaign.metrics.expectedReach.toLocaleString()}`);

    // Show sections based on streaming progress
    if (strSections.includes('audience') || !campaign.isStreaming) {
      sections.push(`### 👥 Audience Targeting
- **Segments**: ${campaign.audience.segments.join(', ')}
- **Demographics**: ${Object.entries(campaign.audience.demographics).map(([key, value]) => `${key}: ${value}`).join(', ')}
- **Behaviors**: ${Object.entries(campaign.audience.behaviors).map(([key, value]) => `${key}: ${value}`).join(', ')}`);
    }

    if (strSections.includes('timing') || !campaign.isStreaming) {
      sections.push(`### ⏰ Timing Strategy
- **Duration**: ${new Date(campaign.timing.startDate).toLocaleDateString()} - ${new Date(campaign.timing.endDate).toLocaleDateString()}
- **Frequency**: ${campaign.timing.frequency}
- **Timezone**: ${campaign.timing.timezone}`);
    }

    if (strSections.includes('content') || !campaign.isStreaming) {
      sections.push(`### 📝 Content Strategy
${campaign.content.subject ? `- **Subject**: ${campaign.content.subject}` : ''}
- **Message**: ${campaign.content.body}
${campaign.content.cta ? `- **Call-to-Action**: ${campaign.content.cta}` : ''}`);
    }

    if (strSections.includes('budget') || !campaign.isStreaming) {
      sections.push(`### 💰 Budget Allocation
- **Total Budget**: $${campaign.budget?.total.toLocaleString() || 'N/A'}
${campaign.budget?.perChannel ? Object.entries(campaign.budget.perChannel).map(([channel, amount]) => `- **${channel}**: $${amount.toLocaleString()}`).join('\n') : ''}`);
    }

    if (strSections.includes('metrics') || !campaign.isStreaming) {
      sections.push(`### 📈 Expected Performance
- **Reach**: ${campaign.metrics.expectedReach.toLocaleString()}
- **Engagement Rate**: ${(campaign.metrics.expectedEngagement * 100).toFixed(1)}%
- **Conversion Rate**: ${(campaign.metrics.expectedConversion * 100).toFixed(1)}%`);
    }

    // Add loading indicator if still streaming
    if (campaign.isStreaming) {
      const pendingTasks = [];
      if (!strSections.includes('audience')) pendingTasks.push('- 🔍 Analyzing audience segments...');
      if (!strSections.includes('timing')) pendingTasks.push('- ⏱️ Optimizing timing strategy...');
      if (!strSections.includes('content')) pendingTasks.push('- ✍️ Crafting personalized content...');
      if (!strSections.includes('budget')) pendingTasks.push('- 💰 Calculating budget allocation...');
      if (!strSections.includes('metrics')) pendingTasks.push('- 📊 Computing performance metrics...');
      
      if (pendingTasks.length > 0) {
        sections.push(`### 🔄 Generating...
${pendingTasks.join('\n')}`);
      }
    }

    // Always show JSON payload (streaming or complete)
    // Filter out streamingCode from the JSON output
    const campaignWithoutStreamingCode = { ...campaign };
    delete campaignWithoutStreamingCode.streamingCode;
    delete campaignWithoutStreamingCode.streamingSections;
    delete campaignWithoutStreamingCode.isStreaming;
    const jsonToDisplay = campaign.isStreaming && campaign.streamingCode 
      ? campaign.streamingCode 
      : JSON.stringify(campaignWithoutStreamingCode, null, 2);
    
    sections.push(`---
### 🔧 Raw JSON Payload
\`\`\`json
${jsonToDisplay}
\`\`\``);

    return sections.join('\n\n');
  };

  const getJsonPreview = (campaign: CampaignPayload) => {
    // Filter out streamingCode from the preview
    const campaignWithoutStreamingCode = { ...campaign };
    delete campaignWithoutStreamingCode.streamingCode;
    const jsonString = JSON.stringify(campaignWithoutStreamingCode, null, 2);
    const lines = jsonString.split('\n');
    return lines.slice(0, 3).join('\n') + (lines.length > 3 ? '\n  ...' : '');
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="w-full max-w-xs sm:max-w-md lg:max-w-5xl bg-white dark:bg-pure-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 lg:p-6 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <span className="font-semibold text-gray-900 dark:text-white">Campaign Generator</span>
            {campaign.isStreaming && (
              <div className="flex items-center space-x-1 ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Generating...</span>
              </div>
            )}
          </div>
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
                  // Use streaming code if available, otherwise use children or full JSON
                  const displayCode = campaign.isStreaming && campaign.streamingCode 
                    ? campaign.streamingCode 
                    : (isExpanded ? String(children) : getJsonPreview(campaign));
                  
                  return (
                    <div className="mt-4">
                      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            JSON Payload {campaign.isStreaming ? '(Streaming)' : ''}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={copyToClipboard}
                              className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                              title={copied ? 'Copied!' : 'Copy JSON'}
                            >
                              {copied ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={(e) => handleExpand(e)}
                              className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                              tabIndex={0}
                              title={isExpanded ? 'Collapse JSON' : 'Expand JSON'}
                            >
                              {isExpanded ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="relative">
                          <SyntaxHighlighter
                            language="json"
                            style={getCustomStyle(theme === 'dark' ? oneDark : oneLight)}
                            customStyle={{
                              margin: 0,
                              padding: '1rem',
                              fontSize: '0.75rem',
                              lineHeight: '1.4',
                              background: 'transparent',
                            }}
                            showLineNumbers={false}
                            wrapLines={true}
                            wrapLongLines={true}
                            PreTag="div"
                          >
                            {displayCode}
                          </SyntaxHighlighter>
                          {campaign.isStreaming && (
                            <span className="absolute bottom-4 right-4 inline-block w-0.5 h-4 bg-green-500 animate-pulse"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <code className="bg-pure-gray-100 dark:bg-pure-gray-700 text-pure-black dark:text-pure-white px-1.5 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="text-pure-white p-4 overflow-x-auto text-xs bg-pure-black rounded-lg">
                  {children}
                </pre>
              ),
              hr: () => (
                <hr className="border-pure-gray-300 dark:border-pure-gray-700 my-4" />
              ),
            }}
          >
            {formatCampaignAsMarkdown(campaign)}
          </ReactMarkdown>
        </div>

        {/* Run Campaign Button - Below the content */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleRunCampaign}
            disabled={isRunning || campaign.isStreaming}
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
      </div>
    </div>
  );
}
