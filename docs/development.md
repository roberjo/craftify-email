# Development Guide

## Overview

This guide provides comprehensive instructions for setting up and developing the Craftify Email project. The project is structured as a monorepo using NPM workspaces, with separate applications for the frontend web app and backend API.

## 🚀 **Quick Start**

### **Prerequisites**
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Git**: For version control

### **One-Command Setup**
```bash
# Clone the repository
git clone <repository-url>
cd craftify-email

# Run the automated setup script
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

This script will:
- Install all dependencies across all workspaces
- Build shared packages
- Create necessary environment files
- Set up the development environment

## 🏗️ **Project Structure**

```
craftify-email/
├── apps/                    # Application packages
│   ├── web/                # Frontend React application
│   └── api/                # Backend API application
├── packages/                # Shared packages
│   └── shared/             # Common types and utilities
├── docs/                    # Project documentation
├── scripts/                 # Development scripts
└── tools/                   # Development tools
```

## 🔧 **Development Environment Setup**

### **Manual Setup (Alternative to Script)**

#### **1. Install Root Dependencies**
```bash
# Install root-level dependencies
npm install

# Install dependencies for all workspaces
npm run install:all
```

#### **2. Build Shared Packages**
```bash
# Build the shared package first
npm run build --workspace=packages/shared
```

#### **3. Build Applications**
```bash
# Build the web application
npm run build --workspace=apps/web

# Build the API application
npm run build --workspace=apps/api
```

### **Environment Configuration**

#### **Frontend Environment**
Create `apps/web/.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=Craftify Email
```

#### **Backend Environment**
Create `apps/api/.env.local`:
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
JWT_SECRET=your-secret-key
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## 🖥️ **Running the Applications**

### **Start Frontend Development Server**
```bash
# From root directory
npm run dev --workspace=apps/web

# Or from apps/web directory
cd apps/web
npm run dev
```

**Frontend will be available at**: http://localhost:8080

### **Start Backend API Server**
```bash
# From root directory
npm run dev --workspace=apps/api

# Or from apps/api directory
cd apps/api
npm run dev
```

**API will be available at**: http://localhost:3001

### **Start Both Simultaneously**
```bash
# From root directory
npm run dev
```

This will start both frontend and backend in parallel.

## 📚 **API Development with Swagger**

### **Swagger Documentation**
The API includes comprehensive Swagger/OpenAPI documentation:

- **Swagger UI**: http://localhost:3001/api-docs
- **OpenAPI JSON**: http://localhost:3001/api-docs/swagger.json

### **Adding New API Endpoints**

#### **1. Create Route Handler**
```typescript
// apps/api/src/routes/templates.ts
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get all templates
 *     description: Retrieve a list of email templates
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: domain
 *         schema:
 *           type: string
 *         required: true
 *         description: Domain identifier
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
 *                     $ref: '#/components/schemas/EmailTemplate'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    // Implementation here
    res.json({
      success: true,
      data: [],
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve templates',
        details: error.message
      }
    });
  }
});

export default router;
```

#### **2. Register Route in Main Router**
```typescript
// apps/api/src/routes/index.ts
import templateRoutes from './templates';

// ... existing code ...

router.use('/templates', templateRoutes);
```

#### **3. Add Schema Definitions**
```typescript
// apps/api/src/config/swagger.ts
// Add to the components.schemas section:

EmailTemplate: {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: 'template_123'
    },
    name: {
      type: 'string',
      example: 'Welcome Email'
    },
    // ... other properties
  }
}
```

### **Testing API Endpoints**

#### **Using Swagger UI**
1. Open http://localhost:3001/api-docs
2. Click on any endpoint
3. Click "Try it out"
4. Fill in parameters and click "Execute"

#### **Using cURL**
```bash
# Health check
curl http://localhost:3001/health

# API info
curl http://localhost:3001/api

# Test with authentication (when implemented)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/templates?domain=marketing
```

#### **Using Postman**
1. Import the OpenAPI specification from `/api-docs/swagger.json`
2. Set up environment variables
3. Test endpoints with the collection

## 🎨 **Frontend Development**

### **Component Development**

#### **Creating New Components**
```typescript
// apps/web/src/components/ui/MyComponent.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  className,
  children
}) => {
  return (
    <div className={cn("base-styles", className)}>
      {children}
    </div>
  );
};
```

#### **Using Shadcn/ui Components**
```bash
# Add new components from shadcn/ui
cd apps/web
npx shadcn@latest add [component-name]
```

### **State Management**

#### **Creating Zustand Store**
```typescript
// apps/web/src/store/useMyStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MyState {
  data: any[];
  loading: boolean;
  fetchData: () => Promise<void>;
}

export const useMyStore = create<MyState>()(
  devtools(
    (set, get) => ({
      data: [],
      loading: false,
      fetchData: async () => {
        set({ loading: true });
        try {
          // API call here
          const response = await fetch('/api/data');
          const data = await response.json();
          set({ data: data.data, loading: false });
        } catch (error) {
          set({ loading: false });
          console.error('Failed to fetch data:', error);
        }
      },
    }),
    { name: 'my-store' }
  )
);
```

### **API Integration**

#### **Creating API Hooks**
```typescript
// apps/web/src/hooks/useApi.ts
import { useState, useEffect } from 'react';

interface UseApiOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export function useApi<T>({ url, method = 'GET', body, headers }: UseApiOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (method === 'GET') {
      execute();
    }
  }, [url]);

  return { data, loading, error, execute };
}
```

## 🧪 **Testing**

### **Running Tests**

#### **Frontend Tests**
```bash
cd apps/web
npm test                    # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
npm run test:ci            # Run tests once for CI
```

#### **Backend Tests**
```bash
cd apps/api
npm test                    # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
npm run test:ci            # Run tests once for CI
```

### **Writing Tests**

#### **Frontend Component Test**
```typescript
// apps/web/src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent>Test Content</MyComponent>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
```

#### **Backend API Test**
```typescript
// apps/api/src/routes/__tests__/templates.test.ts
import request from 'supertest';
import app from '../../index';

describe('GET /api/templates', () => {
  it('should return templates list', async () => {
    const response = await request(app)
      .get('/api/templates')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

## 🔍 **Debugging**

### **Frontend Debugging**

#### **React Developer Tools**
- Install React Developer Tools browser extension
- Use Components tab to inspect component hierarchy
- Use Profiler tab to analyze performance

#### **Console Logging**
```typescript
// Use console.log for debugging
console.log('Component rendered with props:', props);

// Use console.group for grouped logs
console.group('API Response');
console.log('Status:', response.status);
console.log('Data:', response.data);
console.groupEnd();
```

### **Backend Debugging**

#### **Node.js Debugger**
```bash
# Start with debugger
cd apps/api
node --inspect src/index.ts

# Or use tsx with debugging
npx tsx --inspect src/index.ts
```

#### **Logging**
```typescript
// Use the logger utility
import { logger } from '../utils/logger';

logger.info('Request received', { path: req.path, method: req.method });
logger.error('Database connection failed', { error: err.message });
logger.debug('Processing template', { templateId: req.params.id });
```

## 📦 **Building for Production**

### **Build All Packages**
```bash
# From root directory
npm run build:all

# This will build:
# - packages/shared
# - apps/web
# - apps/api
```

### **Build Individual Packages**
```bash
# Build shared package
npm run build --workspace=packages/shared

# Build web app
npm run build --workspace=apps/web

# Build API
npm run build --workspace=apps/api
```

### **Production Builds**

#### **Frontend Production Build**
```bash
cd apps/web
npm run build
```

The built files will be in `apps/web/dist/` and ready for deployment.

#### **Backend Production Build**
```bash
cd apps/api
npm run build
npm start
```

## 🚀 **Deployment**

### **Frontend Deployment**
```bash
# Build the application
cd apps/web
npm run build

# Deploy dist/ folder to your hosting service
# Examples: Vercel, Netlify, AWS S3, etc.
```

### **Backend Deployment**
```bash
# Build the application
cd apps/api
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start dist/index.js --name "craftify-api"
```

## 🔧 **Development Scripts**

### **Available Scripts**

#### **Root Level Scripts**
```bash
npm run dev              # Start both frontend and backend
npm run build:all        # Build all packages
npm run install:all      # Install dependencies for all workspaces
npm run clean:all        # Clean build artifacts from all workspaces
npm run lint:all         # Lint all packages
npm run test:all         # Run tests for all packages
```

#### **Frontend Scripts**
```bash
npm run dev --workspace=apps/web      # Start development server
npm run build --workspace=apps/web    # Build for production
npm run preview --workspace=apps/web  # Preview production build
npm run lint --workspace=apps/web     # Lint code
npm run test --workspace=apps/web     # Run tests
```

#### **Backend Scripts**
```bash
npm run dev --workspace=apps/api      # Start development server
npm run build --workspace=apps/api    # Build for production
npm run start --workspace=apps/api    # Start production server
npm run lint --workspace=apps/api     # Lint code
npm run test --workspace=apps/api     # Run tests
```

## 📚 **Useful Commands**

### **Workspace Management**
```bash
# Run command in specific workspace
npm run dev --workspace=apps/web
npm run build --workspace=apps/api

# Install package in specific workspace
npm install lodash --workspace=apps/web
npm install express --workspace=apps/api

# Run command in all workspaces
npm run lint --workspaces
npm run test --workspaces
```

### **Dependency Management**
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Audit for security vulnerabilities
npm audit
npm audit fix
```

## 🐛 **Common Issues & Solutions**

### **Build Issues**

#### **TypeScript Compilation Errors**
```bash
# Clean and rebuild
npm run clean:all
npm run build:all
```

#### **Dependency Issues**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
npm install
```

### **Runtime Issues**

#### **Port Already in Use**
```bash
# Find process using port
lsof -i :3001
lsof -i :8080

# Kill process
kill -9 <PID>
```

#### **WebSocket Connection Issues**
- Check if backend is running
- Verify WebSocket server is initialized
- Check browser console for connection errors

## 📖 **Additional Resources**

### **Documentation**
- [Project README](../README.md) - Project overview and setup
- [API Documentation](./api.md) - Complete API reference
- [Architecture Guide](./architecture.md) - System architecture details
- [Contributing Guide](./contributing.md) - How to contribute

### **External Resources**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)

### **Development Tools**
- [Vite Documentation](https://vitejs.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## 🎯 **Next Steps**

1. **Complete API Implementation**: Finish template CRUD operations
2. **Add Authentication**: Implement JWT-based authentication
3. **Database Integration**: Connect to DynamoDB
4. **Frontend-Backend Integration**: Connect React app to API
5. **Testing**: Add comprehensive test coverage
6. **Deployment**: Set up production deployment pipeline

The development environment is now fully set up with hot reloading, comprehensive documentation, and a solid foundation for building features. You can start developing immediately with the working frontend and backend infrastructure. 