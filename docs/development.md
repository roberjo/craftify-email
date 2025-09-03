# Development Guide

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher (or **yarn** 1.22.0+ / **pnpm** 8.0.0+)
- **Git** 2.30.0 or higher
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/craftify-email.git
   cd craftify-email
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   VITE_APP_NAME=Craftify Email
   VITE_APP_VERSION=1.0.0
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## Project Structure

```
craftify-email/
├── apps/
│   └── web/                    # React frontend application
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── lib/            # Utility functions and configs
│       │   ├── pages/          # Page components
│       │   ├── store/          # State management (Zustand)
│       │   ├── types/          # TypeScript type definitions
│       │   └── main.tsx        # Application entry point
│       ├── public/             # Static assets
│       ├── index.html          # HTML template
│       ├── package.json        # Frontend dependencies
│       ├── vite.config.ts      # Vite configuration
│       ├── tailwind.config.ts  # Tailwind CSS configuration
│       └── tsconfig.json       # TypeScript configuration
├── packages/                    # Shared packages (planned)
├── docs/                       # Project documentation
├── scripts/                    # Build and deployment scripts
└── tools/                      # Development tools and configs
```

## Development Workflow

### Code Style and Standards

#### TypeScript
- Use **strict mode** - all TypeScript strict flags are enabled
- Prefer **interfaces** over types for object shapes
- Use **generic types** for reusable components
- Implement proper **error handling** with typed errors

```typescript
// Good: Interface for object shapes
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
}

// Good: Generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

// Good: Typed error handling
class TemplateError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'VALIDATION_ERROR' | 'PERMISSION_DENIED'
  ) {
    super(message);
    this.name = 'TemplateError';
  }
}
```

#### React Best Practices
- Use **functional components** with hooks
- Implement **proper dependency arrays** in useEffect
- Use **React.memo** for expensive components
- Follow **custom hook patterns** for reusable logic

```typescript
// Good: Custom hook with proper dependencies
function useTemplate(templateId: string) {
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const data = await api.getTemplate(templateId);
        if (!cancelled) {
          setTemplate(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTemplate();
    
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  return { template, loading, error };
}

// Good: Memoized component
const TemplateCard = React.memo(({ template, onSelect }: TemplateCardProps) => {
  // Component implementation
});
```

#### CSS and Styling
- Use **Tailwind CSS** utility classes
- Follow **mobile-first** responsive design
- Use **CSS custom properties** for theming
- Implement **consistent spacing** with design tokens

```typescript
// Good: Responsive design with Tailwind
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
  {/* Content */}
</div>

// Good: Custom CSS properties
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

### State Management

#### Zustand Store Patterns
- Keep stores **focused and single-purpose**
- Use **immer** for complex state updates
- Implement **proper error handling**
- Use **selectors** for derived state

```typescript
// Good: Focused store with proper error handling
interface TemplateStore {
  templates: EmailTemplate[];
  loading: boolean;
  error: string | null;
  selectedTemplateId: string | null;
  
  // Actions
  fetchTemplates: () => Promise<void>;
  selectTemplate: (id: string) => void;
  clearError: () => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  loading: false,
  error: null,
  selectedTemplateId: null,

  fetchTemplates: async () => {
    try {
      set({ loading: true, error: null });
      const templates = await api.getTemplates();
      set({ templates, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch templates',
        loading: false 
      });
    }
  },

  selectTemplate: (id) => set({ selectedTemplateId: id }),
  
  clearError: () => set({ error: null }),
}));

// Good: Selector for derived state
export const useSelectedTemplate = () => {
  const { templates, selectedTemplateId } = useTemplateStore();
  return useMemo(() => 
    templates.find(t => t.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );
};
```

#### React Query Integration
- Use **proper query keys** for caching
- Implement **optimistic updates**
- Handle **loading and error states**
- Use **mutation hooks** for data changes

```typescript
// Good: React Query with proper keys and optimistic updates
export function useTemplates(filters: TemplateFilters) {
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: () => api.getTemplates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createTemplate,
    onSuccess: (newTemplate) => {
      // Optimistic update
      queryClient.setQueryData(['templates'], (old: EmailTemplate[] = []) => [
        ...old,
        newTemplate
      ]);
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}
```

### Component Development

#### Component Structure
- Use **consistent file organization**
- Implement **proper prop interfaces**
- Add **JSDoc comments** for complex components
- Use **Storybook** for component documentation (planned)

```typescript
// components/ui/button/Button.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from './buttonVariants';
import type { ButtonProps } from './Button.types';

/**
 * Button component with multiple variants and sizes
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

#### Error Boundaries
- Implement **error boundaries** for component trees
- Provide **user-friendly error messages**
- Log errors for **monitoring and debugging**
- Offer **recovery options** when possible

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold text-red-600">
            Something went wrong
          </h2>
          <p className="text-gray-600 mt-2">
            We're sorry, but something unexpected happened.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Testing Strategy

### Unit Testing

#### Component Testing
- Test **component rendering** and props
- Test **user interactions** and events
- Test **conditional rendering** and state changes
- Test **accessibility** features

```typescript
// __tests__/components/TemplateCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateCard } from '@/components/TemplateCard';
import { mockTemplate } from '@/test/mocks';

describe('TemplateCard', () => {
  const defaultProps = {
    template: mockTemplate,
    onSelect: jest.fn(),
    onAction: jest.fn(),
  };

  it('renders template information correctly', () => {
    render(<TemplateCard {...defaultProps} />);
    
    expect(screen.getByText(mockTemplate.name)).toBeInTheDocument();
    expect(screen.getByText(mockTemplate.subject)).toBeInTheDocument();
    expect(screen.getByText(mockTemplate.status)).toBeInTheDocument();
  });

  it('calls onSelect when checkbox is clicked', () => {
    render(<TemplateCard {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockTemplate.id, true);
  });

  it('calls onAction when action button is clicked', () => {
    render(<TemplateCard {...defaultProps} />);
    
    const editButton = screen.getByLabelText('Edit template');
    fireEvent.click(editButton);
    
    expect(defaultProps.onAction).toHaveBeenCalledWith('edit', mockTemplate);
  });

  it('applies correct status styling', () => {
    render(<TemplateCard {...defaultProps} />);
    
    const statusBadge = screen.getByText(mockTemplate.status);
    expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });
});
```

#### Hook Testing
- Test **hook logic** and state changes
- Test **async operations** and side effects
- Test **error handling** and edge cases
- Use **@testing-library/react-hooks** for complex hooks

```typescript
// __tests__/hooks/useTemplate.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useTemplate } from '@/hooks/useTemplate';
import { api } from '@/lib/api';

// Mock API
jest.mock('@/lib/api');

describe('useTemplate', () => {
  const mockTemplate = { id: '1', name: 'Test Template' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches template on mount', async () => {
    (api.getTemplate as jest.Mock).mockResolvedValue(mockTemplate);

    const { result } = renderHook(() => useTemplate('1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.template).toEqual(mockTemplate);
    expect(result.current.error).toBeNull();
  });

  it('handles API errors gracefully', async () => {
    const error = new Error('API Error');
    (api.getTemplate as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useTemplate('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.template).toBeNull();
  });
});
```

### Integration Testing

#### API Integration
- Test **API endpoints** with real HTTP requests
- Test **authentication** and authorization
- Test **error responses** and edge cases
- Use **MSW** (Mock Service Worker) for API mocking

```typescript
// __tests__/integration/api.test.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TemplateList } from '@/components/TemplateList';

const server = setupServer(
  rest.get('/api/templates', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          { id: '1', name: 'Template 1', status: 'approved' },
          { id: '2', name: 'Template 2', status: 'draft' },
        ],
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TemplateList API Integration', () => {
  it('loads and displays templates from API', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TemplateList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Template 1')).toBeInTheDocument();
      expect(screen.getByText('Template 2')).toBeInTheDocument();
    });
  });
});
```

### E2E Testing (Planned)

#### Playwright Setup
- Test **complete user workflows**
- Test **cross-browser compatibility**
- Test **responsive design** and mobile interactions
- Test **performance** and accessibility

```typescript
// e2e/tests/template-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Template Creation', () => {
  test('user can create a new template', async ({ page }) => {
    await page.goto('/templates');
    
    // Click create button
    await page.click('[data-testid="create-template-button"]');
    
    // Fill form
    await page.fill('[data-testid="template-name"]', 'Test Template');
    await page.fill('[data-testid="template-subject"]', 'Test Subject');
    await page.fill('[data-testid="template-content"]', 'Test content');
    
    // Submit form
    await page.click('[data-testid="save-template-button"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify template appears in list
    await expect(page.locator('text=Test Template')).toBeVisible();
  });
});
```

## Code Quality

### Linting and Formatting

#### ESLint Configuration
- **Strict rules** for code quality
- **TypeScript-aware** linting
- **React-specific** rules and hooks
- **Accessibility** linting rules

```json
// .eslintrc.json
{
  "extends": [
    "@eslint/js",
    "typescript-eslint",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/click-events-have-key-events": "error"
  }
}
```

#### Prettier Configuration
- **Consistent formatting** across the project
- **Editor integration** for automatic formatting
- **Git hooks** for pre-commit formatting

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Git Workflow

#### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `chore/task-description` - Maintenance tasks

#### Commit Messages
Follow **Conventional Commits** specification:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```bash
feat(templates): add bulk delete functionality

feat(editor): implement variable insertion panel

fix(auth): resolve token refresh issue

docs(readme): update installation instructions

chore(deps): update dependencies to latest versions
```

#### Pull Request Process
1. **Create feature branch** from main
2. **Implement changes** with tests
3. **Update documentation** as needed
4. **Create pull request** with description
5. **Code review** and address feedback
6. **Merge** after approval

## Performance Optimization

### Bundle Optimization

#### Code Splitting
- **Route-based** lazy loading
- **Component-based** lazy loading
- **Dynamic imports** for heavy features

```typescript
// Lazy load routes
const Templates = lazy(() => import('@/pages/Templates'));
const Approvals = lazy(() => import('@/pages/Approvals'));

// Lazy load heavy components
const TemplateEditor = lazy(() => import('@/components/editor/TemplateEditor'));
```

#### Tree Shaking
- Use **ES modules** for imports
- Avoid **side effects** in modules
- Use **named exports** instead of default exports

```typescript
// Good: Named exports for tree shaking
export { Button } from './Button';
export { Input } from './Input';
export { Select } from './Select';

// Avoid: Default exports
export default { Button, Input, Select };
```

### Runtime Performance

#### Memoization
- **React.memo** for expensive components
- **useMemo** for computed values
- **useCallback** for event handlers
- **Zustand selectors** for store optimization

```typescript
// Good: Memoized expensive component
const ExpensiveChart = React.memo(({ data }: ChartProps) => {
  const processedData = useMemo(() => 
    processChartData(data),
    [data]
  );

  const handleClick = useCallback((point) => {
    // Handle click
  }, []);

  return <Chart data={processedData} onClick={handleClick} />;
});

// Good: Optimized store selector
export const useFilteredTemplates = (filters: TemplateFilters) => {
  return useTemplateStore(
    useCallback(
      (state) => filterTemplates(state.templates, filters),
      [filters]
    )
  );
};
```

#### Virtual Scrolling
- Implement **virtual scrolling** for large lists
- Use **react-window** or **react-virtualized**
- Optimize **rendering performance** for thousands of items

```typescript
// Virtual scrolling for large template lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedTemplateList = ({ templates }: { templates: EmailTemplate[] }) => {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <TemplateCard template={templates[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={templates.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

## Debugging and Monitoring

### Development Tools

#### React DevTools
- **Component inspection** and state debugging
- **Performance profiling** and optimization
- **Hook debugging** and state tracking

#### Redux DevTools (Zustand)
- **State inspection** and time-travel debugging
- **Action logging** and performance monitoring
- **State persistence** for debugging

### Error Monitoring

#### Error Boundaries
- **Graceful error handling** for component trees
- **User-friendly error messages**
- **Error reporting** to monitoring services

#### Logging Strategy
- **Structured logging** with consistent format
- **Error tracking** with context information
- **Performance monitoring** and metrics

```typescript
// Logger utility
export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.log(`[INFO] ${message}`, context);
  },
  
  error: (message: string, error?: Error, context?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, error, context);
    
    // Send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: context });
    }
  },
  
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(`[WARN] ${message}`, context);
  },
};
```

## Deployment and CI/CD

### Build Process

#### Development Build
```bash
npm run build:dev
```

#### Production Build
```bash
npm run build
```

#### Build Optimization
- **Code splitting** and lazy loading
- **Tree shaking** and dead code elimination
- **Asset optimization** and compression
- **Source maps** for debugging

### Environment Configuration

#### Environment Variables
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_ENV=development

# .env.production
VITE_API_BASE_URL=https://api.craftify-email.com
VITE_APP_ENV=production
```

#### Build Configuration
```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __APP_ENV__: JSON.stringify(mode),
  },
  
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
}));
```

### CI/CD Pipeline (Planned)

#### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## Troubleshooting

### Common Issues

#### Build Errors
- **TypeScript errors** - Check type definitions and imports
- **Dependency conflicts** - Clear node_modules and reinstall
- **Environment variables** - Verify .env file configuration

#### Runtime Errors
- **State management issues** - Check Zustand store implementation
- **API integration** - Verify endpoint URLs and authentication
- **Component rendering** - Check prop types and required props

#### Performance Issues
- **Bundle size** - Analyze with webpack-bundle-analyzer
- **Rendering performance** - Use React DevTools Profiler
- **Memory leaks** - Check useEffect cleanup and event listeners

### Getting Help

- **Documentation** - Check this guide and component docs
- **Issues** - Search existing GitHub issues
- **Discussions** - Use GitHub Discussions for questions
- **Code Review** - Request help during pull request reviews

## Contributing Guidelines

### Code Review Checklist

- [ ] **Functionality** - Does the code work as intended?
- [ ] **Testing** - Are there adequate tests?
- [ ] **Documentation** - Is the code well-documented?
- [ ] **Performance** - Are there any performance concerns?
- [ ] **Accessibility** - Does the code follow accessibility guidelines?
- [ ] **Security** - Are there any security vulnerabilities?
- [ ] **Code Style** - Does the code follow project conventions?

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors or warnings
```

### Review Process

1. **Self-review** your changes before submitting
2. **Request review** from appropriate team members
3. **Address feedback** promptly and thoroughly
4. **Resolve conflicts** and update branch as needed
5. **Merge** only after approval and CI checks pass

## Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)

### Tools and Libraries
- [Vite](https://vitejs.dev/) - Build tool
- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Zod](https://zod.dev/) - Schema validation

### Best Practices
- [React Best Practices](https://react.dev/learn)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Performance Best Practices](https://web.dev/performance/) 