/**
 * Input Validation and Sanitization Middleware
 * 
 * This middleware provides comprehensive input validation and sanitization:
 * - Request body validation using Zod schemas
 * - Query parameter validation
 * - Path parameter validation
 * - Input sanitization and normalization
 * - Custom validation rules for business logic
 * - Detailed error messages for validation failures
 * - Security-focused validation (XSS, injection prevention)
 * 
 * @author Craftify Email Team
 * @version 1.0.0
 * @since 2024-01-15
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { logger } from '../config/logger';

/**
 * Validation error response interface
 * Provides consistent error structure for validation failures
 */
export interface ValidationErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details: string[];
    field: string;
    value: any;
    timestamp: string;
  };
}

/**
 * Validation context interface
 * Contains additional context for validation rules
 */
export interface ValidationContext {
  userId?: string;
  userRole?: string;
  domain?: string;
  requestId?: string;
  ipAddress?: string;
}

/**
 * Custom validation rules for business logic
 * Extends Zod with domain-specific validation
 */
export const customValidators = {
  /**
   * Validate email address format and domain restrictions
   * Ensures emails are properly formatted and from allowed domains
   */
  email: (allowedDomains?: string[]) => {
    return z.string()
      .email('Invalid email format')
      .min(5, 'Email must be at least 5 characters')
      .max(254, 'Email must be less than 254 characters')
      .refine((email) => {
        if (!allowedDomains || allowedDomains.length === 0) return true;
        const domain = email.split('@')[1];
        return allowedDomains.includes(domain);
      }, {
        message: `Email domain not allowed. Allowed domains: ${allowedDomains?.join(', ')}`
      })
      .transform((email) => email.toLowerCase().trim());
  },

  /**
   * Validate password strength requirements
   * Ensures passwords meet security standards
   */
  password: () => {
    return z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
      .refine((password) => {
        // Check for common weak passwords
        const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
        return !weakPasswords.includes(password.toLowerCase());
      }, {
        message: 'Password is too common, please choose a stronger password'
      });
  },

  /**
   * Validate template content for security
   * Prevents XSS and other injection attacks in email templates
   */
  templateContent: () => {
    return z.string()
      .min(1, 'Template content cannot be empty')
      .max(50000, 'Template content must be less than 50,000 characters')
      .refine((content) => {
        // Check for potentially dangerous HTML/JavaScript
        const dangerousPatterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
          /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
          /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(content));
      }, {
        message: 'Template content contains potentially dangerous elements'
      })
      .transform((content) => {
        // Basic HTML sanitization
        return content
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      });
  },

  /**
   * Validate file uploads
   * Ensures only safe file types and sizes are allowed
   */
  fileUpload: (maxSize: number = 10 * 1024 * 1024, allowedTypes: string[] = []) => {
    return z.object({
      fieldname: z.string().min(1, 'Field name is required'),
      originalname: z.string().min(1, 'Original filename is required'),
      encoding: z.string(),
      mimetype: z.string().refine((type) => {
        if (allowedTypes.length === 0) return true;
        return allowedTypes.includes(type);
      }, {
        message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      }),
      size: z.number().max(maxSize, `File size must be less than ${maxSize / (1024 * 1024)}MB`),
      destination: z.string().optional(),
      filename: z.string().optional(),
      path: z.string().optional(),
      buffer: z.any().optional()
    });
  },

  /**
   * Validate UUID format
   * Ensures IDs are properly formatted UUIDs
   */
  uuid: () => {
    return z.string().uuid('Invalid UUID format');
  },

  /**
   * Validate date strings and convert to Date objects
   * Ensures dates are valid and in the correct format
   */
  dateString: () => {
    return z.string()
      .datetime('Invalid date format')
      .transform((dateString) => new Date(dateString))
      .refine((date) => !isNaN(date.getTime()), {
        message: 'Invalid date value'
      });
  },

  /**
   * Validate pagination parameters
   * Ensures pagination is within reasonable limits
   */
  pagination: () => {
    return z.object({
      page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
      limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).default('desc')
    });
  },

  /**
   * Validate search parameters
   * Ensures search queries are safe and properly formatted
   */
  searchQuery: () => {
    return z.string()
      .min(1, 'Search query cannot be empty')
      .max(100, 'Search query must be less than 100 characters')
      .refine((query) => {
        // Check for potentially dangerous search patterns
        const dangerousPatterns = [
          /[<>]/g,           // HTML tags
          /javascript:/gi,   // JavaScript protocol
          /data:/gi,         // Data protocol
          /vbscript:/gi      // VBScript protocol
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(query));
      }, {
        message: 'Search query contains invalid characters'
      })
      .transform((query) => query.trim());
  }
};

/**
 * Base validation schemas for common operations
 * Provides reusable validation patterns
 */
export const baseSchemas = {
  /**
   * Base ID parameter validation
   * Ensures route parameters are valid UUIDs
   */
  idParam: z.object({
    id: customValidators.uuid()
  }),

  /**
   * Base pagination query validation
   * Ensures query parameters are properly formatted
   */
  paginationQuery: customValidators.pagination(),

  /**
   * Base search query validation
   * Ensures search parameters are safe
   */
  searchQuery: customValidators.searchQuery(),

  /**
   * Base timestamp validation
   * Ensures date parameters are valid
   */
  timestamp: customValidators.dateString()
};

/**
 * Validation middleware factory
 * Creates middleware functions for specific validation schemas
 */
export function validateRequest(
  schema: ZodSchema,
  location: 'body' | 'query' | 'params' = 'body',
  context?: ValidationContext
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[location];
      
      // Log validation attempt for security monitoring
      logger.debug('Validating request data', {
        location,
        endpoint: req.originalUrl,
        method: req.method,
        dataType: typeof dataToValidate,
        context
      });

      // Validate the data
      const validatedData = await schema.parseAsync(dataToValidate);
      
      // Replace the original data with validated data
      req[location] = validatedData;
      
      // Log successful validation
      logger.debug('Request validation successful', {
        location,
        endpoint: req.originalUrl,
        method: req.method,
        fields: Object.keys(validatedData)
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: (err as any).input || 'unknown'
        }));

        // Log validation failure for security monitoring
        logger.warn('Request validation failed', {
          location,
          endpoint: req.originalUrl,
          method: req.method,
          errors: validationErrors,
          context
        });

        // Return structured error response
        const errorResponse: ValidationErrorResponse = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: validationErrors.map(err => `${err.field}: ${err.message}`),
            field: validationErrors[0]?.field || 'unknown',
            value: validationErrors[0]?.received || 'unknown',
            timestamp: new Date().toISOString()
          }
        };

        return res.status(400).json(errorResponse);
      }

      // Handle unexpected errors
      logger.error('Unexpected error during validation', error as Error, {
        location,
        endpoint: req.originalUrl,
        method: req.method,
        context
      });

      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An internal error occurred during validation',
          timestamp: new Date().toISOString()
        }
      });
    }
  };
}

/**
 * Sanitize request data
 * Removes potentially dangerous content and normalizes data
 */
export function sanitizeRequest(req: Request, _res: Response, next: NextFunction): void {
  try {
    // Sanitize body data
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize path parameters
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Error during request sanitization', error as Error, {
      endpoint: req.originalUrl,
      method: req.method
    });
    
    next(error);
  }
}

/**
 * Recursively sanitize object properties
 * Removes dangerous content and normalizes data types
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip sensitive fields
      if (isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
        continue;
      }
      
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitize string values
 * Removes dangerous content and normalizes formatting
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str;

  return str
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters (except newlines and tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim leading/trailing whitespace
    .trim();
}

/**
 * Check if a field name is sensitive
 * Determines which fields should be redacted in logs
 */
function isSensitiveField(fieldName: string): boolean {
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'apiKey',
    'privateKey',
    'creditCard',
    'ssn',
    'socialSecurity'
  ];

  return sensitiveFields.some(field => 
    fieldName.toLowerCase().includes(field.toLowerCase())
  );
}

/**
 * Validate and sanitize file uploads
 * Ensures uploaded files are safe and properly formatted
 */
export function validateFileUpload(
  maxSize: number = 10 * 1024 * 1024,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if files exist in the request
      const files = (req as any).files;
      
      if (!files || Object.keys(files).length === 0) {
        return next();
      }

      const fileArray = Array.isArray(files) ? files : Object.values(files);
      
      for (const file of fileArray) {
        // Validate file size
        if (file.size > maxSize) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
              timestamp: new Date().toISOString()
            }
          });
        }

        // Validate file type
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_FILE_TYPE',
              message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
              timestamp: new Date().toISOString()
            }
          });
        }

        // Validate filename
        if (file.originalname.includes('..') || file.originalname.includes('/')) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_FILENAME',
              message: 'Filename contains invalid characters',
              timestamp: new Date().toISOString()
            }
          });
        }
      }

      next();
    } catch (error) {
      logger.error('Error during file upload validation', error as Error, {
        endpoint: req.originalUrl,
        method: req.method
      });

      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during file validation',
          timestamp: new Date().toISOString()
        }
      });
    }
  };
}

/**
 * Export all validation utilities for external use
 */
export {
  z,
  ZodError,
  ZodSchema
}; 