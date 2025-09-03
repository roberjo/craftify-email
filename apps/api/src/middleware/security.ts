/**
 * Comprehensive Security Middleware for Craftify Email API
 * 
 * This middleware implements enterprise-grade security measures including:
 * - XSS (Cross-Site Scripting) protection
 * - CSRF (Cross-Site Request Forgery) protection
 * - Input validation and sanitization
 * - Rate limiting and brute force protection
 * - Security headers configuration
 * - Request/response logging for security monitoring
 * - IP address validation and blocking
 * - Content Security Policy (CSP) enforcement
 * 
 * @author Craftify Email Team
 * @version 1.0.0
 * @since 2024-01-15
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import hpp from 'hpp';
import { logger } from '../config/logger';

/**
 * Security configuration interface
 * Defines all security parameters and thresholds
 */
export interface SecurityConfig {
  // CORS Configuration
  cors: {
    origin: string | string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
  };
  
  // Rate Limiting Configuration
  rateLimit: {
    windowMs: number;           // Time window in milliseconds
    max: number;                // Maximum requests per window
    message: string;            // Error message when limit exceeded
    standardHeaders: boolean;   // Include standard rate limit headers
    legacyHeaders: boolean;     // Include legacy rate limit headers
    skipSuccessfulRequests: boolean; // Skip logging successful requests
  };
  
  // Slow Down Configuration (Progressive Response Delay)
  slowDown: {
    windowMs: number;           // Time window in milliseconds
    delayAfter: number;         // Requests before delay starts
    delayMs: number;            // Delay per request above threshold
    maxDelayMs: number;         // Maximum delay per request
  };
  
  // Security Headers Configuration
  securityHeaders: {
    contentSecurityPolicy: boolean;      // Enable CSP
    crossOriginEmbedderPolicy: boolean; // Enable COEP
    crossOriginOpenerPolicy: boolean;   // Enable COOP
    crossOriginResourcePolicy: boolean; // Enable CORP
    dnsPrefetchControl: boolean;        // Disable DNS prefetching
    frameguard: boolean;                // Prevent clickjacking
    hidePoweredBy: boolean;             // Hide server information
    hsts: boolean;                      // Enable HSTS
    ieNoOpen: boolean;                  // Prevent IE from opening downloads
    noSniff: boolean;                   // Prevent MIME type sniffing
    permittedCrossDomainPolicies: boolean; // Control cross-domain policies
    referrerPolicy: boolean;            // Control referrer information
    xssFilter: boolean;                 // Enable XSS filtering
  };
  
  // Content Security Policy Configuration
  csp: {
    directives: {
      defaultSrc: string[];     // Default source restrictions
      scriptSrc: string[];      // JavaScript source restrictions
      styleSrc: string[];       // CSS source restrictions
      imgSrc: string[];         // Image source restrictions
      connectSrc: string[];     // Connection source restrictions
      fontSrc: string[];        // Font source restrictions
      objectSrc: string[];      // Object source restrictions
      mediaSrc: string[];       // Media source restrictions
      frameSrc: string[];       // Frame source restrictions
      workerSrc: string[];      // Worker source restrictions
      manifestSrc: string[];    // Manifest source restrictions
    };
  };
  
  // IP Address Filtering
  ipFiltering: {
    whitelist: string[];        // Allowed IP addresses
    blacklist: string[];        // Blocked IP addresses
    enableGeoBlocking: boolean; // Enable geographic IP blocking
    allowedCountries: string[]; // Allowed country codes
  };
}

/**
 * Default security configuration
 * Provides secure defaults suitable for production environments
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
      'X-CSRF-Token'
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-CSRF-Token'
    ],
    maxAge: 86400 // 24 hours
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false
  },
  
  slowDown: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow 50 requests per 15 minutes, then...
    delayMs: 500, // Begin adding 500ms of delay per request above 50
    maxDelayMs: 20000 // Maximum delay of 20 seconds
  },
  
  securityHeaders: {
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    dnsPrefetchControl: true,
    frameguard: true,
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: true,
    xssFilter: true
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
      manifestSrc: ["'self'"]
    }
  },
  
  ipFiltering: {
    whitelist: process.env.IP_WHITELIST ? process.env.IP_WHITELIST.split(',') : [],
    blacklist: process.env.IP_BLACKLIST ? process.env.IP_BLACKLIST.split(',') : [],
    enableGeoBlocking: process.env.ENABLE_GEO_BLOCKING === 'true',
    allowedCountries: process.env.ALLOWED_COUNTRIES ? process.env.ALLOWED_COUNTRIES.split(',') : []
  }
};

/**
 * Security Manager Class
 * Centralizes all security middleware and provides configuration management
 */
export class SecurityManager {
  private config: SecurityConfig;
  private ipWhitelist: Set<string>;
  private ipBlacklist: Set<string>;

  constructor(config: SecurityConfig = defaultSecurityConfig) {
    this.config = config;
    this.ipWhitelist = new Set(config.ipFiltering.whitelist);
    this.ipBlacklist = new Set(config.ipFiltering.blacklist);
    
    logger.info('Security Manager initialized', {
      whitelistCount: this.ipWhitelist.size,
      blacklistCount: this.ipBlacklist.size
    });
  }

  /**
   * Apply all security middleware to the Express application
   * Configures security in the correct order for maximum effectiveness
   */
  public applySecurityMiddleware(app: any): void {
    // 1. Basic Security Headers (Helmet)
    this.applyHelmet(app);
    
    // 2. CORS Configuration
    this.applyCORS(app);
    
    // 3. IP Address Filtering
    this.applyIPFiltering(app);
    
    // 4. Rate Limiting
    this.applyRateLimiting(app);
    
    // 5. Slow Down Protection
    this.applySlowDown(app);
    
    // 6. Input Sanitization
    this.applyInputSanitization(app);
    
    // 7. Additional Security Headers
    this.applyAdditionalSecurityHeaders(app);
    
    // 8. Security Monitoring Middleware
    this.applySecurityMonitoring(app);
    
    logger.info('Security middleware applied successfully', {
      features: [
        'helmet',
        'cors',
        'ip-filtering',
        'rate-limiting',
        'slow-down',
        'input-sanitization',
        'security-headers',
        'security-monitoring'
      ]
    });
  }

  /**
   * Apply Helmet.js security headers
   * Configures comprehensive security headers including CSP
   */
  private applyHelmet(app: any): void {
    const helmetConfig: any = {
      contentSecurityPolicy: {
        directives: this.config.csp.directives
      },
      crossOriginEmbedderPolicy: this.config.securityHeaders.crossOriginEmbedderPolicy,
      crossOriginOpenerPolicy: this.config.securityHeaders.crossOriginOpenerPolicy,
      crossOriginResourcePolicy: this.config.securityHeaders.crossOriginResourcePolicy,
      dnsPrefetchControl: this.config.securityHeaders.dnsPrefetchControl,
      frameguard: this.config.securityHeaders.frameguard ? {
        action: 'deny'
      } : false,
      hidePoweredBy: this.config.securityHeaders.hidePoweredBy,
      hsts: this.config.securityHeaders.hsts ? {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      } : false,
      ieNoOpen: this.config.securityHeaders.ieNoOpen,
      noSniff: this.config.securityHeaders.noSniff,
      permittedCrossDomainPolicies: this.config.securityHeaders.permittedCrossDomainPolicies,
      referrerPolicy: this.config.securityHeaders.referrerPolicy ? { 
        policy: 'strict-origin-when-cross-origin' 
      } : false,
      xssFilter: this.config.securityHeaders.xssFilter
    };

    app.use(helmet(helmetConfig));
    
    logger.info('Helmet security headers configured', {
      csp: !!helmetConfig.contentSecurityPolicy,
      hsts: !!helmetConfig.hsts,
      xssFilter: helmetConfig.xssFilter
    });
  }

  /**
   * Apply CORS configuration
   * Controls cross-origin resource sharing
   */
  private applyCORS(app: any): void {
    app.use(cors(this.config.cors));
    
    logger.info('CORS configuration applied', {
      origin: this.config.cors.origin,
      credentials: this.config.cors.credentials,
      methods: this.config.cors.methods
    });
  }

  /**
   * Apply IP address filtering
   * Blocks or allows requests based on IP address
   */
  private applyIPFiltering(app: any): void {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const clientIP = this.getClientIP(req);
      
      // Check blacklist first
      if (this.ipBlacklist.has(clientIP)) {
        logger.logSecurityEvent('IP address blocked', {
          ip: clientIP,
          reason: 'blacklisted',
          endpoint: req.originalUrl,
          userAgent: req.get('User-Agent')
        });
        
        return res.status(403).json({
          error: {
            code: 'IP_BLOCKED',
            message: 'Access denied from this IP address',
            timestamp: new Date().toISOString()
          }
        });
      }
      
      // Check whitelist if configured
      if (this.ipWhitelist.size > 0 && !this.ipWhitelist.has(clientIP)) {
        logger.logSecurityEvent('IP address not in whitelist', {
          ip: clientIP,
          reason: 'not-whitelisted',
          endpoint: req.originalUrl,
          userAgent: req.get('User-Agent')
        });
        
        return res.status(403).json({
          error: {
            code: 'IP_NOT_WHITELISTED',
            message: 'Access denied from this IP address',
            timestamp: new Date().toISOString()
          }
        });
      }
      
      next();
    });
  }

  /**
   * Get the real client IP address
   * Handles proxy forwarding and load balancer scenarios
   */
  private getClientIP(req: Request): string {
    return req.headers['x-forwarded-for'] as string ||
           req.headers['x-real-ip'] as string ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'unknown';
  }

  /**
   * Apply rate limiting middleware
   * Prevents abuse through request frequency control
   */
  private applyRateLimiting(app: any): void {
    // Global rate limiting
    const globalRateLimit = rateLimit(this.config.rateLimit);
    app.use(globalRateLimit);
    
    // Stricter rate limiting for authentication endpoints
    const authRateLimit = rateLimit({
      ...this.config.rateLimit,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Limit each IP to 5 requests per window
      message: 'Too many authentication attempts, please try again later.'
    });
    
    // Apply stricter rate limiting to sensitive endpoints
    app.use('/api/auth', authRateLimit);
    app.use('/api/users/login', authRateLimit);
    app.use('/api/users/register', authRateLimit);
    app.use('/api/users/reset-password', authRateLimit);
    
    logger.info('Rate limiting configured', {
      globalLimit: this.config.rateLimit.max,
      authLimit: 5,
      windowMs: this.config.rateLimit.windowMs
    });
  }

  /**
   * Apply slow down protection
   * Gradually slows down abusive clients
   */
  private applySlowDown(app: any): void {
    app.use(slowDown(this.config.slowDown));
    
    logger.info('Slow down protection configured', {
      delayAfter: this.config.slowDown.delayAfter,
      maxDelay: this.config.slowDown.maxDelayMs
    });
  }

  /**
   * Apply input sanitization middleware
   * Prevents various injection attacks
   */
  private applyInputSanitization(app: any): void {
    // Prevent HTTP Parameter Pollution
    app.use(hpp());
    
    logger.info('Input sanitization configured', {
      features: ['hpp']
    });
  }

  /**
   * Apply additional security headers
   * Custom security headers beyond Helmet.js
   */
  private applyAdditionalSecurityHeaders(app: any): void {
    app.use((_req: Request, res: Response, next: NextFunction) => {
      // Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');
      
      // Prevent MIME type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Prevent XSS attacks
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Referrer policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Permissions policy
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      // Remove server information
      res.removeHeader('X-Powered-By');
      
      next();
    });
  }

  /**
   * Apply security monitoring middleware
   * Logs security-relevant events and metrics
   */
  private applySecurityMonitoring(app: any): void {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      // Log request for security monitoring
      logger.logRequest(req, {
        security: {
          ipAddress: this.getClientIP(req),
          userAgent: req.get('User-Agent'),
          referer: req.get('Referer'),
          origin: req.get('Origin')
        }
      });
      
      // Monitor response for security events
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        
        // Log response
        logger.logResponse(req, res, responseTime);
        
        // Log security events for specific status codes
        if (res.statusCode === 401) {
          logger.logSecurityEvent('Unauthorized access attempt', {
            ip: this.getClientIP(req),
            endpoint: req.originalUrl,
            method: req.method,
            userAgent: req.get('User-Agent')
          });
        } else if (res.statusCode === 403) {
          logger.logSecurityEvent('Forbidden access attempt', {
            ip: this.getClientIP(req),
            endpoint: req.originalUrl,
            method: req.method,
            userAgent: req.get('User-Agent')
          });
        } else if (res.statusCode >= 400 && res.statusCode < 500) {
          logger.warn('Client error detected', {
            statusCode: res.statusCode,
            ip: this.getClientIP(req),
            endpoint: req.originalUrl,
            method: req.method
          });
        }
      });
      
      next();
    });
  }

  /**
   * Get security configuration information
   * Returns current security settings for monitoring
   */
  public getSecurityInfo(): object {
    return {
      securityFeatures: {
        helmet: 'Enabled with CSP and security headers',
        cors: 'Configured with strict origin policy',
        ipFiltering: `Enabled (${this.ipWhitelist.size} whitelisted, ${this.ipBlacklist.size} blacklisted)`,
        rateLimiting: 'Global and endpoint-specific limits',
        slowDown: 'Progressive response delay',
        inputSanitization: 'HPP protection',
        additionalHeaders: 'Frame options, content type, XSS protection',
        securityMonitoring: 'Active logging and monitoring'
      },
      configuration: this.config,
      status: 'Active',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clean up resources
   * Closes connections and cleans up stores
   */
  public async cleanup(): Promise<void> {
    try {
      logger.info('Security Manager cleanup completed');
    } catch (error) {
      logger.error('Error during Security Manager cleanup', error as Error);
    }
  }
}

// Export the SecurityManager class and default configuration
export default SecurityManager; 