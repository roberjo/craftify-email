/**
 * Structured Logging Configuration for Craftify Email API
 * 
 * This module provides a comprehensive logging system that:
 * - Outputs structured JSON logs for easy parsing
 * - Integrates with AWS CloudWatch and other observability platforms
 * - Provides different log levels and formats
 * - Includes request correlation IDs
 * - Supports log rotation and file management
 * - Formats logs for production and development environments
 * 
 * @author Craftify Email Team
 * @version 1.0.0
 * @since 2024-01-15
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request, Response } from 'express';

/**
 * Log levels configuration
 * Maps to standard logging levels used by most observability platforms
 */
export enum LogLevel {
  ERROR = 'error',     // Application errors that need immediate attention
  WARN = 'warn',       // Warning conditions that should be monitored
  INFO = 'info',       // General information about application flow
  HTTP = 'http',       // HTTP request/response logging
  DEBUG = 'debug',     // Detailed debugging information
  VERBOSE = 'verbose'  // Very detailed debugging information
}

/**
 * Log metadata interface for structured logging
 * Ensures consistent log structure across the application
 */
export interface LogMetadata {
  timestamp: string;           // ISO 8601 timestamp
  level: LogLevel;             // Log level
  message: string;             // Human-readable log message
  service: string;             // Service name for microservices
  version: string;             // Application version
  environment: string;         // Environment (dev, staging, prod)
  requestId?: string;          // Correlation ID for request tracing
  userId?: string;             // User ID if authenticated
  sessionId?: string;          // Session ID for user tracking
  ipAddress?: string;          // Client IP address
  userAgent?: string;          // Client user agent
  endpoint?: string;           // API endpoint being accessed
  method?: string;             // HTTP method
  statusCode?: number;         // HTTP status code
  responseTime?: number;       // Response time in milliseconds
  errorCode?: string;          // Application error code
  errorStack?: string;         // Error stack trace
  additionalData?: any;        // Any additional contextual data
}

/**
 * Winston logger configuration
 * Provides structured logging with multiple transports
 */
class Logger {
  private logger!: winston.Logger;
  private environment: string;
  private serviceName: string;
  private serviceVersion: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.serviceName = 'craftify-email-api';
    this.serviceVersion = process.env.APP_VERSION || '1.0.0';

    this.initializeLogger();
  }

  /**
   * Initialize the Winston logger with appropriate transports
   * Configures different transports based on environment
   */
  private initializeLogger(): void {
    const transports: winston.transport[] = [];

    // Console transport for development
    if (this.environment === 'development') {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
            })
          )
        })
      );
    }

    // File transport for production logs
    if (this.environment === 'production') {
      // Error logs with rotation
      transports.push(
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: LogLevel.ERROR,
          maxSize: '20m',
          maxFiles: 14,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );

      // Combined logs with rotation
      transports.push(
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: 30,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );
    }

    // CloudWatch-compatible JSON format for all environments
    const jsonFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    this.logger = winston.createLogger({
      level: this.getLogLevel(),
      format: jsonFormat,
      transports,
      // Handle uncaught exceptions and unhandled rejections
      exceptionHandlers: [
        new DailyRotateFile({
          filename: 'logs/exceptions-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: 14
        })
      ],
      rejectionHandlers: [
        new DailyRotateFile({
          filename: 'logs/rejections-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: 14
        })
      ]
    });

    // Add console transport for exceptions in development
    if (this.environment === 'development') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
  }

  /**
   * Determine appropriate log level based on environment
   * More verbose logging in development, restricted in production
   */
  private getLogLevel(): string {
    const envLevel = process.env.LOG_LEVEL;
    if (envLevel) return envLevel;

    switch (this.environment) {
      case 'development':
        return LogLevel.DEBUG;
      case 'staging':
        return LogLevel.INFO;
      case 'production':
        return LogLevel.WARN;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Create standardized log metadata
   * Ensures consistent log structure across all log entries
   */
  private createMetadata(level: LogLevel, message: string, additionalData?: any): LogMetadata {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      version: this.serviceVersion,
      environment: this.environment,
      ...additionalData
    };
  }

  /**
   * Log an error message with full context
   * Includes stack trace and error details for debugging
   */
  public error(message: string, error?: Error, additionalData?: any): void {
    const metadata = this.createMetadata(LogLevel.ERROR, message, {
      errorCode: error?.name || 'UNKNOWN_ERROR',
      errorStack: error?.stack,
      ...additionalData
    });

    this.logger.error(metadata);
  }

  /**
   * Log a warning message
   * Used for conditions that should be monitored
   */
  public warn(message: string, additionalData?: any): void {
    const metadata = this.createMetadata(LogLevel.WARN, message, additionalData);
    this.logger.warn(metadata);
  }

  /**
   * Log an informational message
   * General application flow information
   */
  public info(message: string, additionalData?: any): void {
    const metadata = this.createMetadata(LogLevel.INFO, message, additionalData);
    this.logger.info(metadata);
  }

  /**
   * Log HTTP request/response information
   * Used for API endpoint logging
   */
  public http(message: string, additionalData?: any): void {
    const metadata = this.createMetadata(LogLevel.HTTP, message, additionalData);
    this.logger.http(metadata);
  }

  /**
   * Log debug information
   * Detailed debugging information for development
   */
  public debug(message: string, additionalData?: any): void {
    const metadata = this.createMetadata(LogLevel.DEBUG, message, additionalData);
    this.logger.debug(metadata);
  }

  /**
   * Log verbose debugging information
   * Very detailed debugging for troubleshooting
   */
  public verbose(message: string, additionalData?: any): void {
    const metadata = this.createMetadata(LogLevel.VERBOSE, message, additionalData);
    this.logger.verbose(metadata);
  }

  /**
   * Log API request information
   * Structured logging for HTTP requests
   */
  public logRequest(req: Request, additionalData?: any): void {
    const metadata = this.createMetadata(LogLevel.HTTP, 'API Request', {
      requestId: req.headers['x-request-id'] || req.headers['x-correlation-id'],
      userId: (req as any).user?.id,
      sessionId: (req as any).sessionID,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      method: req.method,
      query: req.query,
      body: this.sanitizeRequestBody(req.body),
      ...additionalData
    });

    this.logger.info(metadata);
  }

  /**
   * Log API response information
   * Structured logging for HTTP responses
   */
  public logResponse(req: Request, res: Response, responseTime: number, additionalData?: any): void {
    const metadata = this.createMetadata(LogLevel.HTTP, 'API Response', {
      requestId: req.headers['x-request-id'] || req.headers['x-correlation-id'],
      userId: (req as any).user?.id,
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      contentLength: res.get('Content-Length'),
      ...additionalData
    });

    this.logger.info(metadata);
  }

  /**
   * Log security events
   * Specialized logging for security-related activities
   */
  public logSecurityEvent(event: string, additionalData?: any): void {
    const metadata = this.createMetadata(LogLevel.WARN, `Security Event: ${event}`, {
      eventType: 'security',
      severity: 'high',
      ...additionalData
    });

    this.logger.warn(metadata);
  }

  /**
   * Log performance metrics
   * Used for monitoring application performance
   */
  public logPerformance(operation: string, duration: number, additionalData?: any): void {
    const metadata = this.createMetadata(LogLevel.INFO, `Performance: ${operation}`, {
      operation,
      duration,
      unit: 'milliseconds',
      ...additionalData
    });

    this.logger.info(metadata);
  }

  /**
   * Sanitize request body for logging
   * Removes sensitive information like passwords and tokens
   */
  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Get the underlying Winston logger instance
   * Useful for advanced logging operations
   */
  public getWinstonLogger(): winston.Logger {
    return this.logger;
  }

  /**
   * Gracefully close the logger
   * Ensures all pending logs are written before shutdown
   */
  public async close(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.on('finish', resolve);
      this.logger.end();
    });
  }
}

// Create and export a singleton logger instance
export const logger = new Logger();

// Export the Logger class for testing and customization
export { Logger }; 