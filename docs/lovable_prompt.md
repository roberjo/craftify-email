




/templates


J

Invite


Upgrade

Publish
# Email Template Management System with RBAC - Complete Development Prompt

## Project Overview
Create a production-ready React web application for managing email templates with enterprise-grade features including RBAC (Role-Based Access Control) via Okta integration, version control, approval workflows, and real-time collaboration capabilities. The system will provide a sophisticated WYSIWYG editor for creating and editing HTML/plaintext email templates with variable substitution support.

## Core Architecture Requirements

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **UI Library**: Material-UI (MUI) v5+
- **State Management**: Zustand for global state, React Query (TanStack Query) for server state
- **Editor**: Integrate a robust WYSIWYG editor (recommend: React Email Editor, TinyMCE, or Quill)
- **Build Tool**: Vite for optimal development experience
- **Routing**: React Router v6

### Backend for Frontend (BFF) API
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js or Fastify
- **API Documentation**: OpenAPI/Swagger
- **Validation**: Zod or Joi for request/response validation
- **Database Client**: AWS SDK for DynamoDB
- **Authentication**: Okta SDK with JWT validation

## Feature Requirements

### 1. Authentication & Authorization
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  domain: string; // Single domain membership
  groups: string[]; // e.g., ['domain:marketing', 'role:editor', 'role:approver']
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canBulkOperation: boolean;
  };
}
```

**Implementation Requirements:**
- Integrate Okta authentication with PKCE flow
- Parse Okta claims to extract group memberships (format: `domain:domainName`)
- Implement permission mapping based on group membership
- Create mock authentication service for development/testing
- Store auth tokens securely (httpOnly cookies preferred)
- Implement automatic token refresh
- Session timeout handling with user warnings

### 2. Template Management

```typescript
interface EmailTemplate {
  id: string;
  domain: string;
  folderId?: string;
  name: string;
  subject: string;
  htmlContent: string;
  plainTextContent: string;
  variables: string[]; // Free-form variables like {{firstName}}, {{orderNumber}}
  status: 'draft' | 'pending_approval' | 'approved' | 'archived';
  enabled: boolean;
  version: number;
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  tags?: string[];
  sharedComponents?: string[]; // IDs of reusable components
}

interface TemplateVersion {
  templateId: string;
  version: number;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  changedBy: string;
  changedAt: Date;
  changeReason?: string;
}
```

### 3. Folder Organization
```typescript
interface Folder {
  id: string;
  domain: string;
  name: string;
  parentId?: string; // For potential future nested folders
  createdBy: string;
  createdAt: Date;
  templateCount: number;
}
```

### 4. WYSIWYG Editor Features
**Required Capabilities:**
- Rich text formatting (bold, italic, underline, strikethrough)
- Headings (H1-H6)
- Lists (ordered/unordered)
- Links with tracking parameters option
- Tables with responsive design
- Custom HTML blocks
- Columns/Layout grids
- Button components with customizable styles
- Variable insertion with autocomplete ({{variableName}})
- HTML/Source code view toggle
- Mobile preview mode
- Dark mode preview
- Accessibility checker

**Reusable Components System:**
```typescript
interface ReusableComponent {
  id: string;
  domain: string;
  name: string;
  type: 'header' | 'footer' | 'button' | 'section' | 'custom';
  htmlContent: string;
  cssStyles?: string;
  variables?: string[];
  isGlobal: boolean; // Available across all templates in domain
}
```

### 5. Preview & Testing
- **Live Preview**: Side-by-side editor and preview panels
- **Device Preview**: Desktop, tablet, and mobile viewports
- **Email Client Preview**: Simulate rendering in major email clients
- **Variable Preview**: Test with sample data for variables
- **Test Email**: Send test email to logged-in user's email address
- **Spam Score Check**: Basic spam score analysis (optional enhancement)

### 6. Approval Workflow
```typescript
interface ApprovalRequest {
  id: string;
  templateId: string;
  templateVersion: number;
  requestedBy: string;
  requestedAt: Date;
  approvers: string[]; // List of users who can approve
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  comments?: string;
  changes: string; // Summary of changes
}
```

**Workflow Rules:**
- Templates start as 'draft' with enabled=false
- Edit permission allows saving drafts
- Approval permission required to enable templates
- Email notification to approvers on request
- Approval history maintained in audit trail
- Bulk approval capabilities for approvers

### 7. Real-time Collaboration
- WebSocket connection for real-time updates
- Show when another user is editing the same template
- Lock mechanism to prevent concurrent editing conflicts
- Auto-save functionality with conflict resolution
- Presence indicators showing active users in domain
- Change notifications for templates in current view

### 8. Audit Trail & Version Control
```typescript
interface AuditLog {
  id: string;
  entityType: 'template' | 'folder' | 'component';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'archive';
  userId: string;
  userName: string;
  timestamp: Date;
  details: {
    previousVersion?: number;
    newVersion?: number;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  };
}
```

**Features:**
- Complete history of all template changes
- Version comparison view (diff viewer)
- Restore previous versions (with approval)
- Export audit logs for compliance
- Filterable audit trail by date, user, action

### 9. Search & Filter Capabilities
- Search by template name (with autocomplete)
- Filter by enabled/disabled status
- Filter by folder
- Filter by creation/modification date
- Filter by approval status
- Advanced search in template content
- Save search filters as presets

### 10. Bulk Operations
```typescript
interface BulkOperation {
  action: 'archive' | 'delete' | 'move' | 'export' | 'enable' | 'disable';
  templateIds: string[];
  targetFolderId?: string; // For move operations
  performedBy: string;
  performedAt: Date;
  status: 'pending' | 'completed' | 'failed';
  results: {
    succeeded: string[];
    failed: { id: string; reason: string }[];
  };
}
```

**Supported Operations:**
- Bulk archive/unarchive
- Bulk delete (soft delete with recovery option)
- Bulk move to folder
- Bulk export (ZIP file with HTML/JSON)
- Bulk import from ZIP
- Bulk enable/disable (with approval)

## UI/UX Specifications

### Layout Structure
```
┌─────────────────────────────────────────────┐
│  Top Bar: Logo | Search | User Menu         │
├────────────┬────────────────────────────────┤
│            │                                 │
│  Sidebar   │     Main Content Area          │
│            │                                 │
│  - Folders │   - Template List/Grid View    │
│  - Filters │   - Template Editor             │
│  - Actions │   - Preview Panel               │
│            │                                 │
└────────────┴────────────────────────────────┘
```

### Responsive Design Breakpoints
- Mobile: 320px - 767px (single column, collapsible menu)
- Tablet: 768px - 1023px (condensed sidebar, flexible layout)
- Desktop: 1024px+ (full feature set)

### Key UI Components
1. **Template List View**
   - Data table with sorting, pagination
   - Quick actions (edit, duplicate, archive)
   - Status badges (draft, approved, archived)
   - Bulk selection checkboxes

2. **Template Editor**
   - Tabbed interface (Visual Editor | HTML Source | Plain Text)
   - Toolbar with formatting options
   - Variable insertion panel
   - Component library panel
   - Auto-save indicator

3. **Approval Dashboard**
   - Pending approvals queue
   - Approval history
   - Quick approve/reject buttons
   - Comment system for feedback

## API Endpoints Specification

### Template Endpoints
```typescript
// Template CRUD
GET    /api/templates?domain={domain}&folder={folderId}&enabled={boolean}&search={query}
GET    /api/templates/{id}
POST   /api/templates
PUT    /api/templates/{id}
DELETE /api/templates/{id}

// Version Control
GET    /api/templates/{id}/versions
GET    /api/templates/{id}/versions/{version}
POST   /api/templates/{id}/restore/{version}

// Approval Workflow
POST   /api/templates/{id}/request-approval
POST   /api/templates/{id}/approve
POST   /api/templates/{id}/reject

// Bulk Operations
POST   /api/templates/bulk

// Test & Preview
POST   /api/templates/{id}/send-test
POST   /api/templates/{id}/preview
```

### Folder Management
```typescript
GET    /api/folders?domain={domain}
POST   /api/folders
PUT    /api/folders/{id}
DELETE /api/folders/{id}
```

### Component Management
```typescript
GET    /api/components?domain={domain}
POST   /api/components
PUT    /api/components/{id}
DELETE /api/components/{id}
```

### Audit & Analytics
```typescript
GET    /api/audit-logs?entityId={id}&userId={userId}&action={action}
GET    /api/analytics/template-usage
```

## Database Schema (DynamoDB)

### Primary Table: EmailTemplates
```json
{
  "PK": "DOMAIN#marketing",
  "SK": "TEMPLATE#uuid",
  "GSI1PK": "FOLDER#folder-uuid",
  "GSI1SK": "CREATED#2024-01-01",
  "data": { /* template data */ },
  "type": "template"
}
```

### Secondary Table: AuditLogs
```json
{
  "PK": "AUDIT#2024-01",
  "SK": "TIMESTAMP#2024-01-01T12:00:00Z#uuid",
  "data": { /* audit data */ }
}
```

## Testing Requirements

### Unit Testing
- Jest + React Testing Library for components
- 80% code coverage minimum
- Test all CRUD operations
- Test permission checks
- Test validation logic

### Integration Testing
- API endpoint testing with Supertest
- Database operation testing
- Authentication flow testing
- WebSocket connection testing

### E2E Testing
- Playwright or Cypress
- Critical user journeys:
  - Login → Create Template → Edit → Submit for Approval → Approve → Enable
  - Search and filter templates
  - Bulk operations
  - Real-time collaboration scenarios

## Security Requirements
- Content Security Policy (CSP) headers
- XSS prevention in template rendering
- SQL/NoSQL injection prevention
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure session management
- Audit logging for compliance
- Data encryption at rest and in transit

## Performance Requirements
- Initial page load < 3 seconds
- Template list pagination (50 items per page)
- Lazy loading for template content
- Optimistic UI updates
- Debounced auto-save (every 30 seconds)
- WebSocket reconnection strategy
- CDN for static assets

## Development Guidelines
1. Use TypeScript strict mode
2. Implement proper error boundaries
3. Follow React best practices (hooks, memo, lazy loading)
4. Implement proper loading states
5. Provide meaningful error messages
6. Use environment variables for configuration
7. Implement feature flags for gradual rollout
8. Document all API endpoints with Swagger
9. Maintain a comprehensive README
10. Set up CI/CD pipeline with automated testing

## Monitoring & Observability
- Application performance monitoring (APM)
- Error tracking (Sentry or similar)
- User analytics (privacy-compliant)
- API request/response logging
- WebSocket connection monitoring
- Database query performance tracking

## Deployment Considerations
- Containerized deployment (Docker)
- Kubernetes orchestration ready
- Health check endpoints
- Graceful shutdown handling
- Blue-green deployment support
- Database migration strategy
- Backup and recovery procedures

## Mock Data Requirements
Create comprehensive mock data including:
- 5+ domains with different permission sets
- 50+ sample templates across domains
- 10+ reusable components
- Complete audit trail history
- Sample approval workflows
- Test user accounts with different roles

## Success Criteria
The system is considered complete when:
1. All CRUD operations work with proper authorization
2. WYSIWYG editor supports all specified features
3. Real-time collaboration works without conflicts
4. Approval workflow is fully functional
5. Audit trail captures all changes
6. System passes all test suites
7. Performance metrics are met
8. Security scan shows no critical vulnerabilities
9. Documentation is complete
10. System is deployed and accessible

This prompt should generate a fully-featured, production-ready Email Template Management System with all the enterprise features you've specified.

