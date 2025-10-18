import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { Logger } from './logger';
import { KafkaEvent, KafkaConfig } from '../types';

export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private logger: Logger;

  constructor(config: KafkaConfig, serviceName: string) {
    this.logger = new Logger(serviceName);
    
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      retry: config.retry || {
        retries: 3,
        initialRetryTime: 100,
        maxRetryTime: 30000
      }
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: config.groupId });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      this.logger.info('Connected to Kafka');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka', error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.logger.info('Disconnected from Kafka');
    } catch (error) {
      this.logger.error('Failed to disconnect from Kafka', error as Error);
    }
  }

  async publishEvent(topic: string, event: KafkaEvent): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [{
          key: event.correlationId || event.eventType,
          value: JSON.stringify(event),
          timestamp: Date.now().toString()
        }]
      });
      this.logger.info(`Published event to topic ${topic}`, { eventType: event.eventType });
    } catch (error) {
      this.logger.error(`Failed to publish event to topic ${topic}`, error as Error, { event });
      throw error;
    }
  }

  async subscribeToTopics(
    topics: string[], 
    handler: (event: KafkaEvent) => Promise<void>
  ): Promise<void> {
    try {
      await this.consumer.subscribe({ topics, fromBeginning: false });
      
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
          try {
            const event: KafkaEvent = JSON.parse(message.value?.toString() || '{}');
            this.logger.info(`Received event from topic ${topic}`, { eventType: event.eventType });
            await handler(event);
          } catch (error) {
            this.logger.error(`Failed to process message from topic ${topic}`, error as Error, {
              topic,
              partition,
              offset: message.offset
            });
          }
        }
      });
      
      this.logger.info(`Subscribed to topics: ${topics.join(', ')}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topics: ${topics.join(', ')}`, error as Error);
      throw error;
    }
  }

  async publishUserRegistered(userId: string, email: string): Promise<void> {
    await this.publishEvent('user.registered', {
      eventType: 'user.registered',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      data: { userId, email }
    });
  }

  async publishCampaignCreated(campaignId: string, userId: string, campaign: any): Promise<void> {
    await this.publishEvent('campaign.created', {
      eventType: 'campaign.created',
      service: 'campaign-service',
      timestamp: new Date().toISOString(),
      data: { campaignId, userId, campaign }
    });
  }

  async publishMessageSent(messageId: string, userId: string, content: string): Promise<void> {
    await this.publishEvent('message.sent', {
      eventType: 'message.sent',
      service: 'chat-service',
      timestamp: new Date().toISOString(),
      data: { messageId, userId, content }
    });
  }

  async publishNotificationSent(notificationId: string, userId: string, type: string): Promise<void> {
    await this.publishEvent('notification.sent', {
      eventType: 'notification.sent',
      service: 'notification-service',
      timestamp: new Date().toISOString(),
      data: { notificationId, userId, type }
    });
  }
}

