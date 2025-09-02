# Craftify Email - Email Template Management System

A modern, enterprise-grade email template management system built with React, TypeScript, and modern web technologies. This system provides a sophisticated WYSIWYG editor for creating and managing HTML email templates with role-based access control, approval workflows, and real-time collaboration capabilities.

## 🚀 Features

### Core Functionality
- **WYSIWYG Email Editor**: Rich text editor with React Quill for creating professional email templates
- **Template Management**: Create, edit, duplicate, and organize email templates
- **Folder Organization**: Hierarchical folder structure for template organization
- **Variable Support**: Dynamic content with customizable variables (e.g., {{firstName}}, {{orderNumber}})
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Enterprise Features (Planned)
- **Role-Based Access Control (RBAC)**: Okta integration for enterprise authentication
- **Approval Workflows**: Multi-stage approval process for template publishing
- **Version Control**: Complete audit trail and version history
- **Real-time Collaboration**: WebSocket-based collaborative editing
- **Bulk Operations**: Mass template management capabilities
- **Audit Logging**: Comprehensive change tracking and compliance

## 🏗️ Architecture

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state, React Query for server state
- **Editor**: React Quill for rich text editing
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router v6

### Planned Backend (BFF)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js or Fastify
- **Database**: AWS DynamoDB
- **Authentication**: Okta SDK with JWT validation
- **Real-time**: WebSocket support for collaboration

## 📁 Project Structure

```
craftify-email/
├── apps/
│   ├── web/                    # React frontend application
│   └── api/                    # Backend API (planned)
├── packages/
│   ├── shared/                 # Shared types and utilities
│   ├── ui/                     # Reusable UI components
│   └── editor/                 # Email editor components
├── docs/                       # Project documentation
├── scripts/                    # Build and deployment scripts
└── tools/                      # Development tools and configs
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/craftify-email.git
   cd craftify-email
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎯 Current Status

### ✅ Implemented
- React application structure with TypeScript
- Component library with Shadcn/ui
- Basic routing and layout
- Template editor with React Quill
- State management with Zustand
- Type definitions and interfaces
- Mock data and store implementation

### 🚧 In Progress
- Template management UI
- Folder organization system
- Approval workflow interface

### 📋 Planned
- Backend API development
- Okta authentication integration
- Real-time collaboration
- Complete approval workflow
- Audit trail and versioning
- Bulk operations
- Email preview and testing
- Deployment infrastructure

## 🧪 Development

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting
- Conventional commits for version control

### Testing Strategy
- Unit tests with Jest and React Testing Library
- Integration tests for API endpoints
- E2E tests with Playwright (planned)
- 80% code coverage target

### State Management
The application uses Zustand for global state management with the following stores:
- `useTemplateStore`: Template and folder management
- Future: `useAuthStore`, `useApprovalStore`, `useCollaborationStore`

## 🔒 Security & Compliance

### Planned Security Features
- Content Security Policy (CSP) headers
- XSS prevention in template rendering
- Input validation and sanitization
- Secure session management
- Audit logging for compliance
- Data encryption at rest and in transit

### Authentication & Authorization
- Okta SSO integration
- Role-based access control (RBAC)
- Domain-based user isolation
- Permission-based feature access

## 📊 Performance Targets

- Initial page load: < 3 seconds
- Template list pagination: 50 items per page
- Lazy loading for template content
- Optimistic UI updates
- Auto-save every 30 seconds
- WebSocket reconnection strategy

## 🚀 Deployment

### Development
- Local development with Vite dev server
- Hot module replacement
- Environment-based configuration

### Production (Planned)
- Docker containerization
- Kubernetes orchestration
- CDN for static assets
- Blue-green deployment support
- Health check endpoints
- Graceful shutdown handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Use conventional commit messages
- Ensure accessibility compliance

## 📚 Documentation

- [API Documentation](./docs/api.md) - API endpoints and schemas
- [Component Library](./docs/components.md) - UI component documentation
- [Architecture Guide](./docs/architecture.md) - System design and patterns
- [Development Guide](./docs/development.md) - Setup and contribution guidelines
- [Deployment Guide](./docs/deployment.md) - Production deployment instructions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/craftify-email/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/craftify-email/discussions)
- **Documentation**: [Project Wiki](https://github.com/your-org/craftify-email/wiki)

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the component library
- [React Quill](https://github.com/zenoamaro/react-quill) for the rich text editor
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Zustand](https://github.com/pmndrs/zustand) for state management
