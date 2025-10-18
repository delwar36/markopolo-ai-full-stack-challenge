import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env['PORT'] || 3004;

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
  res.status(200).json({
    service: 'chat-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Chat endpoint (streaming)
app.post('/chat', async (req, res) => {
  try {
    const { messages, dataSources, channels, model = 'gpt-4o-mini' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Messages array is required'
      });
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Mock streaming response
    const mockResponse = "This is a mock streaming response from the chat service. In a real implementation, this would connect to OpenAI or another AI service.";
    
    // Simulate streaming by sending chunks
    const words = mockResponse.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      
      // Add small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all messages
app.get('/messages', (req, res) => {
  const { searchParams } = new URL(req.url, `http://localhost:${port}`);
  const userId = searchParams.get('userId');
  const campaignId = searchParams.get('campaignId');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  // Mock messages data
  const messages = Array.from({ length: limit }, (_, i) => ({
    id: `message_${offset + i + 1}`,
    content: `Message content ${offset + i + 1}`,
    role: i % 2 === 0 ? 'user' : 'assistant',
    userId: userId || 'user_123',
    campaignId: campaignId || null,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: userId || 'user_123',
      email: 'user@example.com',
      name: 'John Doe'
    },
    campaign: campaignId ? {
      id: campaignId,
      title: 'Sample Campaign'
    } : null
  }));
  
  res.json({
    success: true,
    data: messages,
    pagination: {
      limit,
      offset,
      total: 100,
      hasMore: offset + limit < 100
    },
    timestamp: new Date().toISOString()
  });
});

// Create message
app.post('/messages', (req, res) => {
  const { content, role, userId, campaignId } = req.body;
  
  if (!content || !role || !userId) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Content, role, and userId are required'
    });
  }
  
  const message = {
    id: 'message_' + Date.now(),
    content,
    role,
    userId,
    campaignId: campaignId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: userId,
      email: 'user@example.com',
      name: 'John Doe'
    },
    campaign: campaignId ? {
      id: campaignId,
      title: 'Sample Campaign'
    } : null
  };
  
  res.status(201).json({
    success: true,
    message: 'Message created successfully',
    data: message,
    timestamp: new Date().toISOString()
  });
});

// Get message by ID
app.get('/messages/:id', (req, res) => {
  const messageId = req.params.id;
  
  const message = {
    id: messageId,
    content: 'Sample message content',
    role: 'user',
    userId: 'user_123',
    campaignId: 'campaign_123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: 'user_123',
      email: 'user@example.com',
      name: 'John Doe'
    },
    campaign: {
      id: 'campaign_123',
      title: 'Sample Campaign'
    }
  };
  
  res.json({
    success: true,
    data: message,
    timestamp: new Date().toISOString()
  });
});

// Update message
app.put('/messages/:id', (req, res) => {
  const messageId = req.params.id;
  const updates = req.body;
  
  const message = {
    id: messageId,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Message updated successfully',
    data: message,
    timestamp: new Date().toISOString()
  });
});

// Delete message
app.delete('/messages/:id', (_req, res) => {
  res.json({
    success: true,
    message: 'Message deleted successfully',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`Chat service running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
