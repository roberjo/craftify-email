# API Documentation

## Overview

The Craftify Email API provides a comprehensive set of endpoints for managing email templates, folders, approvals, and system administration. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

```
Development: http://localhost:3001
Production: https://api.craftify-email.com
```

## API Documentation

### Swagger UI
The API includes interactive documentation via Swagger UI:

- **Development**: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
- **Production**: [https://api.craftify-email.com/api-docs](https://api.craftify-email.com/api-docs)

### OpenAPI Specification
The API follows OpenAPI 3.0 specification and can be accessed at:
- **JSON Format**: [http://localhost:3001/api-docs/swagger.json](http://localhost:3001/api-docs/swagger.json)

## Authentication

All API requests require authentication via JWT tokens obtained through Okta integration.

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Error Responses

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": "Token has expired"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Common Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ /* items */ ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Current Endpoints

### Health Check

#### Get Health Status
```http
GET /health
```

**Description**: Returns the current health status of the API

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 146.259604245,
  "environment": "development",
  "version": "1.0.0"
}
```

**Swagger Documentation**: Available in Swagger UI under "Health" tag

### API Information

#### Get API Info
```http
GET /api
```

**Description**: Returns basic information about the API

**Response**:
```json
{
  "success": true,
  "data": {
    "name": "Craftify Email API",
    "version": "1.0.0",
    "description": "Email Template Management System API",
    "endpoints": {
      "health": "/health",
      "api": "/api",
      "swagger": "/api-docs"
    }
  }
}
```

**Swagger Documentation**: Available in Swagger UI under "API Info" tag

## Planned Endpoints

### Templates

#### Get Templates
```http
GET /api/templates
```

**Query Parameters:**
- `domain` (required): Domain identifier
- `folderId` (optional): Filter by folder
- `status` (optional): Filter by status (draft, pending_approval, approved, archived)
- `enabled` (optional): Filter by enabled status (true/false)
- `search` (optional): Search in name and subject
- `tags` (optional): Comma-separated tag list
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `sortBy` (optional): Sort field (name, createdAt, lastModifiedAt)
- `sortOrder` (optional): Sort direction (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "template_123",
      "domain": "marketing",
      "folderId": "folder_456",
      "name": "Welcome Email",
      "subject": "Welcome to our platform!",
      "htmlContent": "<html>...</html>",
      "plainTextContent": "Welcome to our platform!",
      "variables": ["firstName", "companyName"],
      "status": "approved",
      "enabled": true,
      "version": 2,
      "createdBy": "user_789",
      "createdAt": "2024-01-15T10:30:00Z",
      "lastModifiedBy": "user_789",
      "lastModifiedAt": "2024-01-15T10:30:00Z",
      "approvedBy": "approver_123",
      "approvedAt": "2024-01-15T10:30:00Z",
      "tags": ["welcome", "onboarding"]
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Get Template by ID
```http
GET /api/templates/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_123",
    "domain": "marketing",
    "folderId": "folder_456",
    "name": "Welcome Email",
    "subject": "Welcome to our platform!",
    "htmlContent": "<html>...</html>",
    "plainTextContent": "Welcome to our platform!",
    "variables": ["firstName", "companyName"],
    "status": "approved",
    "enabled": true,
    "version": 2,
    "createdBy": "user_789",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastModifiedBy": "user_789",
    "lastModifiedAt": "2024-01-15T10:30:00Z",
    "approvedBy": "approver_123",
    "approvedAt": "2024-01-15T10:30:00Z",
    "tags": ["welcome", "onboarding"]
  }
}
```

#### Create Template
```http
POST /api/templates
```

**Request Body:**
```json
{
  "domain": "marketing",
  "folderId": "folder_456",
  "name": "New Welcome Email",
  "subject": "Welcome aboard!",
  "htmlContent": "<html><body><h1>Welcome {{firstName}}!</h1></body></html>",
  "plainTextContent": "Welcome {{firstName}}!",
  "variables": ["firstName"],
  "tags": ["welcome", "onboarding"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_124",
    "domain": "marketing",
    "folderId": "folder_456",
    "name": "New Welcome Email",
    "subject": "Welcome aboard!",
    "htmlContent": "<html><body><h1>Welcome {{firstName}}!</h1></body></html>",
    "plainTextContent": "Welcome {{firstName}}!",
    "variables": ["firstName"],
    "status": "draft",
    "enabled": false,
    "version": 1,
    "createdBy": "user_789",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastModifiedBy": "user_789",
    "lastModifiedAt": "2024-01-15T10:30:00Z",
    "tags": ["welcome", "onboarding"]
  }
}
```

#### Update Template
```http
PUT /api/templates/{id}
```

**Request Body:**
```json
{
  "name": "Updated Welcome Email",
  "subject": "Welcome to our amazing platform!",
  "htmlContent": "<html><body><h1>Welcome {{firstName}}!</h1><p>We're excited to have you!</p></body></html>",
  "plainTextContent": "Welcome {{firstName}}! We're excited to have you!",
  "variables": ["firstName", "companyName"],
  "tags": ["welcome", "onboarding", "excited"]
}
```

#### Delete Template
```http
DELETE /api/templates/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Template deleted successfully",
    "templateId": "template_123"
  }
}
```

#### Duplicate Template
```http
POST /api/templates/{id}/duplicate
```

**Request Body:**
```json
{
  "name": "Welcome Email (Copy)",
  "folderId": "folder_789"
}
```

### Template Versions

#### Get Template Versions
```http
GET /api/templates/{id}/versions
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "templateId": "template_123",
      "version": 2,
      "changes": [
        {
          "field": "subject",
          "oldValue": "Welcome to our platform!",
          "newValue": "Welcome to our amazing platform!"
        }
      ],
      "changedBy": "user_789",
      "changedAt": "2024-01-15T10:30:00Z",
      "changeReason": "Updated subject line for better engagement"
    }
  ]
}
```

#### Get Specific Version
```http
GET /api/templates/{id}/versions/{version}
```

#### Restore Version
```http
POST /api/templates/{id}/restore/{version}
```

**Request Body:**
```json
{
  "reason": "Reverting to previous working version"
}
```

### Folders

#### Get Folders
```http
GET /api/folders?domain={domain}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "folder_456",
      "domain": "marketing",
      "name": "Welcome Emails",
      "parentId": null,
      "createdBy": "user_789",
      "createdAt": "2024-01-15T10:30:00Z",
      "templateCount": 5,
      "color": "#3B82F6"
    }
  ]
}
```

#### Create Folder
```http
POST /api/folders
```

**Request Body:**
```json
{
  "domain": "marketing",
  "name": "New Campaign",
  "parentId": "folder_456",
  "color": "#10B981"
}
```

#### Update Folder
```http
PUT /api/folders/{id}
```

#### Delete Folder
```http
DELETE /api/folders/{id}
```

### Approval Workflow

#### Request Approval
```http
POST /api/templates/{id}/request-approval
```

**Request Body:**
```json
{
  "approvers": ["approver_123", "approver_456"],
  "changeReason": "Updated email content and added new variables"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "approval_789",
    "templateId": "template_123",
    "templateVersion": 3,
    "requestedBy": "user_789",
    "requestedAt": "2024-01-15T10:30:00Z",
    "approvers": ["approver_123", "approver_456"],
    "status": "pending",
    "changes": "Updated email content and added new variables"
  }
}
```

#### Approve Template
```http
POST /api/templates/{id}/approve
```

**Request Body:**
```json
{
  "comments": "Looks great! Approved for production use."
}
```

#### Reject Template
```http
POST /api/templates/{id}/reject
```

**Request Body:**
```json
{
  "comments": "Please update the subject line to be more engaging"
}
```

#### Get Approval Requests
```http
GET /api/approvals?status=pending&domain={domain}
```

### Bulk Operations

#### Bulk Action
```http
POST /api/templates/bulk
```

**Request Body:**
```json
{
  "action": "archive",
  "templateIds": ["template_123", "template_124", "template_125"],
  "options": {
    "reason": "End of campaign season"
  }
}
```

**Supported Actions:**
- `archive` - Archive templates
- `delete` - Delete templates
- `move` - Move to folder
- `export` - Export templates
- `enable` - Enable templates
- `disable` - Disable templates

**Response:**
```json
{
  "success": true,
  "data": {
    "action": "archive",
    "status": "completed",
    "results": {
      "succeeded": ["template_123", "template_124"],
      "failed": [
        {
          "id": "template_125",
          "reason": "Template is currently being edited"
        }
      ]
    },
    "performedBy": "user_789",
    "performedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Components

#### Get Components
```http
GET /api/components?domain={domain}&type={type}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "component_123",
      "domain": "marketing",
      "name": "Standard Header",
      "type": "header",
      "htmlContent": "<header>...</header>",
      "cssStyles": "header { background: #f3f4f6; }",
      "variables": ["companyName", "logoUrl"],
      "isGlobal": true
    }
  ]
}
```

#### Create Component
```http
POST /api/components
```

#### Update Component
```http
PUT /api/components/{id}
```

#### Delete Component
```http
DELETE /api/components/{id}
```

### Testing & Preview

#### Send Test Email
```http
POST /api/templates/{id}/send-test
```

**Request Body:**
```json
{
  "recipientEmail": "test@example.com",
  "variables": {
    "firstName": "John",
    "companyName": "Acme Corp"
  }
}
```

#### Preview Template
```http
POST /api/templates/{id}/preview
```

**Request Body:**
```json
{
  "variables": {
    "firstName": "John",
    "companyName": "Acme Corp"
  },
  "device": "desktop"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "html": "<html>...</html>",
    "plainText": "Welcome John!",
    "variables": {
      "firstName": "John",
      "companyName": "Acme Corp"
    }
  }
}
```

### Audit & Analytics

#### Get Audit Logs
```http
GET /api/audit-logs?entityId={id}&userId={userId}&action={action}&startDate={date}&endDate={date}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "audit_123",
      "entityType": "template",
      "entityId": "template_123",
      "action": "update",
      "userId": "user_789",
      "userName": "John Doe",
      "timestamp": "2024-01-15T10:30:00Z",
      "details": {
        "previousVersion": 1,
        "newVersion": 2,
        "changes": "Updated subject line",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0..."
      }
    }
  ]
}
```

#### Get Analytics
```http
GET /api/analytics/template-usage?domain={domain}&startDate={date}&endDate={date}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTemplates": 150,
    "activeTemplates": 120,
    "templatesByStatus": {
      "draft": 20,
      "pending_approval": 10,
      "approved": 100,
      "archived": 20
    },
    "templatesByFolder": {
      "folder_123": 25,
      "folder_456": 30,
      "unassigned": 45
    },
    "recentActivity": [
      {
        "date": "2024-01-15",
        "created": 5,
        "updated": 12,
        "approved": 8
      }
    ]
  }
}
```

## WebSocket Events

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  // Authenticate with JWT token
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'jwt_token_here'
  }));
};
```

### Event Types

#### Template Lock
```json
{
  "type": "template_lock",
  "data": {
    "templateId": "template_123",
    "userId": "user_789",
    "userName": "John Doe",
    "action": "lock"
  }
}
```

#### Template Update
```json
{
  "type": "template_update",
  "data": {
    "templateId": "template_123",
    "userId": "user_789",
    "changes": ["subject", "htmlContent"],
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### User Presence
```json
{
  "type": "user_presence",
  "data": {
    "userId": "user_789",
    "userName": "John Doe",
    "status": "online",
    "currentTemplate": "template_123"
  }
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Template operations**: 100 requests per minute
- **Bulk operations**: 10 requests per minute
- **WebSocket connections**: 10 connections per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642233600
```

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid or expired authentication token |
| `FORBIDDEN` | Insufficient permissions for the requested action |
| `NOT_FOUND` | Requested resource not found |
| `VALIDATION_ERROR` | Request data validation failed |
| `CONFLICT` | Resource conflict (e.g., template being edited) |
| `RATE_LIMITED` | Rate limit exceeded |
| `INTERNAL_ERROR` | Server internal error |

## SDK Examples

### JavaScript/TypeScript

```typescript
import { CraftifyEmailAPI } from '@craftify/email-sdk';

const api = new CraftifyEmailAPI({
  baseUrl: 'https://api.craftify-email.com',
  token: 'your_jwt_token'
});

// Get templates
const templates = await api.templates.list({
  domain: 'marketing',
  status: 'approved'
});

// Create template
const newTemplate = await api.templates.create({
  domain: 'marketing',
  name: 'Welcome Email',
  subject: 'Welcome!',
  htmlContent: '<html>...</html>'
});
```

### cURL Examples

```bash
# Get templates
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://api.craftify-email.com/api/templates?domain=marketing"

# Create template
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"domain":"marketing","name":"Test","subject":"Test"}' \
     "https://api.craftify-email.com/api/templates"
```

## Development and Testing

### Local Development
```bash
# Start the API server
cd apps/api
npm run dev

# The API will be available at:
# - API: http://localhost:3001
# - Health: http://localhost:3001/health
# - Swagger UI: http://localhost:3001/api-docs
```

### Testing Endpoints
```bash
# Health check
curl http://localhost:3001/health

# API info
curl http://localhost:3001/api

# Swagger documentation
open http://localhost:3001/api-docs
```

## Current Implementation Status

### ✅ **Implemented**
- **Health Check Endpoint**: `/health` - Returns system status
- **API Info Endpoint**: `/api` - Returns API information
- **Swagger Documentation**: `/api-docs` - Interactive API documentation
- **WebSocket Server**: Basic WebSocket support for real-time features
- **Error Handling**: Basic error handling middleware
- **Logging**: Request logging with Morgan
- **CORS**: Cross-origin resource sharing configuration
- **Security**: Helmet.js security headers

### 🚧 **In Progress**
- **Template Management**: CRUD operations for email templates
- **Authentication**: JWT-based authentication system
- **Validation**: Request/response validation with Zod

### 📋 **Planned**
- **Folder Management**: Template organization system
- **Approval Workflow**: Multi-stage approval process
- **Bulk Operations**: Mass template management
- **Component System**: Reusable template components
- **Testing Infrastructure**: Unit and integration tests
- **Database Integration**: DynamoDB connection
- **Real-time Features**: Advanced WebSocket functionality

## Next Steps

1. **Complete Template CRUD**: Implement all template management endpoints
2. **Add Authentication**: Implement JWT-based authentication
3. **Database Integration**: Connect to DynamoDB
4. **Testing**: Add comprehensive test coverage
5. **Documentation**: Complete OpenAPI specification
6. **Deployment**: Set up production deployment pipeline

The API is now running locally with basic endpoints and comprehensive Swagger documentation. You can explore the interactive API documentation at [http://localhost:3001/api-docs](http://localhost:3001/api-docs) to see all available endpoints and test them directly from the browser. 