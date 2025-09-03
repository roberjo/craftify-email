/**
 * Main API Server Entry Point for Craftify Email
 * 
 * This file serves as the primary entry point for the Craftify Email API server.
 * It initializes the Express application, configures middleware, sets up security,
 * establishes WebSocket connections, and starts the HTTP server.
 * 
 * Key Features:
 * - Express.js server with TypeScript
 * - Comprehensive security middleware
 * - Structured logging with Winston
 * - WebSocket server for real-time features
 * - Swagger/OpenAPI documentation
 * - Health check endpoints
 * - Graceful shutdown handling
 * 
 * Security Features:
 * - Helmet.js security headers
 * - CORS configuration
 * - Rate limiting and brute force protection
 * - Input validation and sanitization
 * - IP address filtering
 * - XSS and injection protection
 * 
 * @author Craftify Email Team
 * @version 1.0.0
 * @since 2024-01-15
 */

import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import swaggerUi from 'swagger-ui-express';

// Import configuration and utilities
import { config } from './config';
import { logger } from './config/logger';
import { SecurityManager, defaultSecurityConfig } from './middleware/security';
import { sanitizeRequest } from './middleware/validation';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Import routes and utilities
import { apiRoutes } from './routes';
import { initializeWebSocket } from './utils/websocket';
import { specs } from './config/swagger';

// Load environment variables from .env file
dotenv.config();

/**
 * Main Express application instance
 * Configured with all necessary middleware and security features
 */
const app = express();

/**
 * HTTP server instance
 * Created from the Express app to support WebSocket connections
 */
const server = createServer(app);

/**
 * Security manager instance
 * Handles all security-related middleware and configuration
 */
const securityManager = new SecurityManager(defaultSecurityConfig);

/**
 * WebSocket server instance
 * Provides real-time communication capabilities
 */
const wss = new WebSocketServer({ 
  server,
  // WebSocket security configuration
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value
    serverNoContextTakeover: true, // Defaults to negotiated value
    serverMaxWindowBits: 10, // Defaults to negotiated value
    // Below options specified as default values
    concurrencyLimit: 10, // Limits zlib concurrency for perf
    threshold: 1024 // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled
  }
});

/**
 * Initialize WebSocket functionality
 * Sets up event handlers and connection management
 */
initializeWebSocket(wss);

/**
 * Apply comprehensive security middleware
 * Configures all security features including headers, CORS, rate limiting, etc.
 */
securityManager.applySecurityMiddleware(app);

/**
 * Apply additional middleware for request processing
 * Includes compression, logging, and body parsing
 */
app.use(compression()); // Enable gzip compression for responses
app.use(express.json({ 
  limit: '10mb', // Maximum request body size
  verify: (req, buf) => {
    // Store raw body for signature verification if needed
    (req as any).rawBody = buf;
  }
})); // Parse JSON request bodies
app.use(express.urlencoded({ 
  extended: true, // Use qs library for parsing
  limit: '10mb' // Maximum URL-encoded body size
})); // Parse URL-encoded request bodies

/**
 * Configure Morgan HTTP request logging
 * Provides detailed logging of all HTTP requests and responses
 */
app.use(morgan('combined', { 
  stream: { 
    write: (message) => {
      // Parse Morgan log message and convert to structured logging
      const logData = parseMorganLog(message);
      logger.http('HTTP Request', logData);
    } 
  } 
}));

/**
 * Apply request sanitization middleware
 * Removes potentially dangerous content from all requests
 */
app.use(sanitizeRequest);

/**
 * Configure Swagger/OpenAPI documentation
 * Provides interactive API documentation at /api-docs endpoint
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true, // Enable API explorer
  customCss: '.swagger-ui .topbar { display: none }', // Hide Swagger top bar
  customSiteTitle: 'Craftify Email API Documentation', // Custom page title
  swaggerOptions: {
    // Swagger UI configuration
    docExpansion: 'list', // Expand all endpoints by default
    filter: true, // Enable endpoint filtering
    showRequestHeaders: true, // Show request headers in examples
    showCommonExtensions: true, // Show common extensions
    // Security definitions for Swagger UI
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'JWT token in format: Bearer <token>'
      }
    }
  }
}));

/**
 * Health check endpoint
 * Provides system health status for monitoring and load balancers
 * 
 * Response includes:
 * - System status (ok/error)
 * - Current timestamp
 * - System uptime
 * - Environment information
 * - Application version
 */
app.get('/health', (_, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.environment,
    version: config.version,
    services: {
      database: 'healthy', // Placeholder for future database health check
      redis: 'healthy',    // Placeholder for future Redis health check
      websocket: 'healthy' // WebSocket server status
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    }
  };

  // Log health check request
  logger.info('Health check requested', {
    endpoint: '/health',
    responseStatus: 200,
    responseTime: Date.now()
  });

  res.json(healthData);
});

/**
 * Security information endpoint
 * Provides information about current security configuration
 * Useful for security monitoring and compliance
 */
app.get('/security', (_, res) => {
  const securityInfo = securityManager.getSecurityInfo();
  
  // Log security info request
  logger.info('Security information requested', {
    endpoint: '/security',
    responseStatus: 200
  });

  res.json({
    success: true,
    data: securityInfo,
    timestamp: new Date().toISOString()
  });
});

/**
 * API routes configuration
 * All API endpoints are prefixed with /api
 * Routes are defined in the routes directory
 */
app.use('/api', apiRoutes);

/**
 * 404 handler for unmatched routes
 * Returns consistent error response for non-existent endpoints
 */
app.use(notFoundHandler);

/**
 * Global error handling middleware
 * Catches all unhandled errors and provides consistent error responses
 * Should be the last middleware in the stack
 */
app.use(errorHandler);

/**
 * Start the HTTP server
 * Binds to the configured port and starts accepting connections
 */
const PORT = config.port || 3001;

server.listen(PORT, () => {
  // Log successful server startup
  logger.info('🚀 API Server started successfully', {
    port: PORT,
    environment: config.environment,
    version: config.version,
    timestamp: new Date().toISOString()
  });

  // Log server information
  logger.info('📊 Server Configuration', {
    port: PORT,
    environment: config.environment,
    version: config.version,
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch
  });

  // Log available endpoints
  logger.info('🔗 Available Endpoints', {
    health: `http://localhost:${PORT}/health`,
    api: `http://localhost:${PORT}/api`,
    swagger: `http://localhost:${PORT}/api-docs`,
    security: `http://localhost:${PORT}/security`
  });

  // Log security features
  logger.info('🛡️ Security Features Active', {
    helmet: 'Enabled',
    cors: 'Configured',
    rateLimiting: 'Active',
    bruteForceProtection: 'Active',
    inputSanitization: 'Active',
    securityHeaders: 'Configured'
  });
});

/**
 * Graceful shutdown handling
 * Ensures the server shuts down cleanly when receiving termination signals
 */

// Handle SIGTERM signal (graceful shutdown)
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, initiating graceful shutdown', {
    signal: 'SIGTERM',
    timestamp: new Date().toISOString()
  });
  
  await gracefulShutdown();
});

// Handle SIGINT signal (Ctrl+C)
process.on('SIGINT', async () => {
  logger.info('SIGINT received, initiating graceful shutdown', {
    signal: 'SIGINT',
    timestamp: new Date().toISOString()
  });
  
  await gracefulShutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception - Application will exit', error, {
    errorType: 'uncaughtException',
    timestamp: new Date().toISOString()
  });
  
  // Exit with error code
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', reason as Error, {
    errorType: 'unhandledRejection',
    promise: String(reason),
    timestamp: new Date().toISOString()
  });
  
  // Exit with error code
  process.exit(1);
});

/**
 * Graceful shutdown function
 * Closes all connections and cleans up resources
 */
async function gracefulShutdown(): Promise<void> {
  try {
    logger.info('Starting graceful shutdown process', {
      phase: 'shutdown-initiated',
      timestamp: new Date().toISOString()
    });

    // Close WebSocket server
    if (wss) {
      wss.close(() => {
        logger.info('WebSocket server closed');
      });
    }

    // Close HTTP server
    if (server) {
      server.close(() => {
        logger.info('HTTP server closed');
      });
    }

    // Clean up security manager
    await securityManager.cleanup();

    // Close logger
    await logger.close();

    logger.info('Graceful shutdown completed successfully', {
      phase: 'shutdown-completed',
      timestamp: new Date().toISOString()
    });

    // Exit process
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', error as Error, {
      phase: 'shutdown-error',
      timestamp: new Date().toISOString()
    });
    
    // Force exit after error
    process.exit(1);
  }
}

/**
 * Parse Morgan HTTP log messages
 * Converts Morgan log format to structured logging data
 */
function parseMorganLog(message: string): any {
  try {
    // Morgan log format: remote-addr - remote-user [date] "method url status res[content-length] referrer user-agent"
    const logMatch = message.match(/^(\S+) - (\S+) \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d+) (\d+|-) "([^"]*)" "([^"]*)"$/);
    
    if (logMatch) {
      return {
        remoteAddr: logMatch[1],
        remoteUser: logMatch[2] === '-' ? undefined : logMatch[2],
        timestamp: logMatch[3],
        method: logMatch[4],
        url: logMatch[5],
        status: parseInt(logMatch[6]),
        contentLength: logMatch[7] === '-' ? undefined : parseInt(logMatch[7]),
        referrer: logMatch[8] === '-' ? undefined : logMatch[8],
        userAgent: logMatch[9] === '-' ? undefined : logMatch[9]
      };
    }
    
    return { rawMessage: message.trim() };
  } catch (error) {
    return { rawMessage: message.trim(), parseError: (error as Error).message };
  }
}

// Export the Express app for testing purposes
export default app; 