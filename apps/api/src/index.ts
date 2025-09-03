import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { apiRoutes } from './routes';
import { initializeWebSocket } from './utils/websocket';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server });
initializeWebSocket(wss);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors(config.cors));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.environment,
    version: config.version,
  });
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port || 3001;

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${config.environment}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`📚 API docs: http://localhost:${PORT}/api/docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app; 