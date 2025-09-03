/**
 * Main Entry Point for Craftify Email API
 * 
 * This file serves as the primary entry point for the Express.js API server.
 * It initializes all middleware, security features, logging, and routes.
 * 
 * Key Features:
 * - Express.js server with TypeScript
 * - Comprehensive security middleware stack
 * - Structured logging with Winston
 * - WebSocket server for real-time features
 * - Swagger/OpenAPI documentation
 * - Health monitoring and graceful shutdown
 * - Environment-based configuration
 * 
 * Security Features Implemented:
 * - Helmet.js security headers
 * - CORS with strict origin policy
 * - Rate limiting and brute force protection
 * - Input validation and sanitization
 * - XSS and injection attack prevention
 * - Request size limits and validation
 * - Security event logging and monitoring
 * 
 * @author Craftify Email Team
 * @version 1.0.0
 * @since 2024-01-15
 * @security Implements enterprise-grade security measures
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import swaggerUi from 'swagger-ui-express';

// Import configuration and utilities
import { config } from './config';
import { logger, requestLogger, errorLogger, performanceLogger } from './utils/logger';
import { securityManager } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { apiRoutes } from './routes';
import { initializeWebSocket } from './utils/websocket';
import { specs } from './config/swagger';

// Load environment variables from .env files
// Priority: .env.local > .env.development > .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
dotenv.config();

/**
 * Main Express application instance
 * This is the core of the API server
 */
const app = express();

/**
 * HTTP server instance
 * Created from Express app to support WebSocket upgrades
 */
const server = createServer(app);

/**
 * WebSocket server instance
 * Handles real-time communication for collaborative features
 */
const wss = new WebSocketServer({ 
  server,
  // WebSocket security configuration
  perMessageDeflate: {
    threshold: 1024, // Only compress messages larger than 1KB
    zlibInflateOptions: {
      chunkSize: 10 * 1024 // 10KB chunks
    }
  }
});

/**
 * Initialize WebSocket server with event handlers
 * Sets up connection management and real-time features
 */
initializeWebSocket(wss);

/**
 * Apply comprehensive security middleware stack
 * This includes all security measures for enterprise-grade protection
 */
securityManager.applySecurityMiddleware(app);

/**
 * Apply structured logging middleware
 * Provides comprehensive request/response logging with correlation IDs
 */
app.use(requestLogger);

/**
 * Apply performance monitoring middleware
 * Logs slow requests and performance metrics for optimization
 */
app.use(performanceLogger(1000)); // Log requests taking longer than 1 second

/**
 * Apply compression middleware
 * Reduces response size for better performance
 */
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression for all other responses
    return compression.filter(req, res);
  }
}));

/**
 * Apply HTTP request logging middleware
 * Logs all HTTP requests with detailed information
 */
app.use(morgan('combined', { 
  stream: { 
    write: (message) => logger.http(message.trim()) 
  } 
}));

/**
 * Apply body parsing middleware with security limits
 * Prevents large payload attacks and ensures proper content handling
 */
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for potential signature verification
    (req as any).rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 100 // Limit number of parameters to prevent DoS
}));

/**
 * Apply Swagger/OpenAPI documentation middleware
 * Provides interactive API documentation for developers
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Craftify Email API Documentation',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));

/**
 * Health check endpoint
 * Provides system status information for monitoring and load balancers
 * 
 * Response includes:
 * - System status (ok/error)
 * - Current timestamp
 * - Uptime in seconds
 * - Environment information
 * - API version
 * - Memory usage statistics
 */
app.get('/health', (_, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.environment,
    version: config.version,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    pid: process.pid,
    nodeVersion: process.version,
    platform: process.platform
  };
  
  // Log health check request
  logger.debug('Health check requested', healthData);
  
  res.json(healthData);
});

/**
 * API information endpoint
 * Provides metadata about the API and available endpoints
 * 
 * Response includes:
 * - API name and description
 * - Current version
 * - Available endpoints
 * - Documentation links
 * - Contact information
 */
app.get('/api', (_, res) => {
  const apiInfo = {
    success: true,
    data: {
      name: 'Craftify Email API',
      version: '1.0.0',
      description: 'Enterprise Email Template Management System API',
      endpoints: {
        health: '/health',
        api: '/api',
        swagger: '/api-docs',
        templates: '/api/templates',
        folders: '/api/folders',
        approvals: '/api/approvals',
        users: '/api/users'
      },
      documentation: {
        swagger: '/api-docs',
        openapi: '/api-docs/swagger.json'
      },
      contact: {
        team: 'Craftify Email Team',
        email: 'team@craftify-email.com'
      },
      security: {
        authentication: 'JWT Bearer Token',
        rateLimiting: 'Enabled',
        cors: 'Configured',
        csp: 'Enabled'
      }
    }
  };
  
  res.json(apiInfo);
});

/**
 * Security status endpoint
 * Provides information about current security configuration
 * 
 * Response includes:
 * - Security features status
 * - Configuration details
 * - Redis connection status
 * - Rate limiting configuration
 */
app.get('/api/security/status', (req, res) => {
  // Only allow access from authorized sources
  const clientIP = req.ip;
  const allowedIPs = process.env.ADMIN_IPS ? process.env.ADMIN_IPS.split(',') : ['127.0.0.1', '::1'];
  
  if (!allowedIPs.includes(clientIP)) {
    logger.warn('Unauthorized access attempt to security status endpoint', {
      requestId: (req as any).requestId,
      clientIP,
      allowedIPs
    });
    
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied to security information'
      }
    });
  }
  
  const securityStatus = securityManager.getSecurityStatus();
  
  logger.info('Security status requested', {
    requestId: (req as any).requestId,
    clientIP
  });
  
  res.json({
    success: true,
    data: securityStatus
  });
});

/**
 * Apply API routes
 * All application-specific endpoints are defined in the routes directory
 */
app.use('/api', apiRoutes);

/**
 * Apply 404 handler for unmatched routes
 * Provides consistent error response for non-existent endpoints
 */
app.use(notFoundHandler);

/**
 * Apply global error handler
 * Catches all unhandled errors and provides consistent error responses
 * Includes security event logging for suspicious activities
 */
app.use(errorLogger);
app.use(errorHandler);

/**
 * Start the HTTP server
 * Binds to the configured port and starts accepting connections
 */
const PORT = config.port || 3001;

server.listen(PORT, () => {
  // Log successful server startup
  logger.info('🚀 Craftify Email API server started successfully', {
    port: PORT,
    environment: config.environment,
    version: config.version,
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  });
  
  // Log available endpoints for development
  if (config.environment === 'development') {
    console.log('\n📚 Available Endpoints:');
    console.log(`   Health Check: http://localhost:${PORT}/health`);
    console.log(`   API Info: http://localhost:${PORT}/api`);
    console.log(`   Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`   Security Status: http://localhost:${PORT}/api/security/status`);
    console.log('\n🔒 Security Features Active:');
    console.log('   ✓ Helmet.js security headers');
    console.log('   ✓ CORS with strict origin policy');
    console.log('   ✓ Rate limiting and brute force protection');
    console.log('   ✓ Input validation and sanitization');
    console.log('   ✓ XSS and injection attack prevention');
    console.log('   ✓ Request size limits and validation');
    console.log('   ✓ Security event logging and monitoring');
    console.log('\n📊 Monitoring & Observability:');
    console.log('   ✓ Structured JSON logging');
    console.log('   ✓ Request correlation IDs');
    console.log('   ✓ Performance metrics');
    console.log('   ✓ Security event logging');
    console.log('   ✓ AWS CloudWatch compatible');
    console.log('\n');
  }
});

/**
 * Graceful shutdown handling
 * Ensures proper cleanup of resources when the server is terminated
 * 
 * Handles:
 * - SIGTERM (termination signal)
 * - SIGINT (interrupt signal)
 * - Uncaught exceptions
 * - Unhandled promise rejections
 */

// Handle SIGTERM (termination signal)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, initiating graceful shutdown', {
    signal: 'SIGTERM',
    timestamp: new Date().toISOString()
  });
  
  gracefulShutdown();
});

// Handle SIGINT (interrupt signal)
process.on('SIGINT', () => {
  logger.info('SIGINT received, initiating graceful shutdown', {
    signal: 'SIGINT',
    timestamp: new Date().toISOString()
  });
  
  gracefulShutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception occurred', error, {
    errorType: 'uncaughtException',
    stack: error.stack
  });
  
  // Exit with error code after logging
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', new Error(String(reason)), {
    errorType: 'unhandledRejection',
    reason: String(reason),
    promise: promise.toString()
  });
  
  // Exit with error code after logging
  process.exit(1);
});

/**
 * Graceful shutdown function
 * Performs cleanup operations in the correct order
 */
async function gracefulShutdown(): Promise<void> {
  try {
    logger.info('Starting graceful shutdown process');
    
    // 1. Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed');
    });
    
    // 2. Close WebSocket connections
    wss.close(() => {
      logger.info('WebSocket server closed');
    });
    
    // 3. Cleanup security manager
    await securityManager.cleanup();
    
    // 4. Close logger
    await logger.close();
    
    logger.info('Graceful shutdown completed successfully');
    
    // Exit with success code
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', error);
    
    // Exit with error code if shutdown fails
    process.exit(1);
  }
}

/**
 * Export the Express app for testing purposes
 * Allows external testing frameworks to import and test the application
 */
export default app;

/**
 * Export the HTTP server for testing purposes
 * Useful for testing WebSocket functionality
 */
export { server };

/**
 * Export the WebSocket server for testing purposes
 * Allows testing of real-time features
 */
export { wss }; 