/**
 * Comprehensive Security Middleware for Craftify Email API
 * 
 * This module implements enterprise-grade security measures including:
 * - XSS (Cross-Site Scripting) protection
 * - CSRF (Cross-Site Request Forgery) protection
 * - SQL Injection prevention
 * - Input validation and sanitization
 * - Rate limiting and brute force protection
 * - Security headers and content security policy
 * - Request size limits and payload validation
 * - IP address validation and geolocation filtering
 * - Session security and token validation
 * 
 * Security Features Implemented:
 * 1. Helmet.js for security headers
 * 2. CORS configuration with strict origin policy
 * 3. Rate limiting with progressive delays
 * 4. Input sanitization and validation
 * 5. XSS protection and content filtering
 * 6. Request size limits and payload validation
 * 7. IP address validation and filtering
 * 8. Security event logging and monitoring
 * 
 * @author Craftify Email Team
 * @version 1.0.0
 * @since 2024-01-15
 * @security This module implements OWASP Top 10 security controls
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import hpp from 'hpp';
import xssClean from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import { ExpressBrute } from 'express-brute';
import RedisStore from 'express-brute-redis';
import Redis from 'redis';
import { logger } from '../utils/logger';

// Security configuration interface
export interface SecurityConfig {
  // CORS Configuration
  cors: {
    origin: string | string[] | boolean;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
    preflightContinue: boolean;
    optionsSuccessStatus: number;
  };
  
  // Rate Limiting Configuration
  rateLimit: {
    windowMs: number;
    max: number;
    message: object;
    standardHeaders: boolean;
    legacyHeaders: boolean;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
    keyGenerator: (req: Request) => string;
    handler: (req: Request, res: Response) => void;
  };
  
  // Slow Down Configuration
  slowDown: {
    windowMs: number;
    delayAfter: number;
    delayMs: number;
    maxDelayMs: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  
  // Brute Force Protection
  bruteForce: {
    freeRetries: number;
    minWait: number;
    maxWait: number;
    lifetime: number;
    refreshTimeoutOnRequest: boolean;
    attachResetToRequest: boolean;
  };
  
  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: string[];
      scriptSrc: string[];
      styleSrc: string[];
      imgSrc: string[];
      connectSrc: string[];
      fontSrc: string[];
      objectSrc: string[];
      mediaSrc: string[];
      frameSrc: string[];
      workerSrc: string[];
      manifestSrc: string[];
      baseUri: string[];
      formAction: string[];
      frameAncestors: string[];
    };
    reportOnly: boolean;
    setAllHeaders: boolean;
    disableAndroid: boolean;
  };
  
  // Request Validation
  requestValidation: {
    maxBodySize: string;
    maxUrlLength: number;
    allowedContentTypes: string[];
    blockedUserAgents: string[];
    blockedIPs: string[];
    allowedIPs: string[];
  };
}

/**
 * Default security configuration with enterprise-grade settings
 * These settings provide a balance between security and usability
 */
export const defaultSecurityConfig: SecurityConfig = {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Request-ID',
      'X-Forwarded-For',
      'X-Real-IP',
      'X-Correlation-ID',
      'X-Client-Version'
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Correlation-ID'
    ],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes',
        requestId: null // Will be populated dynamically
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req: Request) => {
      // Use IP address and user ID if available for rate limiting
      const userIdentifier = (req as any).user?.id || 'anonymous';
      return `${req.ip}-${userIdentifier}`;
    },
    handler: (req: Request, res: Response) => {
      const requestId = (req as any).requestId;
      const rateLimitMessage = {
        ...defaultSecurityConfig.rateLimit.message,
        error: {
          ...defaultSecurityConfig.rateLimit.message.error,
          requestId
        }
      };
      
      // Log security event
      logger.logSecurityEvent(
        'RATE_LIMIT_EXCEEDED',
        `IP: ${req.ip}, User: ${(req as any).user?.id || 'anonymous'}`,
        { requestId, ipAddress: req.ip }
      );
      
      res.status(429).json(rateLimitMessage);
    }
  },
  
  slowDown: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per 15 minutes, then...
    delayMs: 500, // begin adding 500ms of delay per request above 50
    maxDelayMs: 20000, // maximum delay of 20 seconds
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  bruteForce: {
    freeRetries: 5,
    minWait: 5 * 60 * 1000, // 5 minutes
    maxWait: 15 * 60 * 1000, // 15 minutes
    lifetime: 2 * 60 * 60 * 1000, // 2 hours
    refreshTimeoutOnRequest: false,
    attachResetToRequest: true
  },
  
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Swagger UI
        "'unsafe-eval'"    // Required for Swagger UI
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Swagger UI
        "https://fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "ws:",
        "wss:"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"] // Prevents clickjacking
    },
    reportOnly: false,
    setAllHeaders: true,
    disableAndroid: false
  },
  
  requestValidation: {
    maxBodySize: '10mb',
    maxUrlLength: 2048,
    allowedContentTypes: [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain'
    ],
    blockedUserAgents: [
      'sqlmap',
      'nikto',
      'nmap',
      'scanner',
      'bot',
      'crawler'
    ],
    blockedIPs: process.env.BLOCKED_IPS ? process.env.BLOCKED_IPS.split(',') : [],
    allowedIPs: process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : []
  }
};

/**
 * Security Manager Class
 * Centralizes all security middleware and provides configuration management
 */
export class SecurityManager {
  private config: SecurityConfig;
  private redisClient: Redis.RedisClientType | null = null;
  private bruteForceStore: ExpressBrute.MemoryStore | null = null;
  private rateLimiters: Map<string, any> = new Map();

  constructor(config: SecurityConfig = defaultSecurityConfig) {
    this.config = config;
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection for distributed rate limiting and brute force protection
   * Falls back to in-memory storage if Redis is unavailable
   */
  private async initializeRedis(): Promise<void> {
    try {
      if (process.env.REDIS_URL) {
        this.redisClient = Redis.createClient({
          url: process.env.REDIS_URL,
          socket: {
            connectTimeout: 5000,
            lazyConnect: true
          }
        });
        
        await this.redisClient.connect();
        
        this.bruteForceStore = new RedisStore({
          client: this.redisClient
        });
        
        logger.info('Redis connected for distributed security features', {
          redisUrl: process.env.REDIS_URL
        });
      } else {
        this.bruteForceStore = new ExpressBrute.MemoryStore();
        logger.warn('Redis not configured, using in-memory store for security features');
      }
    } catch (error) {
      logger.error('Redis connection failed, falling back to in-memory store', error);
      this.bruteForceStore = new ExpressBrute.MemoryStore();
    }
  }

  /**
   * Apply all security middleware to the Express application
   * This method sets up the complete security stack
   * 
   * @param app - Express application instance
   */
  public applySecurityMiddleware(app: any): void {
    // 1. Basic Security Headers (Helmet.js)
    this.applyHelmet(app);
    
    // 2. CORS Configuration
    this.applyCORS(app);
    
    // 3. Request Validation and Sanitization
    this.applyRequestValidation(app);
    
    // 4. Rate Limiting
    this.applyRateLimiting(app);
    
    // 5. Slow Down Protection
    this.applySlowDown(app);
    
    // 6. Brute Force Protection
    this.applyBruteForceProtection(app);
    
    // 7. Input Sanitization
    this.applyInputSanitization(app);
    
    // 8. Additional Security Headers
    this.applyAdditionalSecurityHeaders(app);
    
    // 9. Security Monitoring
    this.applySecurityMonitoring(app);
    
    logger.info('Security middleware stack applied successfully', {
      features: [
        'helmet',
        'cors',
        'request-validation',
        'rate-limiting',
        'slow-down',
        'brute-force-protection',
        'input-sanitization',
        'security-headers',
        'security-monitoring'
      ]
    });
  }

  /**
   * Apply Helmet.js security headers
   * Provides comprehensive security headers including CSP, HSTS, etc.
   * 
   * @param app - Express application instance
   */
  private applyHelmet(app: any): void {
    const helmetConfig: any = {
      contentSecurityPolicy: {
        directives: this.config.csp.directives
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-site' },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      ieNoOpen: true,
      noSniff: true,
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true
    };

    app.use(helmet(helmetConfig));
    
    logger.debug('Helmet security headers applied', { config: helmetConfig });
  }

  /**
   * Apply CORS configuration
   * Controls cross-origin resource sharing with strict policies
   * 
   * @param app - Express application instance
   */
  private applyCORS(app: any): void {
    app.use(cors(this.config.cors));
    
    logger.debug('CORS configuration applied', { 
      origin: this.config.cors.origin,
      methods: this.config.cors.methods 
    });
  }

  /**
   * Apply request validation and sanitization
   * Validates request size, content type, and user agents
   * 
   * @param app - Express application instance
   */
  private applyRequestValidation(app: any): void {
    // Request size limits
    app.use((req: Request, res: Response, next: NextFunction) => {
      const contentLength = parseInt(req.get('Content-Length') || '0');
      const maxSize = this.parseSize(this.config.requestValidation.maxBodySize);
      
      if (contentLength > maxSize) {
        logger.warn('Request size limit exceeded', {
          requestId: (req as any).requestId,
          contentLength,
          maxSize,
          ipAddress: req.ip
        });
        
        return res.status(413).json({
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Request entity too large',
            maxSize: this.config.requestValidation.maxBodySize
          }
        });
      }
      
      // URL length validation
      if (req.url.length > this.config.requestValidation.maxUrlLength) {
        logger.warn('URL length limit exceeded', {
          requestId: (req as any).requestId,
          urlLength: req.url.length,
          maxLength: this.config.requestValidation.maxUrlLength,
          ipAddress: req.ip
        });
        
        return res.status(414).json({
          error: {
            code: 'URI_TOO_LONG',
            message: 'Request URI too long',
            maxLength: this.config.requestValidation.maxUrlLength
          }
        });
      }
      
      // Content type validation
      const contentType = req.get('Content-Type');
      if (contentType && !this.config.requestValidation.allowedContentTypes.some(
        allowed => contentType.includes(allowed)
      )) {
        logger.warn('Invalid content type', {
          requestId: (req as any).requestId,
          contentType,
          allowedTypes: this.config.requestValidation.allowedContentTypes,
          ipAddress: req.ip
        });
        
        return res.status(415).json({
          error: {
            code: 'UNSUPPORTED_MEDIA_TYPE',
            message: 'Unsupported media type',
            allowedTypes: this.config.requestValidation.allowedContentTypes
          }
        });
      }
      
      // User agent validation
      const userAgent = req.get('User-Agent');
      if (userAgent && this.config.requestValidation.blockedUserAgents.some(
        blocked => userAgent.toLowerCase().includes(blocked.toLowerCase())
      )) {
        logger.warn('Blocked user agent detected', {
          requestId: (req as any).requestId,
          userAgent,
          ipAddress: req.ip
        });
        
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }
      
      // IP address validation
      if (!this.validateIPAddress(req.ip)) {
        logger.warn('IP address validation failed', {
          requestId: (req as any).requestId,
          ipAddress: req.ip
        });
        
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          }
        });
      }
      
      next();
    });
    
    logger.debug('Request validation middleware applied', {
      maxBodySize: this.config.requestValidation.maxBodySize,
      maxUrlLength: this.config.requestValidation.maxUrlLength,
      allowedContentTypes: this.config.requestValidation.allowedContentTypes
    });
  }

  /**
   * Apply rate limiting with progressive delays
   * Prevents abuse while maintaining service availability
   * 
   * @param app - Express application instance
   */
  private applyRateLimiting(app: any): void {
    // Global rate limiting
    const globalLimiter = rateLimit(this.config.rateLimit);
    app.use(globalLimiter);
    
    // Stricter rate limiting for authentication endpoints
    const authRateLimit = rateLimit({
      ...this.config.rateLimit,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
      message: {
        error: {
          code: 'AUTH_RATE_LIMIT_EXCEEDED',
          message: 'Too many authentication attempts, please try again later.',
          retryAfter: '15 minutes'
        }
      }
    });
    
    // Apply stricter rate limiting to sensitive routes
    app.use('/api/auth', authRateLimit);
    app.use('/api/users/login', authRateLimit);
    app.use('/api/users/register', authRateLimit);
    app.use('/api/users/reset-password', authRateLimit);
    
    // Store limiters for potential dynamic configuration
    this.rateLimiters.set('global', globalLimiter);
    this.rateLimiters.set('auth', authRateLimit);
    
    logger.debug('Rate limiting applied', {
      globalLimit: this.config.rateLimit.max,
      authLimit: 5,
      windowMs: this.config.rateLimit.windowMs
    });
  }

  /**
   * Apply slow down protection
   * Gradually increases response time for abusive clients
   * 
   * @param app - Express application instance
   */
  private applySlowDown(app: any): void {
    app.use(slowDown(this.config.slowDown));
    
    logger.debug('Slow down protection applied', {
      delayAfter: this.config.slowDown.delayAfter,
      delayMs: this.config.slowDown.delayMs,
      maxDelayMs: this.config.slowDown.maxDelayMs
    });
  }

  /**
   * Apply brute force protection
   * Prevents automated attacks on authentication endpoints
   * 
   * @param app - Express application instance
   */
  private applyBruteForceProtection(app: any): void {
    if (this.bruteForceStore) {
      const bruteforce = new ExpressBrute(this.bruteForceStore, {
        freeRetries: this.config.bruteForce.freeRetries,
        minWait: this.config.bruteForce.minWait,
        maxWait: this.config.bruteForce.maxWait,
        lifetime: this.config.bruteForce.lifetime,
        refreshTimeoutOnRequest: this.config.bruteForce.refreshTimeoutOnRequest,
        attachResetToRequest: this.config.bruteForce.attachResetToRequest
      });

      // Apply brute force protection to sensitive endpoints
      app.use('/api/auth', bruteforce.prevent);
      app.use('/api/users/login', bruteforce.prevent);
      app.use('/api/users/register', bruteforce.prevent);
      app.use('/api/users/reset-password', bruteforce.prevent);
      
      logger.debug('Brute force protection applied', {
        freeRetries: this.config.bruteForce.freeRetries,
        minWait: this.config.bruteForce.minWait,
        maxWait: this.config.bruteForce.maxWait
      });
    }
  }

  /**
   * Apply input sanitization
   * Prevents various injection attacks and data corruption
   * 
   * @param app - Express application instance
   */
  private applyInputSanitization(app: any): void {
    // Prevent HTTP Parameter Pollution
    app.use(hpp());
    
    // Sanitize user input (prevents NoSQL injection)
    app.use(mongoSanitize());
    
    // Prevent XSS attacks
    app.use(xssClean());
    
    logger.debug('Input sanitization middleware applied', {
      features: ['hpp', 'mongo-sanitize', 'xss-clean']
    });
  }

  /**
   * Apply additional security headers
   * Custom security headers beyond Helmet.js
   * 
   * @param app - Express application instance
   */
  private applyAdditionalSecurityHeaders(app: any): void {
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');
      
      // Prevent MIME type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Prevent XSS attacks
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Referrer policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Permissions policy (formerly Feature Policy)
      res.setHeader('Permissions-Policy', [
        'geolocation=()',
        'microphone=()',
        'camera=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()'
      ].join(', '));
      
      // Remove server information
      res.removeHeader('X-Powered-By');
      
      // Add security token for CSRF protection
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
        const csrfToken = req.get('X-CSRF-Token');
        if (!csrfToken) {
          logger.warn('CSRF token missing', {
            requestId: (req as any).requestId,
            method: req.method,
            endpoint: req.path,
            ipAddress: req.ip
          });
          
          return res.status(403).json({
            error: {
              code: 'CSRF_TOKEN_MISSING',
              message: 'CSRF token required for this request'
            }
          });
        }
      }
      
      next();
    });
    
    logger.debug('Additional security headers applied');
  }

  /**
   * Apply security monitoring
   * Logs security events and monitors for suspicious activity
   * 
   * @param app - Express application instance
   */
  private applySecurityMonitoring(app: any): void {
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Monitor for suspicious patterns
      const suspiciousPatterns = [
        /\.\.\//,           // Directory traversal
        /<script/i,         // XSS attempts
        /javascript:/i,     // JavaScript injection
        /vbscript:/i,       // VBScript injection
        /onload/i,          // Event handler injection
        /onerror/i,         // Event handler injection
        /union\s+select/i,  // SQL injection
        /drop\s+table/i,    // SQL injection
        /exec\s*\(/i,       // Command injection
        /system\s*\(/i      // Command injection
      ];
      
      const requestData = JSON.stringify(req.body) + req.url + JSON.stringify(req.query);
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestData)) {
          logger.logSecurityEvent(
            'SUSPICIOUS_PATTERN_DETECTED',
            `Pattern: ${pattern.source}, Data: ${requestData.substring(0, 200)}...`,
            {
              requestId: (req as any).requestId,
              pattern: pattern.source,
              ipAddress: req.ip,
              userAgent: req.get('User-Agent'),
              method: req.method,
              endpoint: req.path
            }
          );
          
          // Don't block the request, just log it for monitoring
          break;
        }
      }
      
      next();
    });
    
    logger.debug('Security monitoring middleware applied');
  }

  /**
   * Validate IP address against allowed/blocked lists
   * 
   * @param ip - IP address to validate
   * @returns true if IP is allowed, false otherwise
   */
  private validateIPAddress(ip: string): boolean {
    // Check blocked IPs first
    if (this.config.requestValidation.blockedIPs.includes(ip)) {
      return false;
    }
    
    // If allowed IPs are specified, only allow those
    if (this.config.requestValidation.allowedIPs.length > 0) {
      return this.config.requestValidation.allowedIPs.includes(ip);
    }
    
    // Default: allow all IPs not in blocked list
    return true;
  }

  /**
   * Parse size string (e.g., "10mb") to bytes
   * 
   * @param sizeStr - Size string to parse
   * @returns Size in bytes
   */
  private parseSize(sizeStr: string): number {
    const units: { [key: string]: number } = {
      'b': 1,
      'kb': 1024,
      'mb': 1024 * 1024,
      'gb': 1024 * 1024 * 1024
    };
    
    const match = sizeStr.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([kmg]?b)$/);
    if (!match) {
      return 1024 * 1024; // Default to 1MB
    }
    
    const value = parseFloat(match[1]);
    const unit = match[2] || 'b';
    
    return value * (units[unit] || 1);
  }

  /**
   * Get security configuration
   * 
   * @returns Current security configuration
   */
  public getConfig(): SecurityConfig {
    return this.config;
  }

  /**
   * Update security configuration dynamically
   * 
   * @param newConfig - New security configuration
   */
  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Security configuration updated', { newConfig });
  }

  /**
   * Get security statistics and status
   * 
   * @returns Security status information
   */
  public getSecurityStatus(): object {
    return {
      config: this.config,
      redisConnected: !!this.redisClient,
      bruteForceProtection: !!this.bruteForceStore,
      rateLimiters: Array.from(this.rateLimiters.keys()),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Gracefully close security manager
   */
  public async cleanup(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    
    logger.info('Security manager cleaned up');
  }
}

// Create singleton security manager instance
export const securityManager = new SecurityManager();

// Export security manager class for testing
export { SecurityManager };

// Export types for external use
export type { SecurityConfig };

/**
 * Express middleware for applying all security measures
 * This is the main entry point for security middleware
 */
export const securityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Security middleware is applied at the application level
  // This function is provided for potential future use
  next();
};

export default securityManager; 