import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { KafkaService } from '../../shared/utils/kafka';
import { 
  KafkaConfig, 
  ApiRequestEvent, 
  ApiResponseEvent,
  CampaignGeneratedEvent
} from '../../shared/types';

dotenv.config();

const app = express();
const port = process.env['PORT'] || 3005;

// Kafka configuration
const kafkaConfig: KafkaConfig = {
  clientId: 'ai-service',
  brokers: (process.env['KAFKA_BROKERS'] || 'localhost:9092').split(','),
  groupId: 'ai-service-group'
};

// Initialize Kafka service
const kafkaService = new KafkaService(kafkaConfig, 'ai-service');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/health', (_req, res) => {
  return res.status(200).json({
    service: 'ai-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    architecture: 'event-driven'
  });
});

// Mock AI generation function
const generateCampaignContent = async (channel: string, dataSource: string, userId: string) => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const templates = {
    email: {
      subject: `🎯 Personalized Email Campaign for ${dataSource} Users`,
      content: `Hi there!

We've analyzed your ${dataSource} data and created a personalized email campaign just for you.

Key highlights:
• Targeted messaging based on user behavior
• Optimized send times for maximum engagement
• A/B testing recommendations
• Personalization tokens for dynamic content

Best regards,
Your AI Campaign Assistant`
    },
    sms: {
      content: `🚀 Your ${dataSource} SMS campaign is ready! Personalized messages, optimal timing, and high engagement rates. Check your dashboard for details.`
    },
    push: {
      title: `📱 Push Notification Campaign Ready`,
      content: `Your ${dataSource} push campaign is optimized and ready to send. Personalized content and perfect timing included!`
    }
  };
  
  return templates[channel as keyof typeof templates] || templates.email;
};

// Event handlers
const handleGenerateCampaign = async (event: ApiRequestEvent) => {
  try {
    const { data } = event;
    const { userId, body } = data;
    
    const { channel, dataSource } = body;
    
    // Generate AI content
    const generatedContent = await generateCampaignContent(channel, dataSource, userId);
    
    // Send response back to API Gateway
    const responseEvent: ApiResponseEvent = {
      eventType: 'api.response',
      service: 'ai-service',
      timestamp: new Date().toISOString(),
      correlationId: event.correlationId,
      data: {
        requestId: event.correlationId!,
        statusCode: 200,
        response: {
          success: true,
          data: {
            generatedContent,
            channel,
            dataSource,
            userId,
            generatedAt: new Date().toISOString()
          },
          message: 'Campaign generated successfully'
        },
        duration: Date.now() - new Date(event.timestamp).getTime()
      }
    };
    
    await kafkaService.publishEvent('api.responses', responseEvent);
    
  } catch (error) {
    console.error('Error handling campaign generation:', error);
    
    // Send error response
    const errorResponseEvent: ApiResponseEvent = {
      eventType: 'api.response',
      service: 'ai-service',
      timestamp: new Date().toISOString(),
      correlationId: event.correlationId,
      data: {
        requestId: event.correlationId!,
        statusCode: 500,
        response: {
          success: false,
          error: 'Internal Server Error',
          message: 'Failed to generate campaign'
        },
        duration: Date.now() - new Date(event.timestamp).getTime()
      }
    };
    
    await kafkaService.publishEvent('api.responses', errorResponseEvent);
  }
};

// Handle campaign creation events to auto-generate content
const handleCampaignCreated = async (event: any) => {
  try {
    const { data } = event;
    const { campaignId, userId, channel, dataSource } = data;
    
    console.log(`Auto-generating content for campaign ${campaignId}`);
    
    // Generate AI content
    const generatedContent = await generateCampaignContent(channel, dataSource, userId);
    
    // Publish campaign generated event
    const campaignGeneratedEvent: CampaignGeneratedEvent = {
      eventType: 'campaign.generated',
      service: 'ai-service',
      timestamp: new Date().toISOString(),
      correlationId: event.correlationId,
      data: {
        campaignId,
        userId,
        generatedContent,
        channel,
        dataSource
      }
    };
    
    await kafkaService.publishEvent('campaign.generated', campaignGeneratedEvent);
    
  } catch (error) {
    console.error('Error auto-generating campaign content:', error);
  }
};

// Initialize Kafka and start server
async function startServer() {
  try {
    // Connect to Kafka
    await kafkaService.connect();
    
    // Subscribe to AI events
    await kafkaService.subscribeToTopic('ai.generate-campaign', handleGenerateCampaign);
    await kafkaService.subscribeToTopic('campaign.created', handleCampaignCreated);
    
    // Start HTTP server (for health checks and direct access if needed)
    app.listen(port, () => {
      console.log(`🚀 Event-driven AI Service running on port ${port}`);
      console.log('📡 Architecture: Event-driven with Kafka');
      console.log('🤖 AI Features:');
      console.log('  - Campaign content generation');
      console.log('  - Auto-generation on campaign creation');
      console.log('  - Multi-channel support (email, SMS, push)');
      console.log('🔄 Subscribed to events:');
      console.log('  - ai.generate-campaign');
      console.log('  - campaign.created');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await kafkaService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await kafkaService.disconnect();
  process.exit(0);
});

// Start the server
startServer();