/**
 * Structured Logging System for Craftify Email API
 * 
 * This module provides a comprehensive logging solution that:
 * - Outputs structured JSON logs for easy parsing
 * - Integrates with AWS CloudWatch and other observability platforms
 * - Provides different log levels and formatting options
 * - Includes request correlation IDs for tracing
 * - Supports log rotation and file management
 * - Implements security best practices for log sanitization
 * 
 * @author Craftify Email Team
 * @version 1.0.0
 * @since 2024-01-15
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request, Response, NextFunction } from 'express';

// Define log levels and their corresponding numeric values
const logLevels = {
  error: 0,    // Highest priority - system errors
  warn: 1,     // Warning conditions
  info: 2,     // General information
  http: 3,     // HTTP request logging
  debug: 4,    // Debug information
  trace: 5     // Lowest priority - detailed tracing
};

// Define colors for console output (development only)
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
  trace: 'gray'
};

// Interface for log metadata
export interface LogMetadata {
  requestId?: string;
  userId?: string;
  domain?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ipAddress?: string;
  correlationId?: string;
  sessionId?: string;
  [key: string]: any;
}

// Interface for structured log entry
export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  metadata: LogMetadata;
  service: string;
  version: string;
  environment: string;
  hostname: string;
  pid: number;
}

/**
 * Custom Winston format for structured logging
 * Ensures all logs are in JSON format with consistent structure
 */
const structuredLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'ISO' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      metadata: meta,
      service: 'craftify-email-api',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      hostname: require('os').hostname(),
      pid: process.pid
    };
    
    return JSON.stringify(logEntry);
  })
);

/**
 * Security-aware log sanitization
 * Removes sensitive information from logs
 */
const sanitizeLogData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'authorization',
    'cookie', 'session', 'credit_card', 'ssn', 'email'
  ];

  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }

  return sanitized;
};

/**
 * Main logger class with comprehensive logging capabilities
 */
class Logger {
  private winstonLogger: winston.Logger;
  private requestId: string | null = null;

  constructor() {
    this.initializeLogger();
  }

  /**
   * Initialize Winston logger with multiple transports
   * - Console: For development and debugging
   - File: For production log storage
   * - Daily rotation: For log management
   */
  private initializeLogger(): void {
    const transports: winston.transport[] = [];

    // Console transport for development
    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          level: process.env.LOG_LEVEL || 'debug',
          format: winston.format.combine(
            winston.format.colorize({ colors: logColors }),
            winston.format.simple()
          )
        })
      );
    }

    // File transport for production logs
    if (process.env.NODE_ENV === 'production') {
      // Application logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'info'
        })
      );

      // Error logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error'
        })
      );

      // HTTP request logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/http-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '7d',
          level: 'http'
        })
      );
    }

    // Create Winston logger instance
    this.winstonLogger = winston.createLogger({
      levels: logLevels,
      level: process.env.LOG_LEVEL || 'info',
      format: structuredLogFormat,
      transports,
      exitOnError: false
    });

    // Handle uncaught exceptions and unhandled rejections
    this.winstonLogger.exceptions.handle(
      new winston.transports.File({ 
        filename: 'logs/exceptions.log',
        maxSize: '20m',
        maxFiles: '30d'
      })
    );

    this.winstonLogger.rejections.handle(
      new winston.transports.File({ 
        filename: 'logs/rejections.log',
        maxSize: '20m',
        maxFiles: '30d'
      })
    );
  }

  /**
   * Set request correlation ID for tracing
   * @param requestId - Unique identifier for the request
   */
  public setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  /**
   * Get current request ID
   * @returns Current request ID or null
   */
  public getRequestId(): string | null {
    return this.requestId;
  }

  /**
   * Generate a unique request ID
   * @returns New request ID
   */
  public generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log error messages with stack traces
   * @param message - Error message
   * @param error - Error object or additional metadata
   * @param metadata - Additional log metadata
   */
  public error(message: string, error?: Error | any, metadata: LogMetadata = {}): void {
    const logData = {
      ...metadata,
      requestId: this.requestId,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      } : error
    };

    this.winstonLogger.error(message, sanitizeLogData(logData));
  }

  /**
   * Log warning messages
   * @param message - Warning message
   * @param metadata - Additional log metadata
   */
  public warn(message: string, metadata: LogMetadata = {}): void {
    this.winstonLogger.warn(message, {
      ...metadata,
      requestId: this.requestId
    });
  }

  /**
   * Log informational messages
   * @param message - Info message
   * @param metadata - Additional log metadata
   */
  public info(message: string, metadata: LogMetadata = {}): void {
    this.winstonLogger.info(message, {
      ...metadata,
      requestId: this.requestId
    });
  }

  /**
   * Log HTTP request information
   * @param message - HTTP message
   * @param metadata - HTTP-specific metadata
   */
  public http(message: string, metadata: LogMetadata = {}): void {
    this.winstonLogger.http(message, {
      ...metadata,
      requestId: this.requestId
    });
  }

  /**
   * Log debug information (development only)
   * @param message - Debug message
   * @param metadata - Additional log metadata
   */
  public debug(message: string, metadata: LogMetadata = {}): void {
    if (process.env.NODE_ENV !== 'production') {
      this.winstonLogger.debug(message, {
        ...metadata,
        requestId: this.requestId
      });
    }
  }

  /**
   * Log trace information (lowest level)
   * @param message - Trace message
   * @param metadata - Additional log metadata
   */
  public trace(message: string, metadata: LogMetadata = {}): void {
    if (process.env.LOG_LEVEL === 'trace') {
      this.winstonLogger.trace(message, {
        ...metadata,
        requestId: this.requestId
      });
    }
  }

  /**
   * Log API request with comprehensive metadata
   * @param req - Express request object
   * @param res - Express response object
   * @param responseTime - Response time in milliseconds
   */
  public logRequest(req: Request, res: Response, responseTime: number): void {
    const metadata: LogMetadata = {
      requestId: this.requestId,
      method: req.method,
      endpoint: req.path,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      correlationId: req.get('X-Correlation-ID'),
      sessionId: (req as any).session?.id,
      userId: (req as any).user?.id,
      domain: req.query.domain || req.body?.domain,
      queryParams: Object.keys(req.query).length > 0 ? req.query : undefined,
      requestBody: req.body && Object.keys(req.body).length > 0 ? req.body : undefined
    };

    // Log based on status code
    if (res.statusCode >= 400) {
      this.warn(`HTTP ${req.method} ${req.path} - ${res.statusCode}`, metadata);
    } else {
      this.http(`HTTP ${req.method} ${req.path} - ${res.statusCode}`, metadata);
    }
  }

  /**
   * Log security events
   * @param event - Security event type
   * @param details - Event details
   * @param metadata - Additional metadata
   */
  public logSecurityEvent(event: string, details: string, metadata: LogMetadata = {}): void {
    this.warn(`SECURITY: ${event}`, {
      ...metadata,
      requestId: this.requestId,
      securityEvent: event,
      details
    });
  }

  /**
   * Log performance metrics
   * @param metric - Metric name
   * @param value - Metric value
   * @param unit - Unit of measurement
   * @param metadata - Additional metadata
   */
  public logPerformanceMetric(metric: string, value: number, unit: string, metadata: LogMetadata = {}): void {
    this.info(`PERFORMANCE: ${metric}`, {
      ...metadata,
      requestId: this.requestId,
      metric,
      value,
      unit
    });
  }

  /**
   * Log business events
   * @param event - Business event type
   * @param entity - Entity involved
   * @param action - Action performed
   * @param metadata - Additional metadata
   */
  public logBusinessEvent(event: string, entity: string, action: string, metadata: LogMetadata = {}): void {
    this.info(`BUSINESS: ${event}`, {
      ...metadata,
      requestId: this.requestId,
      businessEvent: event,
      entity,
      action
    });
  }

  /**
   * Get logger statistics
   * @returns Logger statistics object
   */
  public getStats(): object {
    return {
      requestId: this.requestId,
      environment: process.env.NODE_ENV,
      logLevel: process.env.LOG_LEVEL || 'info',
      transports: this.winstonLogger.transports.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Gracefully close logger
   */
  public async close(): Promise<void> {
    await this.winstonLogger.close();
  }
}

// Create singleton logger instance
export const logger = new Logger();

// Export logger class for testing
export { Logger };

// Export types for external use
export type { LogMetadata, LogEntry };

/**
 * Express middleware for request logging
 * Automatically logs all HTTP requests with correlation IDs
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate or use existing request ID
  const requestId = req.get('X-Request-ID') || logger.generateRequestId();
  logger.setRequestId(requestId);
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Add request ID to request object for easy access
  (req as any).requestId = requestId;
  
  // Log request start
  logger.debug(`Request started: ${req.method} ${req.path}`, {
    requestId,
    method: req.method,
    endpoint: req.path,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip || req.connection.remoteAddress
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  const startTime = Date.now();
  
  res.end = function(chunk?: any, encoding?: any): void {
    const responseTime = Date.now() - startTime;
    
    // Log the complete request
    logger.logRequest(req, res, responseTime);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Error logging middleware
 * Logs all errors with stack traces and request context
 */
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Unhandled error occurred', error, {
    requestId: (req as any).requestId,
    method: req.method,
    endpoint: req.path,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip || req.connection.remoteAddress,
    stack: error.stack
  });
  
  next(error);
};

/**
 * Performance monitoring middleware
 * Logs slow requests and performance metrics
 */
export const performanceLogger = (threshold: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      
      if (responseTime > threshold) {
        logger.warn('Slow request detected', {
          requestId: (req as any).requestId,
          method: req.method,
          endpoint: req.path,
          responseTime,
          threshold,
          statusCode: res.statusCode
        });
      }
      
      // Log performance metric
      logger.logPerformanceMetric('response_time', responseTime, 'ms', {
        method: req.method,
        endpoint: req.path,
        statusCode: res.statusCode
      });
    });
    
    next();
  };
};

export default logger; 