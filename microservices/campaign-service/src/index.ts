import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { KafkaService } from '../../shared/utils/kafka';
import { 
  KafkaConfig, 
  KafkaEvent,
  ApiRequestEvent, 
  ApiResponseEvent,
  CampaignCreatedEvent,
  CampaignGeneratedEvent
} from '../../shared/types';

dotenv.config();

const app = express();
const port = process.env['PORT'] || 3003;

// Kafka configuration
const kafkaConfig: KafkaConfig = {
  clientId: 'campaign-service',
  brokers: (process.env['KAFKA_BROKERS'] || 'localhost:9092').split(','),
  groupId: 'campaign-service-group'
};

// Initialize Kafka service
const kafkaService = new KafkaService(kafkaConfig, 'campaign-service');

// Mock database (in production, use PostgreSQL)
const campaigns = new Map<string, any>();
let campaignCounter = 1;

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
    service: 'campaign-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    architecture: 'event-driven'
  });
});

// Event handlers
const handleCampaignCreate = async (event: KafkaEvent) => {
  const apiEvent = event as ApiRequestEvent;
  try {
    const { data } = apiEvent;
    const { userId, body } = data;
    
    // Create campaign
    const campaignId = `campaign_${campaignCounter++}`;
    const campaign = {
      id: campaignId,
      userId: userId || 'user_123',
      title: body.title || 'Untitled Campaign',
      description: body.description || '',
      channel: body.channel || 'email',
      dataSource: body.dataSource || 'csv',
      status: 'draft',
      targetAudience: body.targetAudience || 'general',
      budget: body.budget || 1000,
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    campaigns.set(campaignId, campaign);
    
    // Publish campaign created event
    const campaignCreatedEvent: CampaignCreatedEvent = {
      eventType: 'campaign.created',
      service: 'campaign-service',
      timestamp: new Date().toISOString(),
      correlationId: apiEvent.correlationId || '',
      data: {
        campaignId,
        userId: campaign.userId,
        title: campaign.title,
        channel: campaign.channel,
        dataSource: campaign.dataSource
      }
    };
    
    await kafkaService.publishEvent('campaign.created', campaignCreatedEvent);
    
    // Send response back to API Gateway
    const responseEvent: ApiResponseEvent = {
      eventType: 'api.response',
      service: 'campaign-service',
      timestamp: new Date().toISOString(),
      correlationId: apiEvent.correlationId || '',
      data: {
        requestId: apiEvent.correlationId || '',
        statusCode: 201,
        response: {
          success: true,
          data: campaign,
          message: 'Campaign created successfully'
        },
        duration: Date.now() - new Date(apiEvent.timestamp).getTime()
      }
    };
    
    await kafkaService.publishEvent('api.responses', responseEvent);
    
  } catch (error) {
    console.error('Error handling campaign create:', error);
    
    // Send error response
    const errorResponseEvent: ApiResponseEvent = {
      eventType: 'api.response',
      service: 'campaign-service',
      timestamp: new Date().toISOString(),
      correlationId: apiEvent.correlationId || '',
      data: {
        requestId: apiEvent.correlationId || '',
        statusCode: 500,
        response: {
          success: false,
          error: 'Internal Server Error',
          message: 'Failed to create campaign'
        },
        duration: Date.now() - new Date(apiEvent.timestamp).getTime()
      }
    };
    
    await kafkaService.publishEvent('api.responses', errorResponseEvent);
  }
};

const handleCampaignGet = async (event: KafkaEvent) => {
  const apiEvent = event as ApiRequestEvent;
  try {
    const { data } = apiEvent;
    const campaignId = data.path.split('/').pop();
    
    const campaign = campaigns.get(campaignId!);
    
    if (!campaign) {
      const responseEvent: ApiResponseEvent = {
        eventType: 'api.response',
        service: 'campaign-service',
        timestamp: new Date().toISOString(),
        correlationId: apiEvent.correlationId || '',
        data: {
          requestId: apiEvent.correlationId || '',
          statusCode: 404,
          response: {
            success: false,
            error: 'Not Found',
            message: 'Campaign not found'
          },
          duration: Date.now() - new Date(apiEvent.timestamp).getTime()
        }
      };
      
      await kafkaService.publishEvent('api.responses', responseEvent);
      return;
    }
    
    const responseEvent: ApiResponseEvent = {
      eventType: 'api.response',
      service: 'campaign-service',
      timestamp: new Date().toISOString(),
      correlationId: apiEvent.correlationId || '',
      data: {
        requestId: apiEvent.correlationId || '',
        statusCode: 200,
        response: {
          success: true,
          data: campaign
        },
        duration: Date.now() - new Date(apiEvent.timestamp).getTime()
      }
    };
    
    await kafkaService.publishEvent('api.responses', responseEvent);
    
  } catch (error) {
    console.error('Error handling campaign get:', error);
  }
};

const handleCampaignList = async (event: KafkaEvent) => {
  const apiEvent = event as ApiRequestEvent;
  try {
    const { data } = apiEvent;
    const userId = data.userId || 'user_123';
    
    const userCampaigns = Array.from(campaigns.values())
      .filter(campaign => campaign.userId === userId);
    
    const responseEvent: ApiResponseEvent = {
      eventType: 'api.response',
      service: 'campaign-service',
      timestamp: new Date().toISOString(),
      correlationId: apiEvent.correlationId || '',
      data: {
        requestId: apiEvent.correlationId || '',
        statusCode: 200,
        response: {
          success: true,
          data: userCampaigns,
          pagination: {
            page: 1,
            limit: userCampaigns.length,
            total: userCampaigns.length,
            totalPages: 1
          }
        },
        duration: Date.now() - new Date(apiEvent.timestamp).getTime()
      }
    };
    
    await kafkaService.publishEvent('api.responses', responseEvent);
    
  } catch (error) {
    console.error('Error handling campaign list:', error);
  }
};

const handleCampaignUpdate = async (event: KafkaEvent) => {
  const apiEvent = event as ApiRequestEvent;
  try {
    const { data } = apiEvent;
    const campaignId = data.path.split('/').pop();
    const campaign = campaigns.get(campaignId!);
    
    if (!campaign) {
      const responseEvent: ApiResponseEvent = {
        eventType: 'api.response',
        service: 'campaign-service',
        timestamp: new Date().toISOString(),
        correlationId: apiEvent.correlationId || '',
        data: {
          requestId: apiEvent.correlationId || '',
          statusCode: 404,
          response: {
            success: false,
            error: 'Not Found',
            message: 'Campaign not found'
          },
          duration: Date.now() - new Date(apiEvent.timestamp).getTime()
        }
      };
      
      await kafkaService.publishEvent('api.responses', responseEvent);
      return;
    }
    
    // Update campaign
    const updatedCampaign = {
      ...campaign,
      ...data.body,
      updatedAt: new Date().toISOString()
    };
    
    campaigns.set(campaignId!, updatedCampaign);
    
    const responseEvent: ApiResponseEvent = {
      eventType: 'api.response',
      service: 'campaign-service',
      timestamp: new Date().toISOString(),
      correlationId: apiEvent.correlationId || '',
      data: {
        requestId: apiEvent.correlationId || '',
        statusCode: 200,
        response: {
          success: true,
          data: updatedCampaign,
          message: 'Campaign updated successfully'
        },
        duration: Date.now() - new Date(apiEvent.timestamp).getTime()
      }
    };
    
    await kafkaService.publishEvent('api.responses', responseEvent);
    
  } catch (error) {
    console.error('Error handling campaign update:', error);
  }
};

const handleCampaignDelete = async (event: KafkaEvent) => {
  const apiEvent = event as ApiRequestEvent;
  try {
    const { data } = apiEvent;
    const campaignId = data.path.split('/').pop();
    
    if (!campaigns.has(campaignId!)) {
      const responseEvent: ApiResponseEvent = {
        eventType: 'api.response',
        service: 'campaign-service',
        timestamp: new Date().toISOString(),
        correlationId: apiEvent.correlationId || '',
        data: {
          requestId: apiEvent.correlationId || '',
          statusCode: 404,
          response: {
            success: false,
            error: 'Not Found',
            message: 'Campaign not found'
          },
          duration: Date.now() - new Date(apiEvent.timestamp).getTime()
        }
      };
      
      await kafkaService.publishEvent('api.responses', responseEvent);
      return;
    }
    
    campaigns.delete(campaignId!);
    
    const responseEvent: ApiResponseEvent = {
      eventType: 'api.response',
      service: 'campaign-service',
      timestamp: new Date().toISOString(),
      correlationId: apiEvent.correlationId || '',
      data: {
        requestId: apiEvent.correlationId || '',
        statusCode: 200,
        response: {
          success: true,
          message: 'Campaign deleted successfully'
        },
        duration: Date.now() - new Date(apiEvent.timestamp).getTime()
      }
    };
    
    await kafkaService.publishEvent('api.responses', responseEvent);
    
  } catch (error) {
    console.error('Error handling campaign delete:', error);
  }
};

// Handle AI-generated campaign events
const handleCampaignGenerated = async (event: KafkaEvent) => {
  const generatedEvent = event as CampaignGeneratedEvent;
  try {
    const { data } = generatedEvent;
    const campaign = campaigns.get(data.campaignId);
    
    if (campaign) {
      const updatedCampaign = {
        ...campaign,
        generatedContent: data.generatedContent,
        status: 'ready',
        updatedAt: new Date().toISOString()
      };
      
      campaigns.set(data.campaignId, updatedCampaign);
      console.log(`Campaign ${data.campaignId} updated with AI-generated content`);
    }
  } catch (error) {
    console.error('Error handling campaign generated event:', error);
  }
};

// Initialize Kafka and start server
async function startServer() {
  try {
    // Connect to Kafka
    await kafkaService.connect();
    
    // Subscribe to campaign events
    const eventHandler = async (event: KafkaEvent) => {
      switch (event.eventType) {
        case 'api.request':
          const apiEvent = event as ApiRequestEvent;
          if (apiEvent.data.path.includes('/campaigns') && apiEvent.data.method === 'POST') {
            await handleCampaignCreate(event);
          } else if (apiEvent.data.path.includes('/campaigns') && apiEvent.data.method === 'GET') {
            if (apiEvent.data.path.split('/').length > 2) {
              await handleCampaignGet(event);
            } else {
              await handleCampaignList(event);
            }
          } else if (apiEvent.data.path.includes('/campaigns') && apiEvent.data.method === 'PUT') {
            await handleCampaignUpdate(event);
          } else if (apiEvent.data.path.includes('/campaigns') && apiEvent.data.method === 'DELETE') {
            await handleCampaignDelete(event);
          }
          break;
        case 'campaign.generated':
          await handleCampaignGenerated(event);
          break;
      }
    };
    
    await kafkaService.subscribeToTopics([
      'campaign.create',
      'campaign.get', 
      'campaign.list',
      'campaign.update',
      'campaign.delete',
      'campaign.generated'
    ], eventHandler);
    
    // Start HTTP server (for health checks and direct access if needed)
    app.listen(port, () => {
      console.log(`🚀 Event-driven Campaign Service running on port ${port}`);
      console.log('📡 Architecture: Event-driven with Kafka');
      console.log('🔄 Subscribed to events:');
      console.log('  - campaign.create');
      console.log('  - campaign.get');
      console.log('  - campaign.list');
      console.log('  - campaign.update');
      console.log('  - campaign.delete');
      console.log('  - campaign.generated');
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