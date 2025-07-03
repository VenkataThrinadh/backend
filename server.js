const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Production logging setup
const logger = {
  info: (message, ...args) => {
    if (NODE_ENV === 'development') {
      console.log(`ℹ️  ${message}`, ...args);
    }
  },
  error: (message, ...args) => {
    console.error(`❌ ${message}`, ...args);
  },
  warn: (message, ...args) => {
    if (NODE_ENV === 'development') {
      console.warn(`⚠️  ${message}`, ...args);
    }
  },
  success: (message, ...args) => {
    if (NODE_ENV === 'development') {
      console.log(`✅ ${message}`, ...args);
    }
  }
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for organized file storage
const subDirs = ['properties', 'plans', 'avatars', 'cities', 'banners'];
subDirs.forEach(dir => {
  const subDir = path.join(uploadsDir, dir);
  if (!fs.existsSync(subDir)) {
    fs.mkdirSync(subDir, { recursive: true });
  }
});

// Security middleware for production
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API server
  crossOriginEmbedderPolicy: false
}));

// Compression middleware for better performance
app.use(compression());

// Rate limiting for production security
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In production, specify allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:19006', // Expo development
      'exp://localhost:19000', // Expo development
      'capacitor://localhost', // Capacitor apps
      'ionic://localhost', // Ionic apps
      'http://localhost', // Local development
      'https://localhost' // Local HTTPS development
    ];
    
    // Add production domains if specified
    if (process.env.PRODUCTION_DOMAINS) {
      const prodDomains = process.env.PRODUCTION_DOMAINS.split(',');
      allowedOrigins.push(...prodDomains);
    }
    
    // In development, allow all origins
    if (NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Request logging middleware for production
app.use((req, res, next) => {
  if (NODE_ENV === 'development') {
    logger.info(`${req.method} ${req.url}`, req.ip);
  }
  next();
});

// Body parsing middleware with size limits
app.use(bodyParser.json({ 
  limit: process.env.MAX_JSON_SIZE || '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(bodyParser.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_URL_ENCODED_SIZE || '10mb' 
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Explicitly serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Static file request logging (disabled for cleaner terminal output)
// app.use((req, res, next) => {
//   if (req.url.startsWith('/uploads')) {
//     console.log('Static file request:', req.url);
//   }
//   next();
// });

// Import database connection with error handling
let pool;
try {
  const dbModule = require('./db');
  pool = dbModule.pool;
  logger.success('Database connection module loaded successfully');
} catch (error) {
  logger.error('Failed to load database connection:', error.message);
  process.exit(1);
}

// Test database connection on startup
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    logger.error('Database connection test failed:', err.message);
    logger.warn('Server will continue with REST API fallback only');
  } else {
    logger.success('Database connection test successful');
    logger.info('Connected to:', result.rows[0].now);
  }
});

// Apply auth rate limiting to auth routes
app.use('/api/auth', authLimiter);

// Routes with error handling
try {
  app.use('/api/auth', require('./routes/auth'));
  logger.info('Auth routes loaded');
} catch (error) {
  logger.error('Failed to load auth routes:', error.message);
}

try {
  app.use('/api/properties', require('./routes/properties'));
  logger.info('Properties routes loaded');
} catch (error) {
  logger.error('Failed to load properties routes:', error.message);
}

try {
  app.use('/api/users', require('./routes/users'));
  logger.info('Users routes loaded');
} catch (error) {
  logger.error('Failed to load users routes:', error.message);
}

try {
  app.use('/api/favorites', require('./routes/favorites'));
  logger.info('Favorites routes loaded');
} catch (error) {
  logger.error('Failed to load favorites routes:', error.message);
}

try {
  app.use('/api/enquiries', require('./routes/enquiries'));
  logger.info('Enquiries routes loaded');
} catch (error) {
  logger.error('Failed to load enquiries routes:', error.message);
}

try {
  app.use('/api/uploads', require('./routes/uploads'));
  logger.info('Uploads routes loaded');
} catch (error) {
  logger.error('Failed to load uploads routes:', error.message);
}

try {
  app.use('/api/cities', require('./routes/cities'));
  logger.info('Cities routes loaded');
} catch (error) {
  logger.error('Failed to load cities routes:', error.message);
}

try {
  app.use('/api/banners', require('./routes/banners'));
  logger.info('Banners routes loaded');
} catch (error) {
  logger.error('Failed to load banners routes:', error.message);
}

try {
  app.use('/api/admin', require('./routes/admin'));
  logger.info('Admin routes loaded');
} catch (error) {
  logger.error('Failed to load admin routes:', error.message);
}

// Additional routes with error handling
try {
  app.use('/api/amenities', require('./routes/amenities'));
  logger.info('Amenities routes loaded');
} catch (error) {
  logger.error('Failed to load amenities routes:', error.message);
}

try {
  app.use('/api/specifications', require('./routes/specifications'));
  logger.info('Specifications routes loaded');
} catch (error) {
  logger.error('Failed to load specifications routes:', error.message);
}

try {
  app.use('/api/plans', require('./routes/plans'));
  logger.info('Plans routes loaded');
} catch (error) {
  logger.error('Failed to load plans routes:', error.message);
}

try {
  app.use('/api/plots', require('./routes/plots'));
  logger.info('Plots routes loaded');
} catch (error) {
  logger.error('Failed to load plots routes:', error.message);
}

try {
  app.use('/api/land-plots', require('./routes/landPlots'));
  logger.info('Land plots routes loaded');
} catch (error) {
  logger.error('Failed to load land plots routes:', error.message);
}

try {
  app.use('/api/block-config', require('./routes/blockConfig'));
  logger.info('Block config routes loaded');
} catch (error) {
  logger.error('Failed to load block config routes:', error.message);
}

// Handle email verification web route
app.get('/verify-email', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/verify-email.html'));
});

// Comprehensive health check endpoints for production
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  };

  // Test database connection
  try {
    const result = await pool.query('SELECT NOW()');
    healthCheck.database = {
      status: 'connected',
      timestamp: result.rows[0].now
    };
  } catch (error) {
    healthCheck.database = {
      status: 'disconnected',
      error: NODE_ENV === 'development' ? error.message : 'Database connection failed'
    };
  }

  // Test Supabase service
  try {
    const supabaseService = require('./services/supabaseService');
    const supabaseTest = await supabaseService.testConnection();
    healthCheck.supabase = {
      status: supabaseTest.success ? 'connected' : 'disconnected',
      message: supabaseTest.message || 'Supabase REST API test'
    };
  } catch (error) {
    healthCheck.supabase = {
      status: 'unavailable',
      error: NODE_ENV === 'development' ? error.message : 'Supabase service unavailable'
    };
  }

  const overallStatus = healthCheck.database.status === 'connected' || healthCheck.supabase.status === 'connected' ? 'healthy' : 'degraded';
  
  res.status(overallStatus === 'healthy' ? 200 : 503).json({
    ...healthCheck,
    overall: overallStatus
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as user_count FROM users');
    res.status(200).json({ 
      status: 'ok', 
      message: 'API is running',
      database: 'connected',
      users: result.rows[0].user_count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'degraded', 
      message: 'API is running but database connection failed',
      error: error.message, // Always show error for debugging
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint to check environment variables
app.get('/api/debug', (req, res) => {
  res.json({
    node_env: NODE_ENV,
    port: PORT,
    db_config: {
      host: process.env.DB_HOST ? 'SET' : 'NOT SET',
      user: process.env.DB_USER ? 'SET' : 'NOT SET', 
      password: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
      database: process.env.DB_NAME ? 'SET' : 'NOT SET',
      port: process.env.DB_PORT ? 'SET' : 'NOT SET'
    },
    supabase: {
      url: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
      key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
    },
    timestamp: new Date().toISOString()
  });
});

// Mobile-specific health check endpoint
app.get('/mobile-health', async (req, res) => {
  const mobileHealth = {
    status: 'ok',
    message: 'Mobile API is accessible',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth/register-api, /api/auth/login-api',
      profile: '/api/auth/profile-api',
      properties: '/api/properties',
      favorites: '/api/favorites'
    }
  };

  // Test critical mobile endpoints
  try {
    await pool.query('SELECT 1');
    mobileHealth.database = 'connected';
  } catch (error) {
    mobileHealth.database = 'fallback_available';
    mobileHealth.fallback = 'Supabase REST API';
  }

  res.status(200).json(mobileHealth);
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: {
      health: 'GET /health, GET /api/health, GET /mobile-health',
      auth: 'POST /api/auth/register-api, POST /api/auth/login-api',
      properties: 'GET /api/properties',
      documentation: 'See README.md for complete API documentation'
    }
  });
});

// Production-ready error handling middleware
app.use((err, req, res, next) => {
  // Log error details
  logger.error('Server Error:', {
    message: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Determine error type and status code
  let statusCode = err.statusCode || err.status || 500;
  let message = 'An unexpected error occurred';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Invalid input data';
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Authentication failed';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Database connection failed';
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    ...(NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack
    }),
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      logger.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    logger.info('HTTP server closed');
    
    // Close database connections
    if (pool) {
      pool.end(() => {
        logger.info('Database connections closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Production-ready server startup
const server = app.listen(PORT, '0.0.0.0', () => {
  const startupMessage = `
╔══════════════════════════════════════════════════════════════╗
║                🏠 REAL ESTATE API SERVER                     ║
╠══════════════════════════════════════════════════════════════╣
║  🚀 Status: RUNNING                                          ║
║  🌐 Port: ${PORT.toString().padEnd(52)} ║
║  🏠 Environment: ${NODE_ENV.padEnd(45)} ║
║  🗄️  Database: ${(process.env.DB_NAME || 'Unknown').padEnd(47)} ║
║  📡 Supabase: ${(process.env.SUPABASE_URL ? 'Connected' : 'Not configured').padEnd(46)} ║
║  🔒 Security: Helmet + Rate Limiting + CORS                  ║
║  📱 Mobile API: /api/auth/*-api endpoints                    ║
║  🔍 Health Check: /health, /api/health, /mobile-health       ║
║  📅 Started: ${new Date().toLocaleString().padEnd(47)} ║
╚══════════════════════════════════════════════════════════════╝
`;
  
  console.log(startupMessage);
  
  if (NODE_ENV === 'production') {
    logger.info('Production server started successfully');
    logger.info('All security measures are active');
    logger.info('Database fallback system is ready');
  } else {
    logger.info('Development server started with detailed logging');
  }
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Handle process termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Set server timeout for shared hosting
server.timeout = 120000; // 2 minutes

// Graceful shutdown handling for shared hosting
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});