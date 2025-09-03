# Deployment Guide

## Overview

This guide covers the deployment process for Craftify Email, including infrastructure setup, CI/CD pipelines, monitoring, and production considerations.

## Infrastructure Architecture

### Target Infrastructure

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN           │    │   Load          │    │   Application  │
│   (CloudFront)  │◄──►│   Balancer      │◄──►│   Servers      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   S3 Bucket     │    │   Auto Scaling  │    │   ECS/Fargate   │
│   (Static)      │    │   Group         │    │   Containers    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### AWS Services

- **Frontend**: S3 + CloudFront for static hosting
- **Backend**: ECS/Fargate for containerized API
- **Database**: DynamoDB for data storage
- **Caching**: ElastiCache Redis for session and data caching
- **Monitoring**: CloudWatch for metrics and logging
- **Security**: WAF, IAM, and Secrets Manager

## Environment Configuration

### Environment Variables

#### Frontend (.env.production)
```bash
VITE_API_BASE_URL=https://api.craftify-email.com
VITE_APP_NAME=Craftify Email
VITE_APP_VERSION=1.0.0
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_ANALYTICS_ID=G-XXXXXXXXXX
```

#### Backend (.env.production)
```bash
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://craftify-email.com
JWT_SECRET=your-jwt-secret
OKTA_ISSUER=https://your-domain.okta.com
OKTA_CLIENT_ID=your-client-id
OKTA_CLIENT_SECRET=your-client-secret
DYNAMODB_REGION=us-east-1
REDIS_URL=redis://your-redis-endpoint
SENTRY_DSN=https://your-sentry-dsn
```

### Configuration Management

#### AWS Systems Manager Parameter Store
```bash
# Store sensitive configuration
aws ssm put-parameter \
  --name "/craftify-email/production/jwt-secret" \
  --value "your-secret-value" \
  --type "SecureString"

# Retrieve in application
aws ssm get-parameter \
  --name "/craftify-email/production/jwt-secret" \
  --with-decryption
```

## Containerization

### Docker Configuration

#### Frontend Dockerfile
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile
```dockerfile
# Backend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

EXPOSE 3001
CMD ["npm", "start"]
```

#### Docker Compose (Development)
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./apps/web
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:3001
    depends_on:
      - backend

  backend:
    build: ./apps/api
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
    depends_on:
      - redis
      - dynamodb-local

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  dynamodb-local:
    image: amazon/dynamodb-local
    ports:
      - "8000:8000"
    command: "-jar DynamoDBLocal.jar -sharedDb"
```

## CI/CD Pipeline

### GitHub Actions Workflow

#### Main Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: craftify-email
  ECS_CLUSTER: craftify-email-cluster
  ECS_SERVICE: craftify-email-service

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Type check
        run: npm run type-check

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push frontend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY-frontend:$IMAGE_TAG ./apps/web
          docker push $ECR_REGISTRY/$ECR_REPOSITORY-frontend:$IMAGE_TAG
      
      - name: Build and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY-backend:$IMAGE_TAG ./apps/api
          docker push $ECR_REGISTRY/$ECR_REPOSITORY-backend:$IMAGE_TAG

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service $ECS_SERVICE \
            --force-new-deployment
      
      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster $ECS_CLUSTER \
            --services $ECS_SERVICE
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

#### Staging Pipeline
```yaml
# .github/workflows/staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]
  pull_request:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to staging environment
        run: |
          # Deploy to staging environment
          echo "Deploying to staging..."
```

### Deployment Strategies

#### Blue-Green Deployment
```yaml
# ECS Blue-Green deployment configuration
{
  "deploymentController": {
    "type": "CODE_DEPLOY"
  },
  "deploymentConfiguration": {
    "deploymentCircuitBreaker": {
      "enable": true,
      "rollback": true
    },
    "maximumPercent": 200,
    "minimumHealthyPercent": 50
  }
}
```

#### Rolling Deployment
```yaml
# Rolling deployment configuration
{
  "deploymentConfiguration": {
    "maximumPercent": 200,
    "minimumHealthyPercent": 50
  }
}
```

## Infrastructure as Code

### Terraform Configuration

#### Main Infrastructure
```hcl
# infrastructure/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC and networking
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr   = var.vpc_cidr
}

# ECS cluster
module "ecs" {
  source = "./modules/ecs"
  
  environment     = var.environment
  vpc_id         = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
}

# DynamoDB tables
module "dynamodb" {
  source = "./modules/dynamodb"
  
  environment = var.environment
  tables     = var.dynamodb_tables
}

# CloudFront distribution
module "cloudfront" {
  source = "./modules/cloudfront"
  
  environment = var.environment
  domain_name = var.domain_name
  s3_bucket   = module.s3.bucket_name
}
```

#### ECS Service Module
```hcl
# infrastructure/modules/ecs/main.tf
resource "aws_ecs_service" "main" {
  name            = "${var.environment}-craftify-email"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnets
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "app"
    container_port   = 3001
  }

  deployment_controller {
    type = "ECS"
  }

  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 50
  }

  depends_on = [aws_lb_listener.main]
}
```

### CloudFormation Templates

#### DynamoDB Tables
```yaml
# infrastructure/cloudformation/dynamodb.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Craftify Email DynamoDB Tables'

Resources:
  EmailTemplatesTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub '${Environment}-email-templates'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: PK
          AttributeType: S
        - AttributeName: SK
          AttributeType: S
        - AttributeName: GSI1PK
          AttributeType: S
        - AttributeName: GSI1SK
          AttributeType: S
      KeySchema:
        - AttributeName: PK
          KeyType: HASH
        - AttributeName: SK
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: GSI1
          KeySchema:
            - AttributeName: GSI1PK
              KeyType: HASH
            - AttributeName: GSI1SK
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      Tags:
        - Key: Environment
          Value: !Ref Environment
        - Key: Application
          Value: craftify-email
```

## Monitoring and Observability

### Application Monitoring

#### Sentry Integration
```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/react';

export const initializeMonitoring = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV,
    release: import.meta.env.VITE_APP_VERSION,
    
    // Performance monitoring
    tracesSampleRate: 0.1,
    
    // Session tracking
    autoSessionTracking: true,
    
    // Error filtering
    beforeSend(event) {
      // Filter out certain errors
      if (event.exception) {
        const exception = event.exception.values?.[0];
        if (exception?.value?.includes('ResizeObserver')) {
          return null;
        }
      }
      return event;
    },
  });
};

export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, { extra: context });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};
```

#### Performance Monitoring
```typescript
// src/lib/performance.ts
export const trackPageLoad = () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
    };

    // Send to analytics
    trackEvent('page_load_performance', metrics);
  }
};

export const trackUserInteraction = (action: string, duration: number) => {
  trackEvent('user_interaction', { action, duration });
};
```

### Infrastructure Monitoring

#### CloudWatch Dashboards
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ECS", "CPUUtilization", "ServiceName", "craftify-email"],
          ["AWS/ECS", "MemoryUtilization", "ServiceName", "craftify-email"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "ECS Service Metrics"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", "craftify-email-lb"],
          ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "craftify-email-lb"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "Load Balancer Metrics"
      }
    }
  ]
}
```

#### Log Aggregation
```typescript
// src/lib/logging.ts
export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    const logEntry = {
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.VITE_APP_ENV,
    };
    
    console.log(JSON.stringify(logEntry));
    
    // Send to CloudWatch Logs in production
    if (import.meta.env.VITE_APP_ENV === 'production') {
      // CloudWatch Logs integration
    }
  },
  
  error: (message: string, error?: Error, context?: Record<string, any>) => {
    const logEntry = {
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.VITE_APP_ENV,
    };
    
    console.error(JSON.stringify(logEntry));
    
    // Send to error monitoring
    if (import.meta.env.VITE_APP_ENV === 'production') {
      captureError(error || new Error(message), context);
    }
  },
};
```

## Security Configuration

### Network Security

#### Security Groups
```hcl
# infrastructure/modules/ecs/security-groups.tf
resource "aws_security_group" "ecs" {
  name_prefix = "${var.environment}-ecs-"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-ecs-security-group"
  }
}
```

#### WAF Rules
```yaml
# infrastructure/waf-rules.yml
Rules:
  - Name: RateLimitRule
    Priority: 1
    Statement:
      RateBasedStatement:
        Limit: 2000
        AggregateKeyType: IP
    Action:
      Block: {}
    VisibilityConfig:
      SampledRequestsEnabled: true
      CloudWatchMetricsEnabled: true
      MetricName: RateLimitRule

  - Name: SQLInjectionRule
    Priority: 2
    Statement:
      ManagedRuleGroupStatement:
        VendorName: AWS
        Name: AWSManagedRulesSQLiRuleSet
    Action:
      Allow: {}
    VisibilityConfig:
      SampledRequestsEnabled: true
      CloudWatchMetricsEnabled: true
      MetricName: SQLInjectionRule
```

### Data Security

#### Encryption at Rest
```hcl
# DynamoDB encryption
resource "aws_dynamodb_table" "main" {
  # ... other configuration
  
  server_side_encryption {
    enabled = true
  }
  
  point_in_time_recovery {
    enabled = true
  }
}
```

#### Encryption in Transit
```hcl
# ALB HTTPS configuration
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}
```

## Backup and Recovery

### Database Backups

#### DynamoDB Point-in-Time Recovery
```hcl
resource "aws_dynamodb_table" "main" {
  # ... other configuration
  
  point_in_time_recovery {
    enabled = true
  }
}
```

#### Automated Backup Strategy
```yaml
# Backup configuration
BackupConfiguration:
  BackupRetentionPeriod: 7
  BackupWindow: "03:00-04:00"
  MaintenanceWindow: "sun:04:00-sun:05:00"
```

### Disaster Recovery

#### Multi-Region Setup
```hcl
# Multi-region configuration
provider "aws" {
  alias  = "us-west-2"
  region = "us-west-2"
}

module "dynamodb_west" {
  source = "./modules/dynamodb"
  
  providers = {
    aws = aws.us-west-2
  }
  
  environment = var.environment
  tables     = var.dynamodb_tables
}
```

#### Recovery Procedures
```markdown
# Disaster Recovery Runbook

## Database Recovery
1. Identify the point of failure
2. Restore from the latest backup
3. Apply any pending transactions
4. Verify data integrity
5. Update DNS and routing

## Application Recovery
1. Deploy to backup region
2. Update configuration
3. Verify connectivity
4. Test critical functionality
5. Switch traffic to backup region
```

## Performance Optimization

### Frontend Optimization

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build:analyze

# Bundle analyzer configuration
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

#### CDN Configuration
```hcl
# CloudFront optimization
resource "aws_cloudfront_distribution" "main" {
  # ... other configuration
  
  default_cache_behavior {
    target_origin_id       = aws_s3_bucket.main.id
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }
  
  price_class = "PriceClass_100"
}
```

### Backend Optimization

#### Auto Scaling
```hcl
resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.main.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Secrets updated in AWS

### Deployment
- [ ] Infrastructure updated
- [ ] Containers built and pushed
- [ ] ECS service updated
- [ ] Health checks passing
- [ ] Load balancer configured
- [ ] DNS updated
- [ ] SSL certificates valid

### Post-Deployment
- [ ] Application accessible
- [ ] Core functionality working
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested
- [ ] Rollback plan ready

## Troubleshooting

### Common Deployment Issues

#### Container Health Checks
```bash
# Check container logs
aws logs describe-log-groups --log-group-name-prefix "/ecs/craftify-email"

# Check ECS service status
aws ecs describe-services --cluster craftify-email --services craftify-email-service

# Check target group health
aws elbv2 describe-target-health --target-group-arn your-target-group-arn
```

#### Performance Issues
```bash
# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=craftify-email \
  --start-time 2024-01-15T00:00:00Z \
  --end-time 2024-01-15T23:59:59Z \
  --period 300 \
  --statistics Average
```

### Rollback Procedures

#### Quick Rollback
```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster craftify-email \
  --service craftify-email-service \
  --task-definition craftify-email:previous-revision
```

#### Database Rollback
```bash
# Restore from point-in-time
aws dynamodb restore-table-from-backup \
  --target-table-name craftify-email-restored \
  --backup-arn your-backup-arn
```

## Cost Optimization

### Resource Optimization

#### Right-sizing
- Monitor CPU and memory utilization
- Adjust ECS task CPU/memory allocation
- Use Spot instances for non-critical workloads
- Implement auto-scaling based on demand

#### Storage Optimization
- Use S3 lifecycle policies for old data
- Implement data archiving strategies
- Monitor DynamoDB read/write capacity
- Use CloudFront for static asset delivery

### Monitoring and Alerts

#### Cost Alerts
```yaml
# CloudWatch cost anomaly detection
Resources:
  CostAnomalyDetector:
    Type: AWS::CE::AnomalyDetector
    Properties:
      Monitor:
        DimensionalValueCount: 10
      AnomalySubscription:
        Frequency: DAILY
        Subscribers:
          - Address: your-email@example.com
            Type: EMAIL
```

## Future Considerations

### Scalability Improvements
- Implement microservices architecture
- Use event-driven patterns
- Add read replicas for database
- Implement caching layers

### Technology Evolution
- Container orchestration with Kubernetes
- Serverless functions for specific workloads
- Edge computing for global performance
- AI/ML integration for analytics

### Compliance and Governance
- SOC 2 compliance
- GDPR compliance
- Data residency requirements
- Audit trail enhancements 