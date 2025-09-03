# Component Library Documentation

## Overview

The Craftify Email component library is built on top of Shadcn/ui components with Radix UI primitives, providing a consistent and accessible design system for the email template management application.

## Design Principles

- **Accessibility First**: All components follow WCAG 2.1 AA guidelines
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Consistent API**: Unified prop patterns across all components
- **Type Safety**: Full TypeScript support with proper type definitions
- **Customizable**: Theme-aware with CSS custom properties

## Component Categories

### Layout Components

#### AppLayout
The main application layout wrapper that provides the overall structure.

```tsx
import { AppLayout } from '@/components/layout/AppLayout';

<AppLayout>
  <YourPageContent />
</AppLayout>
```

**Props:**
- `children`: ReactNode - The content to render within the layout

**Features:**
- Responsive sidebar navigation
- Top bar with user menu and search
- Mobile-friendly collapsible navigation
- Consistent spacing and typography

#### AppSidebar
Navigation sidebar containing folders, filters, and quick actions.

```tsx
import { AppSidebar } from '@/components/layout/AppSidebar';

<AppSidebar
  collapsed={false}
  onCollapseChange={(collapsed) => setCollapsed(collapsed)}
/>
```

**Props:**
- `collapsed`: boolean - Whether the sidebar is collapsed
- `onCollapseChange`: (collapsed: boolean) => void - Collapse state change handler

**Features:**
- Folder tree navigation
- Search and filter controls
- Quick action buttons
- Collapsible for mobile devices

#### TopBar
Application header with branding, search, and user controls.

```tsx
import { TopBar } from '@/components/layout/TopBar';

<TopBar
  onSearch={(query) => handleSearch(query)}
  user={currentUser}
  onUserMenuAction={(action) => handleUserAction(action)}
/>
```

**Props:**
- `onSearch`: (query: string) => void - Search input handler
- `user`: User - Current authenticated user
- `onUserMenuAction`: (action: string) => void - User menu action handler

**Features:**
- Global search functionality
- User profile menu
- Notifications indicator
- Responsive design

### Template Management Components

#### TemplateList
Displays a list or grid of email templates with filtering and selection.

```tsx
import { TemplateList } from '@/components/templates/TemplateList';

<TemplateList
  templates={filteredTemplates}
  selectedIds={selectedTemplateIds}
  onSelectionChange={(ids) => setSelectedTemplateIds(ids)}
  onTemplateAction={(action, template) => handleTemplateAction(action, template)}
  viewMode="grid"
/>
```

**Props:**
- `templates`: EmailTemplate[] - Array of templates to display
- `selectedIds`: string[] - Currently selected template IDs
- `onSelectionChange`: (ids: string[]) => void - Selection change handler
- `onTemplateAction`: (action: string, template: EmailTemplate) => void - Template action handler
- `viewMode`: 'grid' | 'list' - Display mode preference

**Features:**
- Grid and list view modes
- Bulk selection with checkboxes
- Quick action buttons (edit, duplicate, archive)
- Status badges and indicators
- Responsive card layouts

#### TemplateCard
Individual template display card for grid view.

```tsx
import { TemplateCard } from '@/components/templates/TemplateCard';

<TemplateCard
  template={template}
  selected={isSelected}
  onSelect={(selected) => handleSelect(template.id, selected)}
  onAction={(action) => handleAction(action, template)}
/>
```

**Props:**
- `template`: EmailTemplate - Template data to display
- `selected`: boolean - Whether the template is selected
- `onSelect`: (selected: boolean) => void - Selection change handler
- `onAction`: (action: string) => void - Action button click handler

**Features:**
- Template preview thumbnail
- Status and enabled indicators
- Last modified information
- Quick action menu
- Hover effects and animations

#### TemplateTable
Tabular view of templates for list mode.

```tsx
import { TemplateTable } from '@/components/templates/TemplateTable';

<TemplateTable
  templates={templates}
  selectedIds={selectedTemplateIds}
  onSelectionChange={(ids) => setSelectedTemplateIds(ids)}
  onSort={(field, direction) => handleSort(field, direction)}
  sortBy="name"
  sortOrder="asc"
/>
```

**Props:**
- `templates`: EmailTemplate[] - Templates to display
- `selectedIds`: string[] - Selected template IDs
- `onSelectionChange`: (ids: string[]) => void - Selection change handler
- `onSort`: (field: string, direction: 'asc' | 'desc') => void - Sort handler
- `sortBy`: string - Current sort field
- `sortOrder`: 'asc' | 'desc' - Current sort direction

**Features:**
- Sortable columns
- Bulk selection
- Row actions menu
- Responsive table design
- Pagination support

### Editor Components

#### TemplateEditor
Main template editing interface with WYSIWYG editor.

```tsx
import { TemplateEditor } from '@/components/editor/TemplateEditor';

<TemplateEditor
  open={isEditorOpen}
  onClose={() => setEditorOpen(false)}
  template={selectedTemplate}
  mode="edit"
/>
```

**Props:**
- `open`: boolean - Whether the editor is open
- `onClose`: () => void - Close handler
- `template`: EmailTemplate | null - Template to edit (null for new)
- `mode`: 'create' | 'edit' | 'view' - Editor mode

**Features:**
- Rich text editing with React Quill
- HTML source code view
- Plain text fallback
- Variable insertion
- Live preview
- Auto-save functionality

#### EmailRichEditor
Rich text editor component for email content.

```tsx
import { EmailRichEditor } from '@/components/editor/EmailRichEditor';

<EmailRichEditor
  value={htmlContent}
  onChange={(content) => setHtmlContent(content)}
  placeholder="Enter your email content..."
  readOnly={false}
/>
```

**Props:**
- `value`: string - HTML content value
- `onChange`: (value: string) => void - Content change handler
- `placeholder`: string - Placeholder text
- `readOnly`: boolean - Whether the editor is read-only

**Features:**
- Rich text formatting toolbar
- Email-specific formatting options
- Variable insertion support
- Responsive design
- Accessibility features

#### VariablePanel
Panel for inserting and managing template variables.

```tsx
import { VariablePanel } from '@/components/editor/VariablePanel';

<VariablePanel
  variables={availableVariables}
  onVariableInsert={(variable) => insertVariable(variable)}
  onVariableAdd={(variable) => addVariable(variable)}
/>
```

**Props:**
- `variables`: string[] - Available variables
- `onVariableInsert`: (variable: string) => void - Variable insertion handler
- `onVariableAdd`: (variable: string) => void - New variable addition handler

**Features:**
- Variable autocomplete
- Quick insertion buttons
- Variable management
- Syntax highlighting

### Form Components

#### TemplateForm
Form for creating and editing template metadata.

```tsx
import { TemplateForm } from '@/components/forms/TemplateForm';

<TemplateForm
  template={template}
  onSubmit={(data) => handleSubmit(data)}
  onCancel={() => handleCancel()}
  loading={isSubmitting}
/>
```

**Props:**
- `template`: EmailTemplate | null - Template data (null for new)
- `onSubmit`: (data: TemplateFormData) => void - Form submission handler
- `onCancel`: () => void - Cancel handler
- `loading`: boolean - Submission loading state

**Features:**
- Form validation with Zod
- Error handling and display
- Loading states
- Responsive layout
- Accessibility labels

#### SearchFilters
Advanced search and filtering interface.

```tsx
import { SearchFilters } from '@/components/forms/SearchFilters';

<SearchFilters
  filters={currentFilters}
  onFiltersChange={(filters) => setFilters(filters)}
  onReset={() => resetFilters()}
/>
```

**Props:**
- `filters`: SearchFilters - Current filter state
- `onFiltersChange`: (filters: SearchFilters) => void - Filter change handler
- `onReset`: () => void - Filter reset handler

**Features:**
- Status filtering
- Date range selection
- Tag filtering
- Folder selection
- Filter presets

### UI Components

#### StatusBadge
Displays template status with appropriate styling.

```tsx
import { StatusBadge } from '@/components/ui/status-badge';

<StatusBadge status="pending_approval" />
```

**Props:**
- `status`: TemplateStatus - Template status value
- `size`: 'sm' | 'md' | 'lg' - Badge size
- `variant`: 'default' | 'outline' - Badge variant

**Status Types:**
- `draft` - Gray badge
- `pending_approval` - Yellow badge
- `approved` - Green badge
- `archived` - Red badge

#### ActionButton
Consistent action button component.

```tsx
import { ActionButton } from '@/components/ui/action-button';

<ActionButton
  action="edit"
  onClick={() => handleEdit()}
  disabled={!canEdit}
  loading={isLoading}
/>
```

**Props:**
- `action`: string - Action type (edit, duplicate, archive, delete)
- `onClick`: () => void - Click handler
- `disabled`: boolean - Disabled state
- `loading`: boolean - Loading state
- `size`: 'sm' | 'md' | 'lg' - Button size

**Action Types:**
- `edit` - Edit template
- `duplicate` - Duplicate template
- `archive` - Archive template
- `delete` - Delete template
- `approve` - Approve template
- `reject` - Reject template

### Utility Components

#### LoadingSpinner
Loading indicator component.

```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner';

<LoadingSpinner size="md" text="Loading templates..." />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' - Spinner size
- `text`: string - Loading text
- `variant`: 'default' | 'dots' | 'pulse' - Animation variant

#### EmptyState
Displays when no content is available.

```tsx
import { EmptyState } from '@/components/ui/empty-state';

<EmptyState
  title="No templates found"
  description="Create your first email template to get started"
  action={{
    label: "Create Template",
    onClick: () => handleCreate()
  }}
/>
```

**Props:**
- `title`: string - Empty state title
- `description`: string - Empty state description
- `action`: { label: string; onClick: () => void } - Action button
- `icon`: ReactNode - Custom icon

#### ConfirmationDialog
Confirmation dialog for destructive actions.

```tsx
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

<ConfirmationDialog
  open={showDeleteDialog}
  title="Delete Template"
  description="Are you sure you want to delete this template? This action cannot be undone."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  onConfirm={() => handleDelete()}
  onCancel={() => setShowDeleteDialog(false)}
  variant="destructive"
/>
```

**Props:**
- `open`: boolean - Dialog open state
- `title`: string - Dialog title
- `description`: string - Dialog description
- `confirmLabel`: string - Confirm button text
- `cancelLabel`: string - Cancel button text
- `onConfirm`: () => void - Confirm action handler
- `onCancel`: () => void - Cancel action handler
- `variant`: 'default' | 'destructive' - Dialog variant

## Component Usage Patterns

### Form Handling

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  htmlContent: z.string().min(1, 'Content is required'),
});

const TemplateForm = ({ template, onSubmit }) => {
  const form = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: template || {
      name: '',
      subject: '',
      htmlContent: '',
    },
  });

  const handleSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

### State Management Integration

```tsx
import { useTemplateStore } from '@/store/useTemplateStore';

const TemplateList = () => {
  const {
    templates,
    selectedTemplateIds,
    setSelectedTemplateIds,
    deleteTemplate,
  } = useTemplateStore();

  const handleSelectionChange = (ids) => {
    setSelectedTemplateIds(ids);
  };

  const handleDelete = async (templateId) => {
    await deleteTemplate(templateId);
  };

  return (
    <TemplateList
      templates={templates}
      selectedIds={selectedTemplateIds}
      onSelectionChange={handleSelectionChange}
      onTemplateAction={(action, template) => {
        if (action === 'delete') {
          handleDelete(template.id);
        }
      }}
    />
  );
};
```

### Responsive Design

```tsx
import { useMobile } from '@/hooks/use-mobile';

const ResponsiveComponent = () => {
  const isMobile = useMobile();

  return (
    <div className={cn(
      "grid gap-4",
      isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
    )}>
      {/* Content */}
    </div>
  );
};
```

## Accessibility Features

### Keyboard Navigation
- Tab order follows logical content flow
- Arrow keys for list navigation
- Enter/Space for button activation
- Escape for modal dismissal

### Screen Reader Support
- Proper ARIA labels and descriptions
- Semantic HTML structure
- Live regions for dynamic content
- Focus management for modals

### Color and Contrast
- WCAG AA compliant color contrast
- Color-independent status indicators
- High contrast mode support
- Focus indicators for all interactive elements

## Performance Considerations

### Lazy Loading
- Component lazy loading for routes
- Image lazy loading in templates
- Virtual scrolling for large lists
- Code splitting by feature

### Memoization
- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers
- Zustand selector optimization

### Bundle Optimization
- Tree shaking for unused components
- Dynamic imports for heavy features
- Icon library optimization
- CSS purging for unused styles

## Testing Components

### Unit Testing
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateCard } from './TemplateCard';

describe('TemplateCard', () => {
  it('renders template information correctly', () => {
    const template = {
      id: '1',
      name: 'Test Template',
      subject: 'Test Subject',
      status: 'draft',
    };

    render(<TemplateCard template={template} />);
    
    expect(screen.getByText('Test Template')).toBeInTheDocument();
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
  });

  it('calls onSelect when checkbox is clicked', () => {
    const onSelect = jest.fn();
    const template = { id: '1', name: 'Test' };

    render(<TemplateCard template={template} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onSelect).toHaveBeenCalledWith(true);
  });
});
```

### Integration Testing
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TemplateList } from './TemplateList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('TemplateList Integration', () => {
  it('loads and displays templates', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TemplateList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Welcome Email')).toBeInTheDocument();
  });
});
```

## Customization

### Theme Customization
```css
:root {
  --primary: 59 130 246;
  --primary-foreground: 255 255 255;
  --secondary: 100 116 139;
  --secondary-foreground: 255 255 255;
  --accent: 14 165 233;
  --accent-foreground: 255 255 255;
}
```

### Component Variants
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

## Best Practices

### Component Design
- Single responsibility principle
- Props interface design
- Default prop values
- Error boundaries
- Loading states

### Performance
- Avoid unnecessary re-renders
- Optimize bundle size
- Use proper memoization
- Implement virtual scrolling for large lists

### Accessibility
- Semantic HTML structure
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Color contrast compliance

### Testing
- Test component behavior
- Test accessibility features
- Test edge cases
- Maintain high test coverage
- Use testing best practices 