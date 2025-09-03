# Contributing Guide

## Welcome Contributors! 🎉

Thank you for your interest in contributing to Craftify Email! This guide will help you get started with contributing to our project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Community Guidelines](#community-guidelines)

## Code of Conduct

### Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to a positive environment for our community include:

- Using welcoming and inclusive language
- Being respectful of differing opinions and viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior include:

- The use of sexualized language or imagery, and sexual attention or advances
- Trolling, insulting or derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Violations of the Code of Conduct may be reported to the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

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

### First Steps

1. **Fork the repository**
   - Go to [https://github.com/your-org/craftify-email](https://github.com/your-org/craftify-email)
   - Click the "Fork" button in the top-right corner
   - This creates a copy of the repository in your GitHub account

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/craftify-email.git
   cd craftify-email
   ```

3. **Add the upstream remote**
   ```bash
   git remote add upstream https://github.com/your-org/craftify-email.git
   ```

4. **Verify your setup**
   ```bash
   git remote -v
   # Should show:
   # origin    https://github.com/YOUR_USERNAME/craftify-email.git (fetch)
   # origin    https://github.com/YOUR_USERNAME/craftify-email.git (push)
   # upstream  https://github.com/your-org/craftify-email.git (fetch)
   # upstream  https://github.com/your-org/craftify-email.git (push)
   ```

## Development Setup

### Monorepo Structure

Craftify Email is organized as a monorepo with the following structure:

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

### Installation

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Install workspace dependencies**
   ```bash
   npm run install:workspaces
   ```

3. **Build shared packages**
   ```bash
   npm run build --workspace=@craftify/shared
   ```

### Development Commands

#### Root Level Commands
```bash
# Development
npm run dev                    # Start web development server
npm run dev:api               # Start API development server

# Building
npm run build                 # Build all packages
npm run build:web            # Build web application
npm run build:api            # Build API

# Testing
npm run test                  # Run all tests
npm run test:web             # Run web tests
npm run test:api             # Run API tests

# Linting and Type Checking
npm run lint                  # Lint all packages
npm run type-check            # Type check all packages
npm run lint:fix              # Fix linting issues

# Maintenance
npm run clean                 # Clean all build artifacts
npm run update:deps           # Update dependencies
npm run audit                 # Security audit
```

#### Package-Specific Commands
```bash
# Web Application
cd apps/web
npm run dev                   # Start development server
npm run build                 # Build for production
npm run preview               # Preview production build

# Shared Package
cd packages/shared
npm run build                 # Build package
npm run dev                   # Watch mode for development

# API Package
cd apps/api
npm run dev                   # Start development server
npm run build                 # Build package
npm run start                 # Start production server
```

## Contributing Guidelines

### Issue Types

We use different issue types to organize our work:

- **🐛 Bug Report**: Something isn't working as expected
- **✨ Feature Request**: Suggest an idea for this project
- **📚 Documentation**: Improvements or additions to documentation
- **🔧 Enhancement**: Improve existing functionality
- **🧪 Testing**: Add or improve tests
- **⚡ Performance**: Performance improvements
- **🔒 Security**: Security-related issues
- **🚀 Deployment**: Deployment and infrastructure improvements

### Issue Labels

- **good first issue**: Perfect for newcomers
- **help wanted**: Extra attention is needed
- **priority: high**: High priority issues
- **priority: low**: Low priority issues
- **status: in progress**: Currently being worked on
- **status: blocked**: Blocked by other issues
- **type: bug**: Bug fixes
- **type: feature**: New features
- **type: documentation**: Documentation updates

### Branch Naming Convention

We use the following branch naming convention:

```
type/scope/description

Examples:
- feature/templates/add-bulk-export
- bugfix/editor/fix-variable-insertion
- enhancement/auth/improve-okta-integration
- docs/readme/update-installation-steps
- chore/deps/update-react-to-19
```

**Types:**
- `feature` - New features
- `bugfix` - Bug fixes
- `enhancement` - Improvements to existing features
- `docs` - Documentation changes
- `chore` - Maintenance tasks
- `hotfix` - Critical fixes for production

**Scopes:**
- `templates` - Template management
- `editor` - Email editor
- `auth` - Authentication system
- `api` - Backend API
- `ui` - User interface components
- `deps` - Dependencies

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```bash
feat(templates): add bulk delete functionality

feat(editor): implement variable insertion panel

fix(auth): resolve token refresh issue

docs(readme): update installation instructions

chore(deps): update dependencies to latest versions

refactor(store): simplify template store implementation

test(components): add unit tests for TemplateCard
```

## Code Standards

### TypeScript Guidelines

- **Use strict mode** - All TypeScript strict flags are enabled
- **Prefer interfaces** over types for object shapes
- **Use generic types** for reusable components
- **Implement proper error handling** with typed errors
- **Avoid `any` type** - Use proper typing or `unknown`

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

// Avoid: Using any type
// ❌ const data: any = response.json();
// ✅ const data: ApiResponse = response.json();
```

### React Best Practices

- **Use functional components** with hooks
- **Implement proper dependency arrays** in useEffect
- **Use React.memo** for expensive components
- **Follow custom hook patterns** for reusable logic
- **Use proper prop interfaces** and default props

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

// Good: Proper prop interface
interface TemplateCardProps {
  template: EmailTemplate;
  onSelect: (templateId: string) => void;
  selected?: boolean;
  className?: string;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
  selected = false,
  className,
}) => {
  // Component implementation
};
```

### CSS and Styling

- **Use Tailwind CSS** utility classes
- **Follow mobile-first** responsive design
- **Use CSS custom properties** for theming
- **Implement consistent spacing** with design tokens
- **Ensure accessibility** with proper contrast and focus states

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

// Good: Accessibility-focused styling
.button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.button:focus:not(:focus-visible) {
  outline: none;
}
```

### State Management

- **Keep stores focused** and single-purpose
- **Use proper error handling** in stores
- **Implement optimistic updates** where appropriate
- **Use selectors** for derived state
- **Follow immutability patterns**

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

## Testing Guidelines

### Testing Strategy

We follow a comprehensive testing strategy:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Test performance characteristics
- **Accessibility Tests**: Test accessibility compliance

### Test Coverage Requirements

- **Minimum coverage**: 80% for all packages
- **Critical paths**: 100% coverage for authentication and data operations
- **New features**: Must include tests before merging
- **Bug fixes**: Must include regression tests

### Testing Tools

- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing (planned)
- **MSW**: API mocking
- **Testing Library**: User-centric testing utilities

### Writing Tests

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

### Mock Data

```typescript
// test/mocks/templates.ts
export const mockTemplate: EmailTemplate = {
  id: 'template_1',
  domain: 'marketing',
  name: 'Welcome Email',
  subject: 'Welcome to our platform!',
  htmlContent: '<html><body><h1>Welcome!</h1></body></html>',
  plainTextContent: 'Welcome to our platform!',
  variables: ['firstName', 'companyName'],
  status: 'approved',
  enabled: true,
  version: 1,
  createdBy: 'user_1',
  createdAt: new Date('2024-01-01'),
  lastModifiedBy: 'user_1',
  lastModifiedAt: new Date('2024-01-01'),
  approvedBy: 'approver_1',
  approvedAt: new Date('2024-01-01'),
  tags: ['welcome', 'onboarding'],
};

export const mockTemplates: EmailTemplate[] = [
  mockTemplate,
  // Add more mock templates...
];
```

## Pull Request Process

### Before Submitting

1. **Ensure your code follows standards**
   - Run linting: `npm run lint`
   - Run type checking: `npm run type-check`
   - Run tests: `npm run test`
   - Check formatting: `npm run format:check`

2. **Update documentation**
   - Update relevant documentation
   - Add JSDoc comments for new functions
   - Update README if needed
   - Add examples for new features

3. **Test thoroughly**
   - Test in different browsers
   - Test on mobile devices
   - Test edge cases
   - Verify accessibility

### Creating a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**
   - Go to your fork on GitHub
   - Click "Compare & pull request"
   - Fill out the PR template
   - Request review from maintainers

3. **PR Template**
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
   - [ ] Accessibility testing completed

   ## Screenshots (if applicable)
   Add screenshots for UI changes

   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No console errors or warnings
   - [ ] Performance impact considered
   ```

### Review Process

1. **Code Review**
   - Maintainers will review your code
   - Address feedback promptly
   - Make requested changes
   - Update PR as needed

2. **CI/CD Checks**
   - All tests must pass
   - Linting must pass
   - Type checking must pass
   - Build must succeed

3. **Approval**
   - At least one maintainer must approve
   - All CI checks must pass
   - Documentation must be updated
   - Tests must be included

### After Approval

1. **Squash and merge**
   - Maintainers will squash commits
   - PR will be merged to main branch
   - Your branch can be deleted

2. **Deployment**
   - Changes will be deployed automatically
   - Monitor for any issues
   - Report problems immediately

## Issue Reporting

### Bug Reports

When reporting a bug, please include:

1. **Clear description** of the problem
2. **Steps to reproduce** the issue
3. **Expected behavior** vs actual behavior
4. **Environment details** (browser, OS, version)
5. **Screenshots or videos** if applicable
6. **Console errors** or logs
7. **Reproduction case** (minimal example)

### Feature Requests

When requesting a feature, please include:

1. **Clear description** of the feature
2. **Use case** and problem it solves
3. **Proposed solution** or approach
4. **Mockups or wireframes** if applicable
5. **Priority level** and impact
6. **Alternative solutions** considered

### Issue Template

```markdown
## Issue Type
- [ ] Bug Report
- [ ] Feature Request
- [ ] Documentation
- [ ] Enhancement
- [ ] Testing
- [ ] Performance
- [ ] Security
- [ ] Deployment

## Description
Clear and concise description of the issue or request.

## Steps to Reproduce (for bugs)
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 22]
- Device: [e.g., iPhone, Desktop]

## Additional Context
Add any other context, screenshots, or logs.

## Priority
- [ ] Low
- [ ] Medium
- [ ] High
- [ ] Critical
```

## Community Guidelines

### Communication

- **Be respectful** and inclusive
- **Use clear language** and avoid jargon
- **Ask questions** when you need clarification
- **Provide constructive feedback**
- **Celebrate contributions** and successes

### Getting Help

- **Check documentation** first
- **Search existing issues** for similar problems
- **Ask in discussions** for general questions
- **Create issues** for bugs or feature requests
- **Join community channels** for real-time help

### Recognition

- **Contributors** are recognized in our README
- **Significant contributions** are highlighted
- **Community members** are celebrated
- **Mentorship** opportunities are available

## Getting Help

### Resources

- **Documentation**: [docs/](./docs/)
- **API Reference**: [docs/api.md](./docs/api.md)
- **Architecture Guide**: [docs/architecture.md](./docs/architecture.md)
- **Development Guide**: [docs/development.md](./docs/development.md)

### Community Channels

- **GitHub Discussions**: [Discussions](https://github.com/your-org/craftify-email/discussions)
- **GitHub Issues**: [Issues](https://github.com/your-org/craftify-email/issues)
- **Discord**: [Join our Discord](https://discord.gg/craftify-email)
- **Email**: [community@craftify-email.com](mailto:community@craftify-email.com)

### Mentorship

- **New contributors** are paired with mentors
- **Code reviews** include learning opportunities
- **Documentation** is written for all skill levels
- **Examples** are provided for common patterns

## Conclusion

Thank you for contributing to Craftify Email! Your contributions help make this project better for everyone. Whether you're fixing a bug, adding a feature, improving documentation, or just asking questions, your involvement is valuable and appreciated.

Remember:
- **Start small** - even small contributions matter
- **Ask questions** - we're here to help
- **Be patient** - good code takes time
- **Have fun** - coding should be enjoyable

Happy coding! 🚀 