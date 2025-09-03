# System Architecture

## Overview

Craftify Email is built as a modern, scalable email template management system using a microservices-inspired architecture within a monorepo structure. The system is designed to handle enterprise-scale email template operations with real-time collaboration, approval workflows, and comprehensive audit logging.

## 🏗️ **High-Level Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   API (Node.js) │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • Template      │    │ • REST API      │    │ • Okta Auth     │
│   Editor        │    │ • WebSocket     │    │ • DynamoDB      │
│ • Management    │    │ • Validation    │    │ • Email Service │
│ • Dashboard     │    │ • Business      │    │ • CDN           │
└─────────────────┘    │   Logic         │    └─────────────────┘
                       └─────────────────┘
```

## 📱 **Frontend Architecture**

### **Technology Stack**
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: Zustand for global state
- **Routing**: React Router v6 for navigation
- **Real-time**: WebSocket client for live updates

### **Component Architecture**
```
src/
├── components/
│   ├── layout/           # Application layout components
│   │   ├── AppLayout.tsx # Main layout wrapper
│   │   ├── AppSidebar.tsx# Navigation sidebar
│   │   └── TopBar.tsx    # Top navigation bar
│   ├── editor/           # Email editor components
│   │   └── TemplateEditor.tsx # WYSIWYG email editor
│   ├── templates/        # Template management
│   │   └── TemplateList.tsx  # Template listing and CRUD
│   └── ui/              # Reusable UI components
│       ├── button.tsx   # Button components
│       ├── dialog.tsx   # Modal dialogs
│       ├── form.tsx     # Form components
│       └── ...          # Other UI components
├── pages/               # Page-level components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Templates.tsx    # Template management
│   ├── Approvals.tsx    # Approval workflow
│   └── Index.tsx        # Landing page
├── hooks/               # Custom React hooks
│   ├── use-mobile.tsx   # Mobile detection
│   └── use-toast.ts     # Toast notifications
├── store/               # State management
│   └── useTemplateStore.ts # Template state store
└── lib/                 # Utility functions
    ├── utils.ts         # Common utilities
    └── mockData.ts      # Mock data for development
```

### **State Management Strategy**
- **Local State**: React useState for component-specific state
- **Global State**: Zustand stores for shared application state
- **Server State**: React Query for API data management (planned)
- **Form State**: React Hook Form for complex form handling (planned)

## 🔧 **Backend Architecture**

### **Technology Stack**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server
- **WebSocket**: ws library for real-time communication
- **Validation**: Zod for request/response validation
- **Documentation**: Swagger/OpenAPI for API documentation
- **Security**: Helmet.js for security headers

### **API Architecture**
```
apps/api/src/
├── index.ts              # Main server entry point
├── config/               # Configuration files
│   ├── index.ts         # Main configuration
│   └── swagger.ts       # Swagger/OpenAPI configuration
├── middleware/           # Express middleware
│   ├── errorHandler.ts  # Error handling middleware
│   └── notFoundHandler.ts # 404 handler
├── routes/               # API route definitions
│   └── index.ts         # Main route definitions
├── services/             # Business logic services (planned)
├── controllers/          # Request handlers (planned)
├── models/               # Data models (planned)
├── utils/                # Utility functions
│   ├── logger.ts        # Logging utilities
│   └── websocket.ts     # WebSocket management
└── types/                # TypeScript type definitions
```

### **Current API Endpoints**

#### **Implemented Endpoints**
- **`GET /health`** - Health check and system status
- **`GET /api`** - API information and available endpoints
- **`GET /api-docs`** - Swagger UI documentation

#### **Planned Endpoints**
- **`/api/templates`** - Template CRUD operations
- **`/api/folders`** - Folder management
- **`/api/approvals`** - Approval workflow
- **`/api/users`** - User management
- **`/api/components`** - Reusable components
- **`/api/audit-logs`** - Audit logging

### **Middleware Stack**
```
Request Flow:
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Helmet    │ │ Compression │ │    CORS     │ │   Morgan    │
│ (Security)  │ │ (Gzip)      │ │(Cross-Origin│ │ (Logging)   │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
       │               │               │               │
       └───────────────┼───────────────┼───────────────┘
                       │               │
              ┌─────────┴───────────────┴─────────┐
              │        Body Parsing               │
              │     (JSON, URL-encoded)          │
              └───────────────────────────────────┘
                       │
              ┌─────────┴─────────┐
              │   Route Handler   │
              └───────────────────┘
                       │
              ┌─────────┴─────────┐
              │   Error Handler   │
              └───────────────────┘
```

## 🔐 **Security Architecture**

### **Authentication & Authorization**
- **Identity Provider**: Okta for user management and SSO
- **Token Type**: JWT (JSON Web Tokens)
- **Token Validation**: Server-side JWT validation
- **Session Management**: Stateless JWT-based sessions

### **Security Measures**
- **HTTP Security Headers**: Helmet.js for security headers
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Zod schemas for request validation
- **Rate Limiting**: API rate limiting (planned)
- **Audit Logging**: Comprehensive action logging

### **Data Protection**
- **Encryption**: Data encryption at rest and in transit
- **Access Control**: Role-based access control (RBAC)
- **Data Isolation**: Multi-tenant data separation
- **Compliance**: GDPR and SOC 2 compliance ready

## 🗄️ **Data Architecture**

### **Database Design**
- **Primary Database**: AWS DynamoDB (NoSQL)
- **Caching Layer**: Redis for session and data caching
- **File Storage**: AWS S3 for template assets
- **Search**: Elasticsearch for template search (planned)

### **Data Models**

#### **User Model**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  domain: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: Date;
  lastLoginAt: Date;
}
```

#### **Template Model**
```typescript
interface EmailTemplate {
  id: string;
  domain: string;
  folderId: string;
  name: string;
  subject: string;
  htmlContent: string;
  plainTextContent: string;
  variables: string[];
  status: TemplateStatus;
  version: number;
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  tags: string[];
}
```

#### **Folder Model**
```typescript
interface Folder {
  id: string;
  domain: string;
  name: string;
  parentId?: string;
  color: string;
  createdBy: string;
  createdAt: Date;
  templateCount: number;
}
```

## 🔄 **Real-time Architecture**

### **WebSocket Implementation**
- **Server**: ws library for WebSocket server
- **Client**: Native WebSocket API in React
- **Events**: Template locks, updates, user presence
- **Scaling**: WebSocket clustering (planned)

### **Real-time Features**
- **Live Collaboration**: Multiple users editing templates
- **Template Locking**: Prevent concurrent edits
- **User Presence**: Show who's currently viewing/editing
- **Live Updates**: Real-time template changes
- **Notifications**: Instant approval and status updates

## 📊 **Performance Architecture**

### **Frontend Performance**
- **Code Splitting**: Dynamic imports for route-based splitting
- **Lazy Loading**: Component lazy loading
- **Bundle Optimization**: Vite for fast builds and HMR
- **Image Optimization**: WebP format and lazy loading

### **Backend Performance**
- **Caching**: Redis for API response caching
- **Compression**: Gzip compression for responses
- **Connection Pooling**: Database connection optimization
- **Async Processing**: Non-blocking I/O operations

### **Scalability Considerations**
- **Horizontal Scaling**: Stateless API design
- **Load Balancing**: Multiple API instances
- **CDN**: Static asset delivery
- **Database Sharding**: Multi-region deployment

## 🚀 **Deployment Architecture**

### **Environment Strategy**
```
Development → Staging → Production
     │           │          │
     │           │          └── High availability
     │           └── Production-like testing
     └── Local development
```

### **Infrastructure Components**
- **Containerization**: Docker containers
- **Orchestration**: Kubernetes for scaling
- **CI/CD**: Automated deployment pipeline
- **Monitoring**: Application performance monitoring
- **Logging**: Centralized log aggregation

### **Deployment Targets**
- **Frontend**: CDN + S3 for static assets
- **Backend**: ECS/Fargate or EC2 instances
- **Database**: DynamoDB with global tables
- **Cache**: ElastiCache Redis clusters

## 🔍 **Monitoring & Observability**

### **Application Monitoring**
- **Health Checks**: `/health` endpoint for system status
- **Metrics**: Performance and business metrics
- **Tracing**: Distributed request tracing
- **Alerting**: Automated alerting for issues

### **Logging Strategy**
- **Structured Logging**: JSON format for easy parsing
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Log Aggregation**: Centralized log collection
- **Audit Logging**: User action tracking

## 🧪 **Testing Architecture**

### **Testing Strategy**
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Load and stress testing

### **Testing Tools**
- **Frontend**: Jest + React Testing Library
- **Backend**: Jest + Supertest
- **E2E**: Playwright or Cypress
- **API Testing**: Postman collections

## 🔄 **API Documentation Architecture**

### **Swagger/OpenAPI Integration**
- **Specification**: OpenAPI 3.0 compliant
- **Interactive UI**: Swagger UI for endpoint exploration
- **Code Generation**: Client SDK generation capability
- **Schema Validation**: Request/response validation

### **Documentation Features**
- **Endpoint Documentation**: Complete API reference
- **Request/Response Examples**: Real-world usage examples
- **Authentication**: JWT token documentation
- **Error Codes**: Comprehensive error documentation
- **Interactive Testing**: Try endpoints directly from docs

## 📈 **Future Architecture Considerations**

### **Microservices Evolution**
- **Service Decomposition**: Break into smaller services
- **API Gateway**: Centralized routing and authentication
- **Service Mesh**: Inter-service communication
- **Event Sourcing**: Event-driven architecture

### **Advanced Features**
- **Machine Learning**: Template optimization suggestions
- **A/B Testing**: Template performance testing
- **Analytics**: Advanced email analytics
- **Integrations**: Third-party service integrations

## 🎯 **Architecture Principles**

### **Design Principles**
1. **Separation of Concerns**: Clear boundaries between layers
2. **Single Responsibility**: Each component has one purpose
3. **Open/Closed**: Open for extension, closed for modification
4. **Dependency Inversion**: Depend on abstractions, not concretions
5. **Interface Segregation**: Small, focused interfaces

### **Quality Attributes**
- **Scalability**: Handle growth in users and data
- **Reliability**: High availability and fault tolerance
- **Security**: Protect data and user privacy
- **Performance**: Fast response times and throughput
- **Maintainability**: Easy to modify and extend
- **Testability**: Comprehensive testing coverage

## 📊 **Current Architecture Status**

### **✅ Implemented**
- Monorepo structure with NPM workspaces
- React frontend with TypeScript and Vite
- Express.js backend with TypeScript
- WebSocket server for real-time features
- Swagger/OpenAPI documentation
- Basic middleware stack and error handling
- Development environment and build system

### **🚧 In Progress**
- Template CRUD operations
- Authentication system
- Request/response validation
- Database integration

### **📋 Planned**
- Advanced real-time features
- Performance optimization
- Advanced security features
- Monitoring and observability
- Production deployment pipeline

The architecture provides a solid foundation for building a scalable, maintainable email template management system with clear separation of concerns and modern development practices. 