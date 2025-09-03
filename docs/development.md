# 🛠️ Development Guide

## 📋 **Table of Contents**

- [🚀 Getting Started](#-getting-started)
- [🏗️ Project Setup](#️-project-setup)
- [🔒 Security Development](#-security-development)
- [📊 Logging & Monitoring](#-logging--monitoring)
- [🧪 Testing](#-testing)
- [📝 Code Quality](#-code-quality)
- [🚀 Deployment](#-deployment)
- [🔧 Development Tools](#️-development-tools)

## 🚀 **Getting Started**

### **Prerequisites**
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher (supports workspaces)
- **Git**: For version control
- **Docker**: For containerized development (optional)

### **Quick Start**
```bash
# Clone the repository
git clone https://github.com/your-org/craftify-email.git
cd craftify-email

# Install dependencies
npm install

# Start development environment
npm run dev

# Build all packages
npm run build

# Run tests
npm test
```

## 🏗️ **Project Setup**

### **Monorepo Structure**
```
craftify-email/
├── 📁 apps/                          # Application packages
│   ├── 📁 api/                       # Backend API server
│   └── 📁 web/                       # Frontend React application
├── 📁 packages/                      # Shared packages
│   └── 📁 shared/                    # Common utilities and types
├── 📁 docs/                          # Project documentation
├── 📁 scripts/                       # Build and deployment scripts
└── 📄 package.json                   # Root workspace configuration
```

### **Development Commands**
```bash
# Start API server
npm run dev:api

# Start web application
npm run dev:web

# Start both (concurrent)
npm run dev

# Build specific package
npm run build --workspace=apps/api
npm run build --workspace=apps/web

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 🔒 **Security Development**

### **Security Middleware Implementation**

The API implements comprehensive enterprise-grade security features that developers should understand:

#### **1. Security Headers (Helmet.js)**
```typescript
// Security headers configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:"],
      frameSrc: ["'none'"],           // Prevent clickjacking
      objectSrc: ["'none'"]           // Block dangerous objects
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },     // Prevent clickjacking
  noSniff: true,                      // Prevent MIME type sniffing
  xssFilter: true                     // Enable XSS filtering
};
```

#### **2. Rate Limiting Configuration**
```typescript
// Multi-tier rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // 100 requests per IP
  message: 'Rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false
});

// Authentication rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                     // 5 auth attempts per IP
  message: 'Too many authentication attempts'
});

// API-specific rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 30,                    // 30 requests per IP
  message: 'API rate limit exceeded'
});

// Slow down repeated requests
const slowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50,             // Delay after 50 requests
  delayMs: 500                // 500ms delay per request
});
```

#### **3. Input Validation & Sanitization**
```typescript
// Input validation middleware with Zod schemas
export function validateRequest(schema: ZodSchema, location: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[location];
      const validatedData = await schema.parseAsync(dataToValidate);
      req[location] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.errors.map(err => `${err.path.join('.')}: ${err.input}`)
          }
        });
      }
      next(error);
    }
  };
}

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitize(req.params);
  }
  
  next();
};
```

### **Security Best Practices**

#### **1. Input Validation**
- Always validate and sanitize user input
- Use Zod schemas for type-safe validation
- Implement request size limits
- Validate content types and file uploads

#### **2. Authentication & Authorization**
- Use JWT tokens with short expiration
- Implement refresh token rotation
- Validate user permissions on every request
- Log authentication events for security monitoring

#### **3. Data Sanitization**
- Encode output to prevent XSS attacks
- Use parameterized queries to prevent SQL injection
- Sanitize file uploads and user content
- Implement content security policies

## 📊 **Logging & Monitoring**

### **Structured Logging Implementation**

#### **1. Logger Configuration**
```typescript
// Winston logger setup with structured logging
class Logger {
  private logger: winston.Logger;
  
  constructor() {
    const transports: winston.transport[] = [];
    
    // Console transport for development
    if (process.env.NODE_ENV === 'development') {
      transports.push(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
    
    // File transport for production
    if (process.env.NODE_ENV === 'production') {
      transports.push(new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: 30
      }));
      
      // Error-specific log file
      transports.push(new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: 90,
        level: 'error'
      }));
      
      // Security event log file
      transports.push(new DailyRotateFile({
        filename: 'logs/security-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: 365,
        level: 'warn'
      }));
    }
    
    this.logger = winston.createLogger({
      level: this.getLogLevel(),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports
    });
  }
}
```

#### **2. Request Correlation**
```typescript
// Request correlation middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate or use existing request ID
  const requestId = req.get('X-Request-ID') || generateRequestId();
  req.requestId = requestId;
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Log request start
  logger.debug('Request started', {
    requestId,
    method: req.method,
    endpoint: req.path,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip
  });
  
  next();
};
```

#### **3. Security Event Logging**
```typescript
// Security event logging
export const logSecurityEvent = (event: string, details: any) => {
  logger.warn(`Security Event: ${event}`, {
    eventType: 'security',
    severity: 'high',
    timestamp: new Date().toISOString(),
    details,
    requestId: req.requestId,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });
};

// Usage examples
logSecurityEvent('IP address blocked', { ip: clientIP, reason: 'blacklisted' });
logSecurityEvent('Rate limit exceeded', { ip: clientIP, limit: '100 requests' });
logSecurityEvent('Suspicious pattern detected', { pattern: 'XSS attempt' });
```

### **Logging Best Practices**

#### **1. Log Levels**
- **ERROR**: Application errors that need immediate attention
- **WARN**: Warning conditions that should be monitored
- **INFO**: General application flow information
- **DEBUG**: Detailed debugging information (development only)
- **HTTP**: HTTP request/response logging

#### **2. Sensitive Data Handling**
```typescript
// Sanitize sensitive data before logging
const sanitizeLogData = (data: any): any => {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};
```

#### **3. Performance Monitoring**
```typescript
// Performance monitoring middleware
export const performanceLogger = (threshold: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      
      // Log slow requests
      if (responseTime > threshold) {
        logger.warn('Slow request detected', {
          requestId: req.requestId,
          method: req.method,
          endpoint: req.path,
          responseTime,
          threshold
        });
      }
      
      // Log performance metrics
      logger.info('Request performance', {
        method: req.method,
        endpoint: req.path,
        responseTime,
        statusCode: res.statusCode
      });
    });
    
    next();
  };
};
```

## 🧪 **Testing**

### **Testing Strategy**

#### **1. Unit Testing**
```typescript
// Jest configuration for API testing
describe('Security Middleware', () => {
  test('should prevent XSS attacks', async () => {
    const maliciousPayload = '<script>alert("xss")</script>';
    const response = await request(app)
      .post('/api/templates')
      .send({ content: maliciousPayload });
    
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
  
  test('should enforce rate limiting', async () => {
    const requests = Array(101).fill().map(() => 
      request(app).get('/api/templates')
    );
    
    const responses = await Promise.all(requests);
    const blockedRequests = responses.filter(r => r.status === 429);
    
    expect(blockedRequests.length).toBeGreaterThan(0);
  });
});
```

#### **2. Integration Testing**
```typescript
// API endpoint testing
describe('Template API', () => {
  test('should create template with valid data', async () => {
    const templateData = {
      name: 'Test Template',
      description: 'Test description',
      content: '<h1>Test</h1>',
      category: 'test'
    };
    
    const response = await request(app)
      .post('/api/templates')
      .set('Authorization', `Bearer ${validToken}`)
      .send(templateData);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(templateData.name);
  });
});
```

#### **3. Security Testing**
```typescript
// Security vulnerability testing
describe('Security Tests', () => {
  test('should block SQL injection attempts', async () => {
    const sqlInjectionPayload = "'; DROP TABLE users; --";
    const response = await request(app)
      .post('/api/users')
      .send({ query: sqlInjectionPayload });
    
    expect(response.status).toBe(400);
  });
  
  test('should prevent CSRF attacks', async () => {
    const response = await request(app)
      .post('/api/templates')
      .send(templateData);
      // No CSRF token
    
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('CSRF_TOKEN_MISSING');
  });
});
```

### **Testing Best Practices**

#### **1. Test Organization**
- Group tests by functionality
- Use descriptive test names
- Test both success and failure scenarios
- Mock external dependencies

#### **2. Security Testing**
- Test all security middleware
- Validate input sanitization
- Test rate limiting and blocking
- Verify authentication and authorization

#### **3. Performance Testing**
- Test response times under load
- Validate rate limiting effectiveness
- Test memory usage and leaks
- Monitor resource utilization

## 📝 **Code Quality**

### **ESLint Configuration**

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "error"
  }
}
```

### **Prettier Configuration**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### **TypeScript Configuration**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

### **Code Quality Standards**

#### **1. Type Safety**
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` type usage
- Use union types and generics appropriately

#### **2. Error Handling**
- Implement proper error boundaries
- Use custom error classes
- Log errors with context
- Provide user-friendly error messages

#### **3. Security Considerations**
- Validate all inputs
- Sanitize user content
- Implement proper authentication
- Use secure communication protocols

## 🚀 **Deployment**

### **Environment Configuration**

#### **1. Environment Variables**
```bash
# Security Configuration
NODE_ENV=production
CORS_ORIGIN=https://app.craftify-email.com
ENABLE_GEO_BLOCKING=true
ALLOWED_COUNTRIES=US,CA,GB,DE,FR

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=5

# Logging
LOG_LEVEL=warn
ENABLE_STRUCTURED_LOGGING=true
CLOUDWATCH_LOG_GROUP=craftify-api-logs

# Database
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
```

#### **2. Docker Configuration**
```dockerfile
# Multi-stage build for API
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### **Deployment Checklist**

#### **1. Pre-deployment**
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Environment variables configured

#### **2. Deployment**
- [ ] Database migrations applied
- [ ] SSL certificates configured
- [ ] Load balancer configured
- [ ] Monitoring enabled
- [ ] Backup systems verified

#### **3. Post-deployment**
- [ ] Health checks passing
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] Security monitoring active
- [ ] User acceptance testing completed

---

## 📚 **API Documentation (Swagger)**

### **Swagger Integration**

The API includes comprehensive Swagger/OpenAPI documentation for all endpoints, making it easy for developers to understand and test the API.

#### **1. Swagger UI Access**
- **Development**: `http://localhost:3001/api-docs`
- **Production**: `https://api.craftify-email.com/api-docs`
- **API Specification**: `https://api.craftify-email.com/api-docs.json`

#### **2. Swagger Configuration**
```typescript
// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Craftify Email API',
      version: '1.0.0',
      description: 'Enterprise-grade email template management API',
      contact: {
        name: 'API Support',
        email: 'api-support@craftify-email.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.craftify-email.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      }
    },
    security: [
      {
        bearerAuth: [],
        apiKey: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts']
};
```

#### **3. API Endpoint Documentation**

##### **Health & Status Endpoints**
```typescript
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current health status of the API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
```

##### **Template Management Endpoints**
```typescript
/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get all templates
 *     description: Retrieve a paginated list of email templates
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Template'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized - Invalid or missing authentication
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
```

#### **4. Schema Definitions**
```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Template:
 *       type: object
 *       required:
 *         - name
 *         - content
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique template identifier
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Template name
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Template description
 *         content:
 *           type: string
 *           description: HTML content of the template
 *         category:
 *           type: string
 *           enum: [marketing, transactional, notification, newsletter]
 *           description: Template category
 *         status:
 *           type: string
 *           enum: [draft, active, archived]
 *           default: draft
 *         createdBy:
 *           type: string
 *           format: uuid
 *           description: User ID who created the template
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Items per page
 *         total:
 *           type: integer
 *           description: Total number of items
 *         pages:
 *           type: integer
 *           description: Total number of pages
 */
```

#### **5. Testing with Swagger UI**

##### **Authentication Setup**
1. **JWT Token**: Use the `/auth/login` endpoint to get a JWT token
2. **API Key**: Add your API key in the `X-API-Key` header
3. **Authorization**: Click the "Authorize" button in Swagger UI

##### **Testing Workflow**
1. **Explore Endpoints**: Browse available endpoints by category
2. **Try It Out**: Click "Try it out" for any endpoint
3. **Fill Parameters**: Provide required parameters and request body
4. **Execute**: Click "Execute" to send the request
5. **View Response**: See the response, status code, and headers

##### **Example API Calls**
```bash
# Health check
curl -X GET "http://localhost:3001/health" \
  -H "accept: application/json"

# Get templates (with authentication)
curl -X GET "http://localhost:3001/api/templates?page=1&limit=10" \
  -H "accept: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create template
curl -X POST "http://localhost:3001/api/templates" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Welcome Email",
    "description": "Welcome email for new users",
    "content": "<h1>Welcome!</h1><p>Thank you for joining us.</p>",
    "category": "marketing"
  }'
```

#### **6. Swagger Best Practices**

##### **Documentation Standards**
- **Clear Descriptions**: Provide meaningful descriptions for all endpoints
- **Example Values**: Include realistic example values for parameters
- **Response Examples**: Show expected response formats
- **Error Codes**: Document all possible error responses
- **Authentication**: Clearly specify authentication requirements

##### **Security Documentation**
- **Bearer Tokens**: Document JWT authentication flow
- **API Keys**: Explain API key usage and permissions
- **Rate Limits**: Document rate limiting policies
- **IP Restrictions**: Note any IP-based access controls

##### **Maintenance**
- **Version Updates**: Keep API version information current
- **Endpoint Changes**: Update documentation when endpoints change
- **Schema Evolution**: Maintain backward compatibility in schemas
- **Regular Reviews**: Schedule periodic documentation reviews

---

## 🔧 **Development Tools**

### **Recommended Tools**

#### **1. Code Editors**
- **VS Code**: Primary development environment
- **Extensions**: TypeScript, ESLint, Prettier, GitLens

#### **2. API Testing**
- **Postman**: API endpoint testing
- **Insomnia**: Alternative API client
- **cURL**: Command-line API testing

#### **3. Database Tools**
- **DynamoDB Admin**: AWS DynamoDB management
- **Redis Commander**: Redis database management
- **MongoDB Compass**: MongoDB management (if applicable)

#### **4. Monitoring Tools**
- **AWS CloudWatch**: Log aggregation and metrics
- **Grafana**: Dashboard and visualization
- **Prometheus**: Metrics collection

### **Development Workflow**

#### **1. Feature Development**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature with security enhancements"

# Push and create pull request
git push origin feature/new-feature
```

#### **2. Code Review Process**
- Security review for all changes
- Performance impact assessment
- Documentation updates required
- Testing coverage verification

#### **3. Deployment Process**
- Automated testing in CI/CD
- Security scanning and validation
- Staging environment testing
- Production deployment with rollback capability

---

**Development Status**: 🟢 **Active Development** - Security, logging, and Swagger documentation complete, core features in development  
**Last Updated**: January 15, 2024  
**Next Review**: January 22, 2024 