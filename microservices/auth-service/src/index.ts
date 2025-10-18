import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env['PORT'] || 3001;
const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';

// Mock user storage (in production, use database)
const users: Array<{ id: string; email: string; name: string; password: string; createdAt: Date }> = [];

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
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Register endpoint
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Email and password are required'
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Password must be at least 8 characters'
      });
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'User already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = {
      id: 'user_' + Date.now(),
      email,
      name: name || email.split('@')[0],
      password: hashedPassword,
      createdAt: new Date()
    };
    
    users.push(user);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        },
        token,
        expiresIn: '24h'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Registration failed'
    });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Email and password are required'
      });
    }
    
    // Find user
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Error',
        message: 'Invalid credentials'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Error',
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        },
        token,
        expiresIn: '24h'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Login failed'
    });
  }
});

// Logout endpoint
app.post('/logout', (_req, res) => {
  return res.json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString()
  });
});

// Verify token endpoint
app.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Token is required'
    });
  }
  
  // Mock token verification
  return res.json({
    success: true,
    data: {
      valid: true,
      user: {
        id: 'user_123',
        email: 'user@example.com',
        name: 'John Doe'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Get current user
app.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Token is required'
    });
  }
  
  return res.json({
    success: true,
    data: {
      user: {
        id: 'user_123',
        email: 'user@example.com',
        name: 'John Doe',
        avatarUrl: null,
        createdAt: new Date().toISOString()
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Google OAuth login
app.post('/google', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Google token is required'
    });
  }
  
  // Mock Google OAuth verification
  const user = {
    id: 'google_user_' + Date.now(),
    email: 'user@gmail.com',
    name: 'Google User',
    provider: 'google'
  };
  
  const jwtToken = 'jwt_token_' + Date.now();
  
  return res.json({
    success: true,
    message: 'Google login successful',
    data: {
      user,
      token: jwtToken,
      expiresIn: '24h'
    },
    timestamp: new Date().toISOString()
  });
});

// OAuth callback
app.post('/oauth-callback', (req, res) => {
  const { code, state } = req.body;
  
  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Authorization code is required'
    });
  }
  
  // Mock OAuth callback processing
  const user = {
    id: 'oauth_user_' + Date.now(),
    email: 'user@example.com',
    name: 'OAuth User',
    provider: 'oauth'
  };
  
  const jwtToken = 'jwt_token_' + Date.now();
  
  return res.json({
    success: true,
    message: 'OAuth callback processed successfully',
    data: {
      user,
      token: jwtToken,
      expiresIn: '24h'
    },
    timestamp: new Date().toISOString()
  });
});

// Email verification
app.post('/verify-email', (req, res) => {
  const { token, email } = req.body;
  
  if (!token || !email) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Token and email are required'
    });
  }
  
  // Mock email verification
  return res.json({
    success: true,
    message: 'Email verified successfully',
    data: {
      verified: true,
      email,
      verifiedAt: new Date().toISOString()
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
  console.log(`Auth service running on port ${port}`);
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