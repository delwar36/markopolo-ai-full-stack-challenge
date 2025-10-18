import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { KafkaService } from '../../shared/utils/kafka';
import { 
  KafkaConfig, 
  KafkaEvent,
  ApiRequestEvent, 
  ApiResponseEvent} from '../../shared/types';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
      requestId?: string;
    }
  }
}

dotenv.config();

const app = express();
const port = process.env['PORT'] || 3000;

// Kafka configuration
const kafkaConfig: KafkaConfig = {
  clientId: 'api-gateway',
  brokers: (process.env['KAFKA_BROKERS'] || 'localhost:9092').split(','),
  groupId: 'api-gateway-group'
};

// Initialize Kafka service
const kafkaService = new KafkaService(kafkaConfig, 'api-gateway');

// Store for pending requests (in production, use Redis)
const pendingRequests = new Map<string, {
  res: express.Response;
  timestamp: number;
}>();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID middleware
app.use((req, _res, next) => {
  req.requestId = uuidv4();
  next();
});

// Health check route
app.get('/health', (_req, res) => {
  return res.status(200).json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    architecture: 'event-driven',
    routes: [
      '/health',
      '/auth/*',
      '/users/*',
      '/campaigns/*',
      '/chat',
      '/messages/*',
      '/generate-campaign'
    ]
  });
});

// Event-driven route handlers
const createEventHandler = (eventType: string, topic: string) => {
  return async (req: express.Request, res: express.Response) => {
    const requestId = req.requestId!;
    const startTime = Date.now();
    
    try {
      // Create API request event
      const apiRequestEvent: ApiRequestEvent = {
        eventType: 'api.request',
        service: 'api-gateway',
        timestamp: new Date().toISOString(),
        correlationId: requestId,
        data: {
          method: req.method,
          path: req.path,
          ...(req.user?.id && { userId: req.user.id }),
          body: req.body,
          headers: req.headers as Record<string, string>
        }
      };

      // Store pending request
      pendingRequests.set(requestId, {
        res,
        timestamp: startTime
      });

      // Publish event to appropriate topic
      await kafkaService.publishEvent(topic, {
        eventType,
        service: 'api-gateway',
        timestamp: new Date().toISOString(),
        correlationId: requestId,
        data: {
          ...apiRequestEvent.data,
          requestId
        }
      });

      // Set timeout for response (30 seconds)
      setTimeout(() => {
        if (pendingRequests.has(requestId)) {
          pendingRequests.delete(requestId);
          res.status(504).json({
            success: false,
            error: 'Gateway Timeout',
            message: 'Request timed out waiting for service response',
            timestamp: new Date().toISOString()
          });
        }
      }, 30000);

    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to process request',
        timestamp: new Date().toISOString()
      });
    }
  };
};

// Auth service routes
app.post('/auth/login', createEventHandler('auth.login', 'auth.login'));
app.post('/auth/register', createEventHandler('auth.register', 'auth.register'));
app.post('/auth/logout', createEventHandler('auth.logout', 'auth.logout'));
app.post('/auth/verify-email', createEventHandler('auth.verify-email', 'auth.verify-email'));
app.post('/auth/forgot-password', createEventHandler('auth.forgot-password', 'auth.forgot-password'));
app.post('/auth/reset-password', createEventHandler('auth.reset-password', 'auth.reset-password'));
app.get('/auth/me', createEventHandler('auth.me', 'auth.me'));

// User service routes
app.get('/users/:id', createEventHandler('user.get', 'user.get'));
app.put('/users/:id', createEventHandler('user.update', 'user.update'));
app.delete('/users/:id', createEventHandler('user.delete', 'user.delete'));

// Campaign service routes
app.post('/campaigns', createEventHandler('api.request', 'campaign.create'));
app.get('/campaigns/:id', createEventHandler('api.request', 'campaign.get'));
app.put('/campaigns/:id', createEventHandler('api.request', 'campaign.update'));
app.delete('/campaigns/:id', createEventHandler('api.request', 'campaign.delete'));
app.get('/campaigns', createEventHandler('api.request', 'campaign.list'));

// Chat service routes
app.post('/chat', createEventHandler('chat.send', 'chat.send'));
app.get('/chat/:id', createEventHandler('chat.get', 'chat.get'));
app.get('/chat', createEventHandler('chat.list', 'chat.list'));

// Messages service routes
app.get('/messages/:id', createEventHandler('message.get', 'message.get'));
app.get('/messages', createEventHandler('message.list', 'message.list'));

// AI service routes
app.post('/generate-campaign', createEventHandler('ai.generate-campaign', 'ai.generate-campaign'));

// Event response handler - listens for responses from services
const handleServiceResponse = async (event: KafkaEvent) => {
  const responseEvent = event as ApiResponseEvent;
  const { requestId, statusCode, response } = responseEvent.data;
  
  const pendingRequest = pendingRequests.get(requestId);
  if (pendingRequest) {
    pendingRequests.delete(requestId);
    
    const { res } = pendingRequest;
    res.status(statusCode).json({
      ...response,
      duration: Date.now() - pendingRequest.timestamp,
      timestamp: new Date().toISOString()
    });
  }
};

// Authentication middleware (simplified for event-driven)
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  // Skip auth for health check and auth routes
  if (req.path === '/health' || req.path.startsWith('/auth')) {
    return next();
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Token is required',
      timestamp: new Date().toISOString()
    });
  }
  
  // Mock token validation (in production, validate with auth service)
  if (token.startsWith('jwt_token_')) {
    req.user = { id: 'user_123', email: 'user@example.com' };
    return next();
  }
  
  return res.status(401).json({
    success: false,
    error: 'Unauthorized',
    message: 'Invalid token',
    timestamp: new Date().toISOString()
  });
};

// Apply authentication to protected routes
app.use('/users', authenticate);
app.use('/campaigns', authenticate);
app.use('/chat', authenticate);
app.use('/messages', authenticate);
app.use('/generate-campaign', authenticate);

// Rate limiting middleware (simple implementation)
const rateLimitMap = new Map();

const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    const clientRequests = rateLimitMap.get(clientId) || [];
    const validRequests = clientRequests.filter((time: number) => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        timestamp: new Date().toISOString()
      });
    }
    
    validRequests.push(now);
    rateLimitMap.set(clientId, validRequests);
    return next();
  };
};

// Apply rate limiting
app.use(rateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// Error handling
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Gateway error:', error);
  
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'Something went wrong in the API Gateway',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  return res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Initialize Kafka and start server
async function startServer() {
  try {
    // Connect to Kafka
    await kafkaService.connect();

    // Subscribe to response events
    await kafkaService.subscribeToTopics(['api.responses'], handleServiceResponse);
    
    // Start HTTP server
    app.listen(port, () => {
      console.log(`🚀 Event-driven API Gateway running on port ${port}`);
      console.log('📡 Architecture: Event-driven with Kafka');
      console.log('🔄 Available routes:');
      console.log('  GET  /health - Health check');
      console.log('  POST /auth/login - User login');
      console.log('  POST /auth/register - User registration');
      console.log('  GET  /users/:id - Get user profile');
      console.log('  POST /campaigns - Create campaign');
      console.log('  GET  /campaigns/:id - Get campaign');
      console.log('  POST /chat - Send chat message');
      console.log('  POST /generate-campaign - Generate AI campaign');
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