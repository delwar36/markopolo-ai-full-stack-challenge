'use client';

import { Message } from '@/types';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useToast } from '@/components/ui/ToastContainer';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [displayText, setDisplayText] = useState(message.content);
  const [isLaunching, setIsLaunching] = useState(false);
  const { showToast } = useToast();

  // Update display text when message content changes (for streaming)
  useEffect(() => {
    setDisplayText(message.content);
  }, [message.content]);

  // Extract campaign data from JSON
  const [campaignData, setCampaignData] = useState<{
    id?: string;
    name?: string;
    channels?: unknown[];
    dataSources?: unknown[];
    budget?: { total?: number };
    metrics?: { expectedReach?: number; expectedConversion?: number };
  } | null>(null);
  
  useEffect(() => {
    if (!isUser && !message.isStreaming && displayText.includes('```json')) {
      try {
        const jsonMatch = displayText.match(/```json\s*([\s\S]*?)```/);
        if (jsonMatch) {
          let jsonString = jsonMatch[1].trim();
          
          // Clean up common JSON issues
          // Remove trailing commas before closing braces/brackets
          jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
          
          // Remove comments
          jsonString = jsonString.replace(/\/\/.*/g, '');
          jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');
          
          // Fix unquoted property names (basic fix)
          jsonString = jsonString.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
          
          // Fix numbers with commas (like 32,180 -> 32180)
          jsonString = jsonString.replace(/(\d{1,3}(?:,\d{3})*)/g, (match) => match.replace(/,/g, ''));
          
          const parsed = JSON.parse(jsonString);
          if (parsed?.id?.includes('campaign_')) {
            setCampaignData(parsed);
          }
        }
      } catch {
        // Ignore parse errors silently
        setCampaignData(null);
      }
    }
  }, [displayText, isUser, message.isStreaming]);


  const handleLaunchCampaign = async () => {
    setIsLaunching(true);

    try {
        // Extract JSON from markdown code block
        const jsonMatch = displayText.match(/```json\s*([\s\S]*?)```/);
        if (jsonMatch) {
          let jsonString = jsonMatch[1].trim();
          
          // Clean up common JSON issues
          // Remove trailing commas before closing braces/brackets
          jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
          
          // Remove comments
          jsonString = jsonString.replace(/\/\/.*/g, '');
          jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');
          
          // Fix unquoted property names (basic fix)
          jsonString = jsonString.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
          
          // Fix numbers with commas (like 32,180 -> 32180)
          jsonString = jsonString.replace(/(\d{1,3}(?:,\d{3})*)/g, (match) => match.replace(/,/g, ''));
          
          const campaignData = JSON.parse(jsonString);

          // Here you would make an API call to launch the campaign
          console.log('Launching campaign:', campaignData);

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Show success toast
          showToast({
            type: 'success',
            title: 'Campaign Launched! 🚀',
            message: campaignData.name || 'Your campaign is now live',
            duration: 4000
          });
      }
    } catch (error) {
      console.error('Failed to launch campaign:', error);
      showToast({
        type: 'error',
        title: 'Launch Failed',
        message: 'Failed to launch campaign. Please try again.',
        duration: 5000
      });
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs sm:max-w-md lg:max-w-3xl px-3 sm:px-4 py-3 rounded-lg shadow-sm ${isUser
            ? 'bg-green-600 text-white'
            : 'bg-pure-white dark:bg-pure-gray-800 text-pure-black dark:text-pure-white border border-pure-gray-300 dark:border-pure-gray-700'
          }`}
      >
        {isUser ? (
          // User messages: plain text
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {displayText}
          </p>
        ) : (
          // Assistant messages: markdown rendering
          <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ className, children }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const inline = !match;

                  return inline ? (
                    <code
                      className="px-1.5 py-0.5 rounded bg-pure-gray-200 dark:bg-pure-gray-700 text-pure-black dark:text-pure-white font-mono text-xs"
                    >
                      {children}
                    </code>
                  ) : (
                    <SyntaxHighlighter
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      style={oneDark as any}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg !mt-2 !mb-2"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                },
                p({ children }) {
                  return <p className="mb-2 last:mb-0">{children}</p>;
                },
                ul({ children }) {
                  return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
                },
                li({ children }) {
                  return <li className="ml-2">{children}</li>;
                },
                h1({ children }) {
                  return <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>;
                },
                strong({ children }) {
                  return <strong className="font-semibold text-pure-black dark:text-pure-white">{children}</strong>;
                },
                em({ children }) {
                  return <em className="italic">{children}</em>;
                },
                a({ children, href }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      {children}
                    </a>
                  );
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-4 border-pure-gray-300 dark:border-pure-gray-600 pl-4 italic my-2">
                      {children}
                    </blockquote>
                  );
                },
              }}
            >
              {displayText}
            </ReactMarkdown>
            {message.isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-green-500 dark:bg-green-400 ml-1 animate-pulse"></span>
            )}
          </div>
        )}

        {/* Launch Campaign Card */}
        {campaignData && (
          <div className="mt-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                    {campaignData.name || 'Ready to Launch'}
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {campaignData.channels?.length || 0} channel{campaignData.channels?.length !== 1 ? 's' : ''} • {campaignData.dataSources?.length || 0} data source{campaignData.dataSources?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Campaign Key Data */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white/60 dark:bg-black/30 rounded-lg p-2 text-center">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-0.5">Budget</p>
                  <p className="text-sm font-bold text-green-900 dark:text-green-100">
                    ${(campaignData.budget?.total || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-black/30 rounded-lg p-2 text-center">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-0.5">Reach</p>
                  <p className="text-sm font-bold text-green-900 dark:text-green-100">
                    {(campaignData.metrics?.expectedReach || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-black/30 rounded-lg p-2 text-center">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-0.5">Conv. Rate</p>
                  <p className="text-sm font-bold text-green-900 dark:text-green-100">
                    {campaignData.metrics?.expectedConversion ? `${(campaignData.metrics.expectedConversion * 100).toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLaunchCampaign}
                disabled={isLaunching}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:shadow-sm"
              >
                {isLaunching ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Launch Campaign</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <p className={`text-xs mt-2 ${isUser ? 'text-green-100' : 'text-pure-gray-500 dark:text-pure-gray-400'
          }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
