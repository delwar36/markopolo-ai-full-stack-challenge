export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  connectionDetails?: {
    apiKey?: string;
    accountId?: string;
    url?: string;
  };
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface CampaignPayload {
  id: string;
  name: string;
  channels: string[];
  dataSources: string[];
  audience: {
    segments: string[];
    demographics: Record<string, string | number>;
    behaviors: Record<string, string | number>;
  };
  timing: {
    startDate: string;
    endDate: string;
    frequency: string;
    timezone: string;
  };
  content: {
    subject?: string;
    body: string;
    media?: string[];
    cta?: string;
  };
  budget?: {
    total: number;
    perChannel: Record<string, number>;
  };
  metrics: {
    expectedReach: number;
    expectedEngagement: number;
    expectedConversion: number;
  };
}

export interface ConnectionStatus {
  dataSources: DataSource[];
  channels: Channel[];
  isConnected: boolean;
}
