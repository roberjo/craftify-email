# 📚 API Documentation

## 📋 **Table of Contents**

- [🌟 Overview](#-overview)
- [🔐 Authentication & Security](#-authentication--security)
- [📊 API Endpoints](#-api-endpoints)
- [📝 Request/Response Formats](#-requestresponse-formats)
- [🔒 Security Features](#-security-features)
- [📊 Logging & Monitoring](#-logging--monitoring)
- [🧪 Testing & Examples](#-testing--examples)
- [📈 Rate Limiting](#-rate-limiting)
- [🚨 Error Handling](#-error-handling)
- [📚 Swagger Documentation](#-swagger-documentation)

## 🌟 **Overview**

The Craftify Email API provides a comprehensive RESTful interface for email template management with enterprise-grade security, real-time collaboration, and advanced workflow capabilities. Built with security-first principles, the API implements comprehensive input validation, rate limiting, and threat protection.

### **🎯 API Features**

- **🔒 Enterprise Security**: OWASP Top 10 compliant with advanced threat protection
- **📊 Structured Logging**: Comprehensive request/response logging with correlation IDs
- **🚦 Rate Limiting**: Multi-tier rate limiting with progressive delays
- **✅ Input Validation**: Comprehensive input sanitization and validation
- **📚 Interactive Documentation**: Swagger/OpenAPI 3.0 documentation
- **🌐 Real-time Features**: WebSocket support for live collaboration
- **📱 RESTful Design**: Standard REST API patterns and conventions

### **🔗 Base URL**

```
Development: http://localhost:3001
Production:  https://api.craftify-email.com
```

### **📊 API Versioning**

- **Current Version**: v1.0.0
- **Version Header**: `X-API-Version: 1.0.0`
- **Deprecation Policy**: 6-month notice for breaking changes

## 🔐 **Authentication & Security**

### **Authentication Methods**

#### **1. JWT Bearer Token (Primary)**
```http
Authorization: Bearer <jwt_token>
```

#### **2. API Key (Alternative)**
```http
X-API-Key: <api_key>
```

#### **3. Session Cookie (Web Application)**
```http
Cookie: session=<session_id>
```

### **Security Headers**

The API automatically includes comprehensive security headers:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### **CORS Configuration**

```typescript
cors: {
  origin: ['https://app.craftify-email.com', 'https://admin.craftify-email.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin', 'X-Requested-With', 'Content-Type', 'Accept',
    'Authorization', 'X-API-Key', 'X-Request-ID'
  ],
  exposedHeaders: [
    'X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'
  ]
}
```

## 📊 **API Endpoints**

### **System Endpoints**

#### **1. Health Check**
```http
GET /health
```

**Purpose**: System health monitoring and load balancer health checks

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 86400.5,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "websocket": "healthy"
  },
  "memory": {
    "used": 256,
    "total": 512,
    "external": 64
  }
}
```

**Status Codes**:
- `200 OK`: System healthy
- `503 Service Unavailable`: System unhealthy

#### **2. API Information**
```http
GET /api
```

**Purpose**: API metadata and available endpoints

**Response**:
```json
{
  "success": true,
  "data": {
    "name": "Craftify Email API",
    "version": "1.0.0",
    "description": "Enterprise Email Template Management System API",
    "endpoints": {
      "health": "/health",
      "api": "/api",
      "swagger": "/api-docs",
      "templates": "/api/templates",
      "users": "/api/users",
      "approvals": "/api/approvals"
    },
    "documentation": {
      "swagger": "/api-docs",
      "openapi": "/api-docs/swagger.json"
    },
    "security": {
      "authentication": "JWT Bearer Token",
      "rateLimiting": "Enabled",
      "cors": "Configured",
      "csp": "Enabled"
    }
  }
}
```

#### **3. Security Status**
```http
GET /security
```

**Purpose**: Security configuration and status information

**Response**:
```json
{
  "success": true,
  "data": {
    "securityFeatures": {
      "helmet": "Enabled with CSP and security headers",
      "cors": "Configured with strict origin policy",
      "ipFiltering": "Enabled (0 whitelisted, 0 blacklisted)",
      "rateLimiting": "Global and endpoint-specific limits",
      "slowDown": "Progressive response delay",
      "inputSanitization": "HPP protection",
      "additionalHeaders": "Frame options, content type, XSS protection",
      "securityMonitoring": "Active logging and monitoring"
    },
    "configuration": {
      "cors": { /* CORS configuration */ },
      "rateLimit": { /* Rate limiting configuration */ },
      "securityHeaders": { /* Security headers configuration */ }
    },
    "status": "Active",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### **Template Management Endpoints**

#### **1. List Templates**
```http
GET /api/templates
```

**Purpose**: Retrieve paginated list of email templates

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sortBy` (string): Sort field (name, createdAt, updatedAt)
- `sortOrder` (string): Sort direction (asc, desc)
- `category` (string): Filter by category
- `status` (string): Filter by status (draft, published, archived)
- `search` (string): Search query for template names and descriptions

**Headers**:
```http
Authorization: Bearer <jwt_token>
X-Request-ID: <correlation_id>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "template_123",
        "name": "Welcome Email",
        "description": "Welcome email for new users",
        "category": "onboarding",
        "status": "published",
        "version": 2,
        "createdBy": "user_456",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "approvedAt": "2024-01-15T10:30:00.000Z",
        "approvedBy": "user_789"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### **2. Get Template**
```http
GET /api/templates/{id}
```

**Purpose**: Retrieve a specific template by ID

**Path Parameters**:
- `id` (string): Template UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "template_123",
    "name": "Welcome Email",
    "description": "Welcome email for new users",
    "content": "<!DOCTYPE html><html>...</html>",
    "variables": [
      {
        "name": "userName",
        "type": "string",
        "required": true,
        "description": "User's first name"
      }
    ],
    "category": "onboarding",
    "tags": ["welcome", "onboarding", "user"],
    "version": 2,
    "status": "published",
    "createdBy": "user_456",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "approvedAt": "2024-01-15T10:30:00.000Z",
    "approvedBy": "user_789",
    "organizationId": "org_123"
  }
}
```

#### **3. Create Template**
```http
POST /api/templates
```

**Purpose**: Create a new email template

**Request Body**:
```json
{
  "name": "New Template",
  "description": "Template description",
  "content": "<!DOCTYPE html><html>...</html>",
  "variables": [
    {
      "name": "variableName",
      "type": "string",
      "required": true,
      "description": "Variable description"
    }
  ],
  "category": "marketing",
  "tags": ["tag1", "tag2"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "template_456",
    "name": "New Template",
    "description": "Template description",
    "content": "<!DOCTYPE html><html>...</html>",
    "variables": [/* variables */],
    "category": "marketing",
    "tags": ["tag1", "tag2"],
    "version": 1,
    "status": "draft",
    "createdBy": "user_456",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "organizationId": "org_123"
  }
}
```

#### **4. Update Template**
```http
PUT /api/templates/{id}
```

**Purpose**: Update an existing template

**Path Parameters**:
- `id` (string): Template UUID

**Request Body**: Same as create template (all fields optional)

**Response**: Updated template object

#### **5. Delete Template**
```http
DELETE /api/templates/{id}
```

**Purpose**: Delete a template (soft delete)

**Path Parameters**:
- `id` (string): Template UUID

**Response**:
```json
{
  "success": true,
  "message": "Template deleted successfully",
  "data": {
    "id": "template_123",
    "deletedAt": "2024-01-15T10:30:00.000Z",
    "deletedBy": "user_456"
  }
}
```

### **User Management Endpoints**

#### **1. User Authentication**
```http
POST /api/auth/login
```

**Purpose**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "editor",
      "organizationId": "org_123"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900,
      "refreshExpiresIn": 604800
    }
  }
}
```

#### **2. Refresh Token**
```http
POST /api/auth/refresh
```

**Purpose**: Refresh expired access token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**: New access token and refresh token

#### **3. User Profile**
```http
GET /api/users/profile
```

**Purpose**: Get current user profile information

**Headers**:
```http
Authorization: Bearer <jwt_token>
```

**Response**: User profile object

### **Approval Workflow Endpoints**

#### **1. Create Approval Request**
```http
POST /api/approvals
```

**Purpose**: Submit template for approval

**Request Body**:
```json
{
  "templateId": "template_123",
  "approvers": ["user_789", "user_101"],
  "priority": "high",
  "notes": "Please review this template for compliance"
}
```

**Response**: Approval workflow object

#### **2. Approve/Reject Template**
```http
PATCH /api/approvals/{id}/approve
```

**Purpose**: Approve or reject a template

**Request Body**:
```json
{
  "action": "approve", // or "reject"
  "comments": "Template looks good, approved",
  "nextApprover": "user_101" // optional
}
```

**Response**: Updated approval workflow

## 📝 **Request/Response Formats**

### **Standard Request Format**

#### **Headers**
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-Request-ID: <correlation_id>
X-API-Version: 1.0.0
User-Agent: CraftifyEmail/1.0.0
```

#### **Request Body Validation**
All request bodies are validated using Zod schemas:

```typescript
// Template creation schema
const templateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  content: z.string().min(1).max(50000),
  variables: z.array(variableSchema).optional(),
  category: z.string().min(1).max(50),
  tags: z.array(z.string().max(30)).max(10)
});
```

### **Standard Response Format**

#### **Success Response**
```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_123456789"
}
```

#### **Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": ["name: Required", "content: Required"],
    "field": "name",
    "value": null,
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "requestId": "req_123456789"
}
```

### **Pagination Format**

```json
{
  "data": [/* items */],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔒 **Security Features**

### **Input Validation & Sanitization**

#### **1. Request Size Limits**
- **Maximum Body Size**: 10MB
- **Maximum URL Length**: 2KB
- **Maximum Query Parameters**: 100

#### **2. Content Type Validation**
```typescript
const allowedContentTypes = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain'
];
```

#### **3. Input Sanitization**
- **HTML Entity Encoding**: Prevents XSS attacks
- **SQL Injection Prevention**: Parameterized queries
- **NoSQL Injection Prevention**: Input sanitization
- **HTTP Parameter Pollution**: HPP protection

### **Rate Limiting Configuration**

#### **Global Rate Limiting**
```typescript
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // 100 requests per IP
  message: 'Rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false
}
```

#### **Authentication Rate Limiting**
```typescript
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                     // 5 attempts per IP
  message: 'Too many authentication attempts'
}
```

#### **Progressive Response Delays**
```typescript
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50,             // Start delay after 50 requests
  delayMs: 500,               // 500ms delay per request
  maxDelayMs: 20000           // Maximum 20 second delay
}
```

### **IP Address Filtering**

#### **Configuration**
```typescript
ipFiltering: {
  whitelist: process.env.IP_WHITELIST?.split(','),
  blacklist: process.env.IP_BLACKLIST?.split(','),
  enableGeoBlocking: process.env.ENABLE_GEO_BLOCKING === 'true',
  allowedCountries: process.env.ALLOWED_COUNTRIES?.split(',')
}
```

#### **Filtering Logic**
1. Check blacklist first (immediate block)
2. Check whitelist if configured (allow only listed IPs)
3. Allow all IPs if no whitelist configured

### **Security Event Logging**

#### **Event Types**
- **Rate Limit Exceeded**: Too many requests
- **IP Address Blocked**: Blacklisted IP access
- **Authentication Failure**: Failed login attempts
- **Suspicious Pattern**: Potential attack patterns
- **Input Validation Error**: Malicious input detected

#### **Logging Format**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "warn",
  "message": "Security Event: IP address blocked",
  "metadata": {
    "eventType": "security",
    "severity": "high",
    "ipAddress": "192.168.1.100",
    "reason": "blacklisted",
    "endpoint": "/api/templates",
    "userAgent": "Mozilla/5.0...",
    "requestId": "req_123456789"
  }
}
```

## 📊 **Logging & Monitoring**

### **Request/Response Logging**

#### **Request Logging**
```typescript
logger.logRequest(req, {
  security: {
    ipAddress: getClientIP(req),
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    origin: req.get('Origin')
  }
});
```

#### **Response Logging**
```typescript
logger.logResponse(req, res, responseTime, {
  performance: {
    responseSize: res.get('Content-Length'),
    compression: res.get('Content-Encoding')
  }
});
```

### **Performance Monitoring**

#### **Response Time Tracking**
```typescript
// Log slow requests
if (responseTime > 1000) { // 1 second threshold
  logger.warn('Slow request detected', {
    requestId: req.requestId,
    method: req.method,
    endpoint: req.path,
    responseTime,
    threshold: 1000
  });
}
```

#### **Performance Metrics**
- **Response Time**: API endpoint response times
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Resource Usage**: Memory and CPU utilization

### **Health Monitoring**

#### **Health Check Endpoints**
- **`/health`**: Basic system health
- **`/health/detailed`**: Detailed system metrics
- **`/health/ready`**: Readiness probe for Kubernetes
- **`/health/live`**: Liveness probe for Kubernetes

#### **Monitoring Integration**
- **AWS CloudWatch**: Metrics and log aggregation
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Dashboard and visualization
- **PagerDuty**: Incident alerting and escalation

## 🧪 **Testing & Examples**

### **cURL Examples**

#### **1. Health Check**
```bash
curl -X GET "http://localhost:3001/health" \
  -H "Accept: application/json"
```

#### **2. API Information**
```bash
curl -X GET "http://localhost:3001/api" \
  -H "Accept: application/json"
```

#### **3. Create Template (with authentication)**
```bash
curl -X POST "http://localhost:3001/api/templates" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Request-ID: test_123" \
  -d '{
    "name": "Test Template",
    "description": "Test template for API testing",
    "content": "<h1>Hello World</h1>",
    "category": "test",
    "tags": ["test", "api"]
  }'
```

#### **4. List Templates with Pagination**
```bash
curl -X GET "http://localhost:3001/api/templates?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

### **JavaScript/Node.js Examples**

#### **1. API Client Setup**
```javascript
class CraftifyAPI {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-Request-ID': this.generateRequestId(),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Template methods
  async getTemplates(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/templates?${queryString}`);
  }

  async createTemplate(templateData) {
    return this.request('/api/templates', {
      method: 'POST',
      body: JSON.stringify(templateData)
    });
  }
}
```

#### **2. Usage Example**
```javascript
const api = new CraftifyAPI('http://localhost:3001', 'your_api_key');

// Get templates
try {
  const templates = await api.getTemplates({ page: 1, limit: 10 });
  console.log('Templates:', templates.data.templates);
} catch (error) {
  console.error('Error fetching templates:', error.message);
}

// Create template
try {
  const newTemplate = await api.createTemplate({
    name: 'Welcome Email',
    description: 'Welcome email for new users',
    content: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
    category: 'onboarding',
    tags: ['welcome', 'onboarding']
  });
  console.log('Template created:', newTemplate.data);
} catch (error) {
  console.error('Error creating template:', error.message);
}
```

### **Python Examples**

#### **1. Python API Client**
```python
import requests
import uuid
from typing import Dict, Any, Optional

class CraftifyAPI:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'X-API-Key': api_key
        })

    def _generate_request_id(self) -> str:
        return f"req_{int(time.time())}_{uuid.uuid4().hex[:9]}"

    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        headers = kwargs.pop('headers', {})
        headers['X-Request-ID'] = self._generate_request_id()
        
        response = self.session.request(method, url, headers=headers, **kwargs)
        response.raise_for_status()
        return response.json()

    def get_templates(self, page: int = 1, limit: int = 20, **params) -> Dict[str, Any]:
        params.update({'page': page, 'limit': limit})
        return self._make_request('GET', '/api/templates', params=params)

    def create_template(self, template_data: Dict[str, Any]) -> Dict[str, Any]:
        return self._make_request('POST', '/api/templates', json=template_data)

    def get_template(self, template_id: str) -> Dict[str, Any]:
        return self._make_request('GET', f'/api/templates/{template_id}')

    def update_template(self, template_id: str, template_data: Dict[str, Any]) -> Dict[str, Any]:
        return self._make_request('PUT', f'/api/templates/{template_id}', json=template_data)

    def delete_template(self, template_id: str) -> Dict[str, Any]:
        return self._make_request('DELETE', f'/api/templates/{template_id}')
```

#### **2. Usage Example**
```python
# Initialize API client
api = CraftifyAPI('http://localhost:3001', 'your_api_key')

# Get templates
try:
    templates = api.get_templates(page=1, limit=10)
    print(f"Found {len(templates['data']['templates'])} templates")
except requests.exceptions.RequestException as e:
    print(f"Error fetching templates: {e}")

# Create template
try:
    new_template = api.create_template({
        'name': 'Welcome Email',
        'description': 'Welcome email for new users',
        'content': '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
        'category': 'onboarding',
        'tags': ['welcome', 'onboarding']
    })
    print(f"Template created with ID: {new_template['data']['id']}")
except requests.exceptions.RequestException as e:
    print(f"Error creating template: {e}")
```

## 📈 **Rate Limiting**

### **Rate Limit Headers**

The API includes rate limit information in response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642233600
X-RateLimit-Reset-Time: 2024-01-15T12:00:00.000Z
```

### **Rate Limit Response**

When rate limits are exceeded:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests from this IP, please try again later.",
    "retryAfter": "15 minutes",
    "requestId": "req_123456789",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### **Rate Limit Strategies**

#### **1. Exponential Backoff**
```javascript
const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
await new Promise(resolve => setTimeout(resolve, delay));
```

#### **2. Retry with Jitter**
```javascript
const jitter = Math.random() * 1000;
const delay = baseDelay + jitter;
```

## 🚨 **Error Handling**

### **Error Response Format**

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": ["Additional error details"],
    "field": "Field name if applicable",
    "value": "Value that caused error",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "requestId": "req_123456789"
}
```

### **Common Error Codes**

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### **Error Handling Best Practices**

#### **1. Client-Side Error Handling**
```javascript
try {
  const response = await api.createTemplate(templateData);
  // Handle success
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    // Handle validation errors
    console.error('Validation errors:', error.details);
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limiting
    const retryAfter = error.retryAfter;
    console.log(`Retry after: ${retryAfter}`);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error.message);
  }
}
```

#### **2. Retry Logic**
```javascript
async function retryRequest(requestFn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED' && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

## 📚 **Swagger Documentation**

### **Interactive API Documentation**

The API provides comprehensive interactive documentation through Swagger UI:

- **URL**: `/api-docs`
- **OpenAPI Spec**: `/api-docs/swagger.json`
- **Features**: Interactive testing, request/response examples, authentication

### **Swagger Configuration**

```typescript
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Craftify Email API',
      version: '1.0.0',
      description: 'Enterprise Email Template Management System API'
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development' },
      { url: 'https://api.craftify-email.com', description: 'Production' }
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
    }
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
};
```

### **API Documentation Features**

- **Interactive Testing**: Test endpoints directly from documentation
- **Authentication**: JWT and API key authentication support
- **Request/Response Examples**: Complete examples for all endpoints
- **Schema Validation**: Request/response schema documentation
- **Error Codes**: Comprehensive error code documentation
- **Rate Limiting**: Rate limit information and examples

---

**API Status**: 🟢 **Production Ready** - Security and logging complete, core endpoints implemented  
**Last Updated**: January 15, 2024  
**Next Review**: January 22, 2024 