import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env['PORT'] || 3002;

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
    service: 'user-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Get all users
app.get('/users', (req, res) => {
  const { searchParams } = new URL(req.url, `http://localhost:${port}`);
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  // Mock users data
  const users = Array.from({ length: limit }, (_, i) => ({
    id: `user_${offset + i + 1}`,
    email: `user${offset + i + 1}@example.com`,
    name: `User ${offset + i + 1}`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }));
  
  res.json({
    success: true,
    data: users,
    pagination: {
      limit,
      offset,
      total: 100,
      hasMore: offset + limit < 100
    },
    timestamp: new Date().toISOString()
  });
});

// Create user
app.post('/users', (req, res) => {
  const { email, name } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Email is required'
    });
  }
  
  const user = {
    id: 'user_' + Date.now(),
    email,
    name: name || email.split('@')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
    timestamp: new Date().toISOString()
  });
});

// User routes
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({
    success: true,
    data: {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      avatarUrl: null,
      bio: 'Software developer',
      company: 'Tech Corp',
      jobTitle: 'Senior Developer',
      location: 'San Francisco, CA',
      website: 'https://johndoe.com',
      timezone: 'UTC',
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const updates = req.body;
  
  res.json({
    success: true,
    message: 'User profile updated successfully',
    data: {
      id: userId,
      ...updates,
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

app.delete('/users/:id', (_req, res) => {
  
  res.json({
    success: true,
    message: 'User profile deleted successfully',
    timestamp: new Date().toISOString()
  });
});

// User preferences
app.get('/users/:id/preferences', (req, res) => {
  const userId = req.params.id;
  
  res.json({
    success: true,
    data: {
      userId,
      theme: 'auto',
      notifications: true,
      emailFrequency: 'weekly',
      dataSharing: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

app.put('/users/:id/preferences', (req, res) => {
  const userId = req.params.id;
  const preferences = req.body;
  
  res.json({
    success: true,
    message: 'User preferences updated successfully',
    data: {
      userId,
      ...preferences,
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

// User analytics
app.get('/users/:id/analytics', (req, res) => {
  const userId = req.params.id;
  
  res.json({
    success: true,
    data: {
      userId,
      lastLogin: new Date().toISOString(),
      loginCount: 42,
      campaignCount: 5,
      messageCount: 128,
      totalSessionTime: 3600, // minutes
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

app.put('/users/:id/analytics', (req, res) => {
  const userId = req.params.id;
  const analyticsData = req.body;
  
  res.json({
    success: true,
    message: 'User analytics updated successfully',
    data: {
      userId,
      ...analyticsData,
      updatedAt: new Date().toISOString()
    },
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
  console.log(`User service running on port ${port}`);
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