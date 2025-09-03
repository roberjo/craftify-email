# Craftify Email - Email Template Management System

## 🚀 **Project Overview**

Craftify Email is a comprehensive email template management system designed for enterprise use. It provides a modern, collaborative platform for creating, managing, and approving email templates with advanced features like real-time collaboration, approval workflows, and comprehensive audit logging.

## ✨ **Key Features**

### **Core Features (Implemented)**
- ✅ **Modern Web Interface**: React 18+ with TypeScript and Tailwind CSS
- ✅ **Email Editor**: WYSIWYG editor with React Quill
- ✅ **Template Management**: Create, edit, and organize email templates
- ✅ **Responsive Design**: Mobile-first responsive layout
- ✅ **Component Library**: Shadcn/ui components for consistent UI
- ✅ **State Management**: Zustand for global state management
- ✅ **API Server**: Express.js backend with TypeScript
- ✅ **Swagger Documentation**: Interactive API documentation
- ✅ **Real-time Features**: WebSocket support for live collaboration

### **Planned Enterprise Features**
- 🔄 **Role-Based Access Control (RBAC)**: Multi-level user permissions
- 🔄 **Approval Workflows**: Multi-stage template approval process
- 🔄 **Version Control**: Template versioning and rollback
- 🔄 **Real-time Collaboration**: Live editing with conflict resolution
- 🔄 **Bulk Operations**: Mass template management
- 🔄 **Audit Logging**: Comprehensive action tracking
- 🔄 **Folder Organization**: Hierarchical template organization
- 🔄 **Variable Substitution**: Dynamic content management
- 🔄 **Template Components**: Reusable template parts
- 🔄 **Analytics Dashboard**: Template usage and performance metrics

## 🏗️ **Architecture**

### **Frontend Stack**
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: Zustand for global state
- **Routing**: React Router v6 for navigation
- **Real-time**: WebSocket client for live updates

### **Backend Stack (Planned)**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware stack
- **Database**: AWS DynamoDB for scalable storage
- **Authentication**: Okta SDK for JWT validation
- **Real-time**: WebSocket server for live features
- **Documentation**: Swagger/OpenAPI 3.0 specification

### **Monorepo Management**
- **Package Manager**: NPM workspaces
- **Build System**: TypeScript compilation across packages
- **Development Tools**: ESLint, Prettier, and automated scripts

## 📁 **Project Structure & Status**

The project is organized as a monorepo using [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) to manage multiple applications and packages within a single repository. This structure promotes code reusability, simplifies dependency management, and facilitates consistent development practices across different parts of the system.

```
craftify-email/
├── 📁 .git/                               # Git version control directory (Managed by Git)
├── 📄 .gitattributes                      # Git attributes for line endings and file types (✅ Complete)
├── 📄 .gitignore                          # Global Git ignore rules for the monorepo (✅ Complete)
├── 📄 .eslintrc.json                     # Root ESLint configuration for code quality (✅ Complete)
├── 📄 .prettierrc                         # Root Prettier configuration for code formatting (✅ Complete)
├── 📄 package.json                        # Root package.json defining workspaces and monorepo scripts (✅ Complete)
├── 📄 tsconfig.json                       # Root TypeScript configuration with path aliases and project references (✅ Complete)
├── 📄 LICENSE                             # Project license (MIT) (✅ Complete)
├── 📄 README.md                           # Project overview, setup, and current status (✅ Complete)
├── 📁 apps/                               # Contains individual applications
│   ├── 📁 web/                           # Frontend React application
│   │   ├── 📄 .gitignore                 # Git ignore rules for the web app (✅ Complete)
│   │   ├── 📄 package.json               # Web app dependencies and scripts (✅ Complete)
│   │   ├── 📄 tsconfig.json              # Web app TypeScript configuration (✅ Complete)
│   │   ├── 📄 vite.config.ts             # Vite configuration for building the web app (✅ Complete)
│   │   ├── 📄 tailwind.config.ts          # Tailwind CSS configuration (✅ Complete)
│   │   ├── 📄 postcss.config.js           # PostCSS configuration (✅ Complete)
│   │   ├── 📄 index.html                  # Main HTML entry point (✅ Complete)
│   │   ├── 📁 public/                    # Static assets (e.g., favicon, robots.txt) (✅ Complete)
│   │   └── 📁 src/                       # Web app source code
│   │       ├── 📄 main.tsx               # React entry point (✅ Complete)
│   │       ├── 📄 App.tsx                 # Main application component and routing (✅ Complete)
│   │       ├── 📄 index.css               # Global CSS styles (✅ Complete)
│   │       ├── 📁 components/            # Reusable UI components
│   │       │   ├── 📁 layout/            # Application layout components (e.g., sidebar, top bar) (✅ Complete)
│   │       │   ├── 📁 editor/            # Email editor specific components (e.g., TemplateEditor) (✅ Complete)
│   │       │   ├── 📁 templates/          # Template-related UI components (e.g., TemplateList) (✅ Complete)
│   │       │   └── 📁 ui/                # Shadcn/ui components (e.g., Button, Input, Dialog) (✅ Complete)
│   │       ├── 📁 hooks/                # Custom React hooks (e.g., use-mobile, use-toast) (✅ Complete)
│   │       ├── 📁 lib/                  # Utility functions and mock data (e.g., utils.ts, mockData.ts) (✅ Complete)
│   │       ├── 📁 pages/                # Application pages (e.g., Dashboard, Templates, Approvals) (✅ Complete)
│   │       ├── 📁 store/                # Zustand state management stores (e.g., useTemplateStore) (✅ Complete)
│   │       └── 📄 vite-env.d.ts          # Vite environment type definitions (✅ Complete)
│   └── 📁 api/                           # Backend API application
│       ├── 📄 .gitignore                 # Git ignore rules for the API app (✅ Complete)
│       ├── 📄 package.json               # API app dependencies and scripts (✅ Complete)
│       ├── 📄 tsconfig.json              # API app TypeScript configuration (✅ Complete)
│       └── 📁 src/                       # API app source code
│           ├── 📄 index.ts               # Main API entry point (✅ Complete)
│           ├── 📁 config/                # Configuration files (✅ Complete)
│           │   ├── index.ts              # Main configuration (✅ Complete)
│           │   └── swagger.ts            # Swagger/OpenAPI configuration (✅ Complete)
│           ├── 📁 middleware/            # Express middleware (✅ Complete)
│           │   ├── errorHandler.ts       # Error handling middleware (✅ Complete)
│           │   └── notFoundHandler.ts    # 404 handler middleware (✅ Complete)
│           ├── 📁 routes/                # API route definitions (✅ Complete)
│           │   └── index.ts              # Main route definitions with Swagger docs (✅ Complete)
│           ├── 📁 services/              # Business logic services (Planned)
│           └── 📁 utils/                 # API utility functions (✅ Complete)
│               ├── logger.ts             # Logging utilities (✅ Complete)
│               └── websocket.ts          # WebSocket management (✅ Complete)
├── 📁 packages/                           # Reusable packages shared across applications
│   ├── 📁 shared/                        # Shared types, utilities, and validation schemas
│   │   ├── 📄 .gitignore                 # Git ignore rules for the shared package (✅ Complete)
│   │   ├── 📄 package.json               # Shared package dependencies and scripts (✅ Complete)
│   │   ├── 📄 tsconfig.json              # Shared package TypeScript configuration (✅ Complete)
│   │   └── 📁 src/                       # Shared package source code
│   │       ├── 📄 index.ts               # Entry point for shared package (✅ Complete)
│   │       ├── 📄 types.ts               # Core TypeScript interfaces and types (✅ Complete)
│   │       └── 📄 utils.ts               # Common utility functions (✅ Complete)
│   ├── 📁 ui/                            # Reusable UI components library (Planned)
│   │   ├── 📄 .gitignore                 # Git ignore rules for the UI package (✅ Complete)
│   │   └── 📁 src/                       # UI package source code (Planned)
│   └── 📁 editor/                        # Editor-specific components and logic (Planned)
│       ├── 📄 .gitignore                 # Git ignore rules for the Editor package (✅ Complete)
│       └── 📁 src/                       # Editor package source code (Planned)
├── 📁 docs/                               # Project documentation
│   ├── 📄 SUMMARY.md                      # High-level summary of project transformation (✅ Complete)
│   ├── 📄 architecture.md                 # System architecture overview (✅ Complete)
│   ├── 📄 api.md                          # API endpoint specifications with Swagger docs (✅ Complete)
│   ├── 📄 components.md                   # UI component documentation (✅ Complete)
│   ├── 📄 development.md                  # Development setup and guidelines (✅ Complete)
│   ├── 📄 deployment.md                   # Deployment strategies and considerations (✅ Complete)
│   ├── 📄 roadmap.md                      # Project development roadmap (✅ Complete)
│   ├── 📄 contributing.md                 # Guidelines for contributors (✅ Complete)
│   └── 📄 project-status.md               # Detailed current project status (✅ Complete)
├── 📁 scripts/                            # Utility scripts for development and operations
│   └── 📄 dev-setup.sh                    # Script for setting up the local development environment (✅ Complete)
└── 📁 tools/                              # Development tools and configurations
    └── 📄 gitignore-template.txt          # Template for package-specific .gitignore files (✅ Complete)
```

## 🚀 **Getting Started**

### **Prerequisites**
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Git**: For version control

### **Quick Setup**
```bash
# Clone the repository
git clone <repository-url>
cd craftify-email

# Run the automated setup script
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

### **Manual Setup**
```bash
# Install dependencies
npm install

# Build shared packages
npm run build --workspace=packages/shared

# Build applications
npm run build --workspace=apps/web
npm run build --workspace=apps/api

# Start development servers
npm run dev
```

## 🌐 **Running the Application**

### **Frontend (Web App)**
```bash
npm run dev --workspace=apps/web
```
**Available at**: http://localhost:8080

### **Backend (API)**
```bash
npm run dev --workspace=apps/api
```
**Available at**: http://localhost:3001

### **API Documentation (Swagger)**
**Swagger UI**: http://localhost:3001/api-docs
**Health Check**: http://localhost:3001/health
**API Info**: http://localhost:3001/api

## 📊 **Current Project Status**

### **✅ Implemented (100%)**
- **Monorepo Structure**: Complete NPM workspace setup
- **Frontend Application**: Fully functional React app with all components
- **Backend API**: Express.js server with basic endpoints
- **Swagger Documentation**: Interactive API documentation
- **Development Environment**: Automated setup and build system
- **TypeScript Configuration**: Strict mode across all packages
- **Code Quality Tools**: ESLint and Prettier configuration
- **Git Configuration**: Comprehensive ignore rules and attributes

### **🚧 In Progress (75%)**
- **API Endpoints**: Core infrastructure complete, adding business logic
- **Authentication**: JWT-based authentication system
- **Database Integration**: DynamoDB connection setup

### **📋 Planned (0%)**
- **Advanced Features**: Approval workflows, real-time collaboration
- **Testing Infrastructure**: Unit and integration tests
- **Production Deployment**: CI/CD pipeline and infrastructure

## 🛠️ **Development**

### **Available Scripts**
```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:web          # Start frontend only
npm run dev:api          # Start backend only

# Building
npm run build:all        # Build all packages
npm run build:web        # Build frontend
npm run build:api        # Build backend

# Code Quality
npm run lint:all         # Lint all packages
npm run format:all       # Format all packages

# Dependencies
npm run install:all      # Install dependencies for all workspaces
npm run clean:all        # Clean build artifacts
```

### **Adding New Features**
1. **Frontend**: Add components in `apps/web/src/components/`
2. **Backend**: Add routes in `apps/api/src/routes/`
3. **Shared**: Add types and utilities in `packages/shared/src/`
4. **Documentation**: Update relevant docs in `docs/`

## 🔒 **Security Features**

- **Content Security Policy (CSP)**: XSS prevention
- **Input Validation**: Comprehensive request validation
- **Secure Session Management**: JWT-based authentication
- **Audit Logging**: Complete action tracking
- **Data Encryption**: Encryption at rest and in transit
- **Role-Based Access Control (RBAC)**: Multi-level permissions

## 📈 **Performance Targets**

- **Frontend Load Time**: < 2 seconds
- **API Response Time**: < 100ms for simple operations
- **Template Rendering**: < 500ms for complex templates
- **Real-time Updates**: < 100ms latency
- **Database Queries**: < 50ms for indexed operations

## 🚀 **Deployment Considerations**

- **Containerization**: Docker for consistent environments
- **Orchestration**: Kubernetes for scaling
- **CDN**: Global content delivery
- **Monitoring**: Application performance monitoring
- **Backup**: Automated backup strategies
- **Blue-Green Deployment**: Zero-downtime deployments

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](docs/contributing.md) for details on:

- Setting up the development environment
- Code style and standards
- Testing requirements
- Pull request process
- Code review guidelines

## 📚 **Documentation**

- **[Architecture Guide](docs/architecture.md)**: System design and architecture
- **[API Documentation](docs/api.md)**: Complete API reference with Swagger
- **[Development Guide](docs/development.md)**: Setup and development workflow
- **[Component Guide](docs/components.md)**: UI component documentation
- **[Deployment Guide](docs/deployment.md)**: Production deployment
- **[Project Status](docs/project-status.md)**: Current implementation status

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: [docs/](docs/) directory
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: team@craftify-email.com

## 🙏 **Acknowledgments**

- **React Team**: For the amazing frontend framework
- **Vite Team**: For the fast build tool
- **Tailwind CSS**: For the utility-first CSS framework
- **Shadcn/ui**: For the beautiful component library
- **Express.js**: For the robust Node.js framework
- **Open Source Community**: For all the amazing tools and libraries

---

**Craftify Email** - Building the future of email template management, one template at a time. 🚀
