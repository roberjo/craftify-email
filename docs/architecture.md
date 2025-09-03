# Architecture Guide

## System Overview

Craftify Email is designed as a modern, scalable email template management system with a clear separation of concerns and enterprise-grade architecture patterns.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React SPA)   │◄──►│   (BFF API)     │◄──►│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   State         │    │   Database      │    │   Okta          │
│   Management    │    │   (DynamoDB)    │    │   Auth          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App
├── AppLayout
│   ├── TopBar
│   ├── AppSidebar
│   └── MainContent
├── Routes
│   ├── Dashboard
│   ├── Templates
│   ├── Approvals
│   └── NotFound
└── Global Providers
    ├── QueryClient
    ├── Toast
    └── Tooltip
```

### State Management Strategy

The application uses a hybrid state management approach:

1. **Zustand Stores** - Global application state
   - `useTemplateStore` - Template and folder management
   - `useAuthStore` - Authentication and user state (planned)
   - `useApprovalStore` - Approval workflow state (planned)

2. **React Query** - Server state and caching
   - API data fetching and synchronization
   - Optimistic updates
   - Background refetching

3. **Local State** - Component-specific state
   - Form inputs
   - UI interactions
   - Temporary data

### Data Flow

```
User Action → Component → Store Action → State Update → UI Re-render
     ↓
API Call → React Query → Cache Update → Store Sync
```

## Backend Architecture (Planned)

### BFF Pattern

The Backend for Frontend (BFF) pattern provides:

- **API Aggregation** - Combine multiple services into single endpoints
- **Frontend Optimization** - Tailor responses for specific UI needs
- **Security Layer** - Centralized authentication and authorization
- **Rate Limiting** - Protect against abuse and ensure fair usage

### Service Layer

```
API Routes
├── Authentication
│   ├── /auth/login
│   ├── /auth/logout
│   └── /auth/refresh
├── Templates
│   ├── /templates
│   ├── /templates/:id
│   └── /templates/:id/versions
├── Folders
│   ├── /folders
│   └── /folders/:id
├── Approvals
│   ├── /approvals
│   └── /approvals/:id
└── Audit
    └── /audit-logs
```

### Database Design

#### DynamoDB Schema

**Primary Table: EmailTemplates**
```
PK: DOMAIN#{domainName}
SK: TEMPLATE#{templateId}
GSI1PK: FOLDER#{folderId}
GSI1SK: CREATED#{timestamp}
```

**Secondary Table: AuditLogs**
```
PK: AUDIT#{yearMonth}
SK: TIMESTAMP#{timestamp}#{uuid}
```

**Secondary Table: Users**
```
PK: DOMAIN#{domainName}
SK: USER#{userId}
GSI1PK: GROUP#{groupName}
GSI1SK: USER#{userId}
```

## Security Architecture

### Authentication Flow

1. **Okta Integration**
   - PKCE OAuth 2.0 flow
   - JWT token validation
   - Automatic token refresh

2. **Session Management**
   - HttpOnly cookies for token storage
   - Secure session timeout
   - CSRF protection

3. **Authorization**
   - Role-based access control (RBAC)
   - Domain isolation
   - Permission-based feature access

### Data Protection

- **Input Validation** - Zod schema validation
- **XSS Prevention** - Content sanitization
- **SQL Injection** - Parameterized queries
- **Rate Limiting** - API abuse prevention

## Real-time Collaboration

### WebSocket Architecture

```
Client ←→ WebSocket Server ←→ Redis Pub/Sub ←→ Other Clients
```

### Collaboration Features

1. **Presence Management**
   - User online status
   - Active editor indicators
   - Real-time user activity

2. **Document Locking**
   - Exclusive edit mode
   - Conflict prevention
   - Graceful lock handling

3. **Change Broadcasting**
   - Live updates
   - Conflict resolution
   - Version synchronization

## Performance Considerations

### Frontend Optimization

- **Code Splitting** - Route-based lazy loading
- **Bundle Optimization** - Tree shaking and minification
- **Image Optimization** - WebP format and lazy loading
- **Caching Strategy** - Service worker and HTTP caching

### Backend Optimization

- **Database Indexing** - Strategic GSI design
- **Query Optimization** - Efficient DynamoDB patterns
- **Caching Layer** - Redis for frequently accessed data
- **CDN Integration** - Static asset distribution

### Monitoring & Observability

- **Application Metrics** - Response times, error rates
- **User Experience** - Core Web Vitals
- **Business Metrics** - Template usage, approval times
- **Infrastructure** - Resource utilization, scaling events

## Scalability Patterns

### Horizontal Scaling

- **Stateless Services** - Easy horizontal scaling
- **Load Balancing** - Traffic distribution
- **Auto-scaling** - Dynamic resource allocation

### Database Scaling

- **Partitioning** - Domain-based data distribution
- **Read Replicas** - Query performance optimization
- **Caching Strategy** - Multi-level caching

### Microservices Ready

- **Service Boundaries** - Clear API contracts
- **Event-Driven** - Async communication patterns
- **Independent Deployment** - Isolated service updates

## Deployment Architecture

### Container Strategy

```
Docker Containers
├── Frontend (Nginx)
├── Backend (Node.js)
├── WebSocket Server
└── Redis Cache
```

### Infrastructure

- **Kubernetes** - Container orchestration
- **AWS Services** - DynamoDB, S3, CloudFront
- **CI/CD Pipeline** - Automated testing and deployment
- **Monitoring Stack** - Prometheus, Grafana, ELK

## Development Workflow

### Environment Management

- **Development** - Local development with mock data
- **Staging** - Production-like environment for testing
- **Production** - Live system with monitoring

### Feature Flags

- **Gradual Rollout** - Controlled feature releases
- **A/B Testing** - User experience optimization
- **Emergency Rollback** - Quick issue resolution

## Future Considerations

### Technology Evolution

- **Framework Updates** - React 19+, TypeScript 6+
- **Build Tools** - Vite 6+, Turbopack
- **State Management** - Zustand 5+, React Query 6+

### Architecture Evolution

- **Microservices** - Service decomposition
- **Event Sourcing** - Complete audit trail
- **GraphQL** - Flexible data fetching
- **Edge Computing** - Global performance optimization 