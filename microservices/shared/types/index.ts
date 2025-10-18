// Shared types across all microservices

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  channel: string;
  dataSource: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  userId: string;
  campaignId?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  title: string;
  content: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  createdAt: Date;
  sentAt?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface KafkaEvent {
  eventType: string;
  service: string;
  timestamp: string;
  data: any;
  correlationId?: string;
}

// Event-specific types
export interface UserRegisteredEvent extends KafkaEvent {
  eventType: 'user.registered';
  data: {
    userId: string;
    email: string;
    name?: string;
  };
}

export interface CampaignCreatedEvent extends KafkaEvent {
  eventType: 'campaign.created';
  data: {
    campaignId: string;
    userId: string;
    title: string;
    channel: string;
    dataSource: string;
  };
}

export interface CampaignGeneratedEvent extends KafkaEvent {
  eventType: 'campaign.generated';
  data: {
    campaignId: string;
    userId: string;
    generatedContent: any;
    channel: string;
    dataSource: string;
  };
}

export interface MessageSentEvent extends KafkaEvent {
  eventType: 'message.sent';
  data: {
    messageId: string;
    userId: string;
    content: string;
    campaignId?: string;
  };
}

export interface NotificationSentEvent extends KafkaEvent {
  eventType: 'notification.sent';
  data: {
    notificationId: string;
    userId: string;
    type: 'email' | 'sms' | 'push' | 'whatsapp';
    title: string;
    content: string;
  };
}

// API Gateway specific events
export interface ApiRequestEvent extends KafkaEvent {
  eventType: 'api.request';
  data: {
    method: string;
    path: string;
    userId?: string;
    body?: any;
    headers?: Record<string, string>;
  };
}

export interface ApiResponseEvent extends KafkaEvent {
  eventType: 'api.response';
  data: {
    requestId: string;
    statusCode: number;
    response: any;
    duration: number;
  };
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  dependencies: {
    database: 'healthy' | 'unhealthy';
    kafka: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
  };
}

export interface AuthToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  pool?: {
    min: number;
    max: number;
  };
}

export interface KafkaConfig {
  clientId: string;
  brokers: string[];
  groupId: string;
  retry?: {
    retries: number;
    initialRetryTime: number;
    maxRetryTime: number;
  };
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

