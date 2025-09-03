# 🚀 Deployment Guide

## 📋 **Table of Contents**

- [🌟 Overview](#-overview)
- [🔒 Security Configuration](#-security-configuration)
- [📊 Monitoring & Logging](#-monitoring--logging)
- [🐳 Docker Deployment](#-docker-deployment)
- [☸️ Kubernetes Deployment](#️-kubernetes-deployment)
- [☁️ Cloud Deployment](#️-cloud-deployment)
- [🔧 Environment Configuration](#️-environment-configuration)
- [📈 Performance Optimization](#-performance-optimization)

## 🌟 **Overview**

This guide covers deploying the Craftify Email API with enterprise-grade security, comprehensive monitoring, and production-ready infrastructure. The deployment process ensures security compliance, high availability, and optimal performance.

### **🎯 Deployment Goals**

- **🔒 Security First**: OWASP Top 10 compliant deployment
- **📊 Observability**: Comprehensive logging and monitoring
- **🚀 Performance**: High-performance, scalable infrastructure
- **🔄 Reliability**: High availability with automated failover
- **📈 Scalability**: Auto-scaling based on demand

## 🔒 **Security Configuration**

### **Production Security Settings**

#### **1. Environment Variables**
```bash
# Security Configuration
NODE_ENV=production
ENABLE_SECURITY_FEATURES=true
ENABLE_RATE_LIMITING=true
ENABLE_IP_FILTERING=true
ENABLE_GEO_BLOCKING=true

# CORS Configuration
CORS_ORIGIN=https://app.craftify-email.com,https://admin.craftify-email.com
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=5
AUTH_RATE_LIMIT_WINDOW_MS=900000

# IP Filtering
ENABLE_IP_WHITELIST=false
ENABLE_IP_BLACKLIST=true
IP_BLACKLIST=192.168.1.100,10.0.0.50
ALLOWED_COUNTRIES=US,CA,GB,DE,FR,AU

# Security Headers
ENABLE_CSP=true
ENABLE_HSTS=true
ENABLE_FRAME_GUARD=true
ENABLE_XSS_PROTECTION=true
```

#### **2. Security Headers Configuration**
```typescript
// Production security headers
const productionSecurityConfig = {
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true
  },
  cors: {
    origin: ['https://app.craftify-email.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Origin', 'X-Requested-With', 'Content-Type', 'Accept',
      'Authorization', 'X-API-Key', 'X-Request-ID'
    ]
  }
};
```

#### **3. Rate Limiting Configuration**
```typescript
// Production rate limiting
const productionRateLimitConfig = {
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                   // 100 requests per IP
    message: 'Rate limit exceeded',
    standardHeaders: true,
    legacyHeaders: false
  },
  authentication: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                     // 5 attempts per IP
    message: 'Too many authentication attempts'
  },
  api: {
    windowMs: 1 * 60 * 1000,  // 1 minute
    max: 30,                    // 30 requests per IP
    message: 'API rate limit exceeded'
  }
};
```

### **Security Hardening Checklist**

- [ ] **HTTPS/TLS**: SSL certificates configured and valid
- [ ] **Security Headers**: All security headers enabled
- [ ] **Rate Limiting**: Multi-tier rate limiting active
- [ ] **IP Filtering**: Blacklist and whitelist configured
- [ ] **Input Validation**: All endpoints validate input
- [ ] **Authentication**: JWT tokens with proper expiration
- [ ] **Authorization**: Role-based access control active
- [ ] **Audit Logging**: Security events logged and monitored
- [ ] **Dependency Scanning**: Regular security updates
- [ ] **Penetration Testing**: Security testing completed

## 📊 **Monitoring & Logging**

### **Production Logging Configuration**

#### **1. Winston Logger Setup**
```typescript
// Production logging configuration
const productionLoggerConfig = {
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Application logs
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    }),
    // Error logs
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d',
      zippedArchive: true,
      level: 'error'
    }),
    // Security logs
    new DailyRotateFile({
      filename: 'logs/security-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '365d',
      zippedArchive: true,
      level: 'warn'
    })
  ]
};
```

#### **2. CloudWatch Integration**
```typescript
// AWS CloudWatch configuration
const cloudWatchConfig = {
  logGroupName: 'craftify-api-logs',
  logStreamName: `${process.env.NODE_ENV}-${process.env.APP_VERSION}`,
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};

// CloudWatch transport
const cloudWatchTransport = new winston.transports.CloudWatch(cloudWatchConfig);
```

#### **3. Health Check Endpoints**
```typescript
// Comprehensive health checks
app.get('/health', (_, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.environment,
    version: config.version,
    services: {
      database: checkDatabaseHealth(),
      redis: checkRedisHealth(),
      websocket: checkWebSocketHealth(),
      external: checkExternalServices()
    },
    system: {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    }
  };
  
  res.json(healthData);
});

// Detailed health check for Kubernetes
app.get('/health/detailed', async (_, res) => {
  try {
    const detailedHealth = await performDetailedHealthCheck();
    res.json(detailedHealth);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### **Monitoring Dashboard Configuration**

#### **1. Key Metrics to Monitor**
- **Performance Metrics**
  - API response times (p50, p95, p99)
  - Request throughput (RPS)
  - Error rates and types
  - Database query performance

- **Security Metrics**
  - Failed authentication attempts
  - Rate limit violations
  - Blocked IP addresses
  - Security event frequency

- **System Metrics**
  - CPU and memory utilization
  - Disk I/O and network usage
  - Container health and restart counts
  - External service availability

#### **2. Alerting Configuration**
```typescript
// Alert thresholds
const alertThresholds = {
  responseTime: {
    warning: 1000,    // 1 second
    critical: 5000    // 5 seconds
  },
  errorRate: {
    warning: 5,       // 5%
    critical: 10      // 10%
  },
  memoryUsage: {
    warning: 80,      // 80%
    critical: 90      // 90%
  },
  cpuUsage: {
    warning: 70,      // 70%
    critical: 85      // 85%
  }
};
```

## 🐳 **Docker Deployment**

### **Multi-stage Docker Build**

#### **1. API Dockerfile**
```dockerfile
# Multi-stage build for API
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build application
RUN npm run build

# Production runtime
FROM node:18-alpine AS runtime

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

#### **2. Web Application Dockerfile**
```dockerfile
# Multi-stage build for web application
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production runtime with nginx
FROM nginx:alpine AS runtime

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

#### **3. Docker Compose Configuration**
```yaml
version: '3.8'

services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    volumes:
      - ./logs:/app/logs
    depends_on:
      - redis
      - database
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - api
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  database:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  redis_data:
  postgres_data:
```

## ☸️ **Kubernetes Deployment**

### **Kubernetes Manifests**

#### **1. API Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: craftify-api
  namespace: craftify
  labels:
    app: craftify-api
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: craftify-api
  template:
    metadata:
      labels:
        app: craftify-api
        version: v1.0.0
    spec:
      serviceAccountName: craftify-api-sa
      containers:
      - name: api
        image: craftify/api:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3001
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3001"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: craftify-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: craftify-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        volumeMounts:
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: logs
        emptyDir: {}
      securityContext:
        fsGroup: 1001
```

#### **2. API Service**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: craftify-api-service
  namespace: craftify
  labels:
    app: craftify-api
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 3001
    protocol: TCP
    name: http
  selector:
    app: craftify-api
```

#### **3. Ingress Configuration**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: craftify-api-ingress
  namespace: craftify
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "15m"
spec:
  tls:
  - hosts:
    - api.craftify-email.com
    secretName: craftify-api-tls
  rules:
  - host: api.craftify-email.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: craftify-api-service
            port:
              number: 80
```

#### **4. Horizontal Pod Autoscaler**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: craftify-api-hpa
  namespace: craftify
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: craftify-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

### **Kubernetes Security Configuration**

#### **1. Network Policies**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: craftify-api-network-policy
  namespace: craftify
spec:
  podSelector:
    matchLabels:
      app: craftify-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3001
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - namespaceSelector:
        matchLabels:
          name: redis
    ports:
    - protocol: TCP
      port: 6379
```

#### **2. Pod Security Standards**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: craftify-api-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    fsGroup: 1001
  containers:
  - name: api
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
      seccompProfile:
        type: RuntimeDefault
```

## ☁️ **Cloud Deployment**

### **AWS Deployment**

#### **1. ECS Task Definition**
```json
{
  "family": "craftify-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/craftify-api:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3001"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:craftify/database-url"
        },
        {
          "name": "REDIS_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:craftify/redis-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/craftify-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### **2. Application Load Balancer**
```yaml
# ALB configuration
Resources:
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: craftify-api-alb
      Scheme: internet-facing
      Type: application
      SecurityGroups:
        - !Ref ALBSecurityGroup
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  ALBListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      LoadBalancerArn: !Ref ApplicationLoadBalancer
      Port: 443
      Protocol: HTTPS
      SslPolicy: ELBSecurityPolicy-TLS-1-2-2017-01
      Certificates:
        - CertificateArn: !Ref SSLCertificate
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref APITargetGroup

  APITargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: craftify-api-tg
      Port: 3001
      Protocol: HTTP
      VpcId: !Ref VPC
      TargetType: ip
      HealthCheckPath: /health
      HealthCheckIntervalSeconds: 30
      HealthCheckTimeoutSeconds: 5
      HealthyThresholdCount: 2
      UnhealthyThresholdCount: 3
```

### **Azure Deployment**

#### **1. Azure Container Instances**
```yaml
apiVersion: 2019-12-01
location: eastus
name: craftify-api
properties:
  containers:
  - name: api
    properties:
      image: craftify/api:latest
      ports:
      - port: 3001
        protocol: TCP
      environmentVariables:
      - name: NODE_ENV
        value: "production"
      - name: PORT
        value: "3001"
      resources:
        requests:
          memoryInGB: 1.0
          cpu: 0.5
        limits:
          memoryInGB: 2.0
          cpu: 1.0
      volumeMounts:
      - name: logs
        mountPath: /app/logs
  volumes:
  - name: logs
    azureFile:
      shareName: logs
      storageAccountName: craftifystorage
  osType: Linux
  restartPolicy: Always
  ipAddress:
    type: Public
    ports:
    - protocol: TCP
      port: 3001
    dnsNameLabel: craftify-api
```

## 🔧 **Environment Configuration**

### **Configuration Management**

#### **1. Environment-specific Configs**
```typescript
// Configuration by environment
const environmentConfigs = {
  development: {
    security: {
      cors: { origin: '*' },
      rateLimit: { max: 1000 },
      logging: { level: 'debug' }
    },
    database: {
      url: 'postgresql://localhost:5432/craftify_dev',
      pool: { min: 1, max: 5 }
    }
  },
  staging: {
    security: {
      cors: { origin: ['https://staging.craftify-email.com'] },
      rateLimit: { max: 500 },
      logging: { level: 'info' }
    },
    database: {
      url: process.env.DATABASE_URL,
      pool: { min: 5, max: 20 }
    }
  },
  production: {
    security: {
      cors: { origin: ['https://app.craftify-email.com'] },
      rateLimit: { max: 100 },
      logging: { level: 'warn' }
    },
    database: {
      url: process.env.DATABASE_URL,
      pool: { min: 10, max: 50 }
    }
  }
};
```

#### **2. Secrets Management**
```typescript
// AWS Secrets Manager integration
import { SecretsManager } from 'aws-sdk';

const secretsManager = new SecretsManager({
  region: process.env.AWS_REGION
});

async function getSecret(secretName: string): Promise<any> {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    return JSON.parse(data.SecretString || '{}');
  } catch (error) {
    logger.error('Failed to retrieve secret', error);
    throw error;
  }
}

// Usage
const databaseConfig = await getSecret('craftify/database-config');
const apiKeys = await getSecret('craftify/api-keys');
```

### **Configuration Validation**

#### **1. Environment Validation**
```typescript
// Environment validation at startup
function validateEnvironment(): void {
  const requiredEnvVars = [
    'NODE_ENV',
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'CORS_ORIGIN'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate environment-specific requirements
  if (process.env.NODE_ENV === 'production') {
    const productionVars = ['SSL_CERT_PATH', 'SSL_KEY_PATH', 'LOG_LEVEL'];
    const missingProdVars = productionVars.filter(varName => !process.env[varName]);
    
    if (missingProdVars.length > 0) {
      throw new Error(`Missing production environment variables: ${missingProdVars.join(', ')}`);
    }
  }
}
```

## 📈 **Performance Optimization**

### **Performance Tuning**

#### **1. Database Optimization**
```typescript
// Database connection pooling
const databaseConfig = {
  pool: {
    min: process.env.NODE_ENV === 'production' ? 10 : 2,
    max: process.env.NODE_ENV === 'production' ? 50 : 10,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  },
  connection: {
    timeout: 20000,
    query_timeout: 30000
  }
};
```

#### **2. Caching Strategy**
```typescript
// Redis caching configuration
const cacheConfig = {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3
  },
  ttl: {
    templates: 3600,        // 1 hour
    userPermissions: 1800,  // 30 minutes
    rateLimit: 900,         // 15 minutes
    session: 86400          // 24 hours
  }
};
```

#### **3. Response Optimization**
```typescript
// Response compression
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Response caching
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  }
  next();
});
```

### **Performance Monitoring**

#### **1. Performance Metrics**
```typescript
// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const responseTime = seconds * 1000 + nanoseconds / 1000000;
    
    // Log performance metrics
    logger.info('Request performance', {
      method: req.method,
      endpoint: req.path,
      responseTime: Math.round(responseTime),
      statusCode: res.statusCode,
      contentLength: res.get('Content-Length'),
      userAgent: req.get('User-Agent')
    });
    
    // Alert on slow requests
    if (responseTime > 1000) {
      logger.warn('Slow request detected', {
        requestId: req.requestId,
        responseTime: Math.round(responseTime),
        threshold: 1000
      });
    }
  });
  
  next();
};
```

---

**Deployment Status**: 🟢 **Production Ready** - Security and logging complete, deployment configurations ready  
**Last Updated**: January 15, 2024  
**Next Review**: January 22, 2024 