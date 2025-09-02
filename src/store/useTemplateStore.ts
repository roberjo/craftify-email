import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { EmailTemplate, Folder, User, SearchFilters, ApprovalRequest } from '@/types';
import { mockTemplates, mockFolders, mockUser, mockApprovalRequests } from '@/lib/mockData';

interface TemplateState {
  // Current user and auth
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Templates
  templates: EmailTemplate[];
  selectedTemplate: EmailTemplate | null;
  isLoadingTemplates: boolean;
  
  // Folders
  folders: Folder[];
  selectedFolderId: string | null;
  
  // Search and filters
  searchFilters: SearchFilters;
  searchQuery: string;
  
  // Editor state
  isEditorOpen: boolean;
  editorMode: 'create' | 'edit' | 'view';
  
  // Approval system
  approvalRequests: ApprovalRequest[];
  pendingApprovalsCount: number;
  
  // UI state
  sidebarCollapsed: boolean;
  viewMode: 'grid' | 'list';
  selectedTemplateIds: string[];
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setSelectedTemplate: (template: EmailTemplate | null) => void;
  setSelectedFolderId: (folderId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  setEditorOpen: (open: boolean, mode?: 'create' | 'edit' | 'view') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleTemplateSelection: (templateId: string) => void;
  clearTemplateSelection: () => void;
  
  // Template operations
  createTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'lastModifiedAt' | 'createdBy' | 'lastModifiedBy' | 'version'>) => Promise<EmailTemplate>;
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => Promise<EmailTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<EmailTemplate>;
  
  // Folder operations
  createFolder: (name: string, color?: string) => Promise<Folder>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
  
  // Approval operations
  requestApproval: (templateId: string) => Promise<void>;
  approveTemplate: (templateId: string, comments?: string) => Promise<void>;
  rejectTemplate: (templateId: string, comments: string) => Promise<void>;
  
  // Bulk operations
  bulkDeleteTemplates: (templateIds: string[]) => Promise<void>;
  bulkMoveTemplates: (templateIds: string[], folderId: string | null) => Promise<void>;
  bulkArchiveTemplates: (templateIds: string[]) => Promise<void>;
  
  // Computed getters
  getFilteredTemplates: () => EmailTemplate[];
  getPendingApprovals: () => ApprovalRequest[];
}

export const useTemplateStore = create<TemplateState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentUser: mockUser,
      isAuthenticated: true,
      templates: mockTemplates,
      selectedTemplate: null,
      isLoadingTemplates: false,
      folders: mockFolders,
      selectedFolderId: null,
      searchFilters: {},
      searchQuery: '',
      isEditorOpen: false,
      editorMode: 'create',
      approvalRequests: mockApprovalRequests,
      pendingApprovalsCount: mockApprovalRequests.filter(req => req.status === 'pending').length,
      sidebarCollapsed: false,
      viewMode: 'grid',
      selectedTemplateIds: [],

      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),
      
      setSelectedTemplate: (template) => set({ selectedTemplate: template }),
      
      setSelectedFolderId: (folderId) => set({ selectedFolderId: folderId }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setSearchFilters: (filters) => set({ searchFilters: filters }),
      
      setEditorOpen: (open, mode = 'create') => set({ 
        isEditorOpen: open,
        editorMode: mode 
      }),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      toggleTemplateSelection: (templateId) => set((state) => ({
        selectedTemplateIds: state.selectedTemplateIds.includes(templateId)
          ? state.selectedTemplateIds.filter(id => id !== templateId)
          : [...state.selectedTemplateIds, templateId]
      })),
      
      clearTemplateSelection: () => set({ selectedTemplateIds: [] }),

      // Template operations
      createTemplate: async (templateData) => {
        const newTemplate: EmailTemplate = {
          ...templateData,
          id: `template_${Date.now()}`,
          createdAt: new Date(),
          lastModifiedAt: new Date(),
          createdBy: get().currentUser?.id || 'unknown',
          lastModifiedBy: get().currentUser?.id || 'unknown',
          version: 1,
        };
        
        set((state) => ({
          templates: [...state.templates, newTemplate]
        }));
        
        return newTemplate;
      },

      updateTemplate: async (id, updates) => {
        const updatedTemplate = get().templates.find(t => t.id === id);
        if (!updatedTemplate) throw new Error('Template not found');

        const updated = {
          ...updatedTemplate,
          ...updates,
          lastModifiedAt: new Date(),
          lastModifiedBy: get().currentUser?.id || 'unknown',
          version: updatedTemplate.version + 1,
        };

        set((state) => ({
          templates: state.templates.map(t => t.id === id ? updated : t),
          selectedTemplate: state.selectedTemplate?.id === id ? updated : state.selectedTemplate
        }));

        return updated;
      },

      deleteTemplate: async (id) => {
        set((state) => ({
          templates: state.templates.filter(t => t.id !== id),
          selectedTemplate: state.selectedTemplate?.id === id ? null : state.selectedTemplate
        }));
      },

      duplicateTemplate: async (id) => {
        const template = get().templates.find(t => t.id === id);
        if (!template) throw new Error('Template not found');

        const duplicated: EmailTemplate = {
          ...template,
          id: `template_${Date.now()}`,
          name: `${template.name} (Copy)`,
          status: 'draft',
          enabled: false,
          createdAt: new Date(),
          lastModifiedAt: new Date(),
          createdBy: get().currentUser?.id || 'unknown',
          lastModifiedBy: get().currentUser?.id || 'unknown',
          version: 1,
          approvedBy: undefined,
          approvedAt: undefined,
        };

        set((state) => ({
          templates: [...state.templates, duplicated]
        }));

        return duplicated;
      },

      // Folder operations
      createFolder: async (name, color) => {
        const newFolder: Folder = {
          id: `folder_${Date.now()}`,
          domain: get().currentUser?.domain || 'default',
          name,
          createdBy: get().currentUser?.id || 'unknown',
          createdAt: new Date(),
          templateCount: 0,
          color,
        };

        set((state) => ({
          folders: [...state.folders, newFolder]
        }));

        return newFolder;
      },

      updateFolder: async (id, updates) => {
        const updated = get().folders.find(f => f.id === id);
        if (!updated) throw new Error('Folder not found');

        const updatedFolder = { ...updated, ...updates };

        set((state) => ({
          folders: state.folders.map(f => f.id === id ? updatedFolder : f)
        }));

        return updatedFolder;
      },

      deleteFolder: async (id) => {
        // Move templates from deleted folder to root
        set((state) => ({
          folders: state.folders.filter(f => f.id !== id),
          templates: state.templates.map(t => 
            t.folderId === id ? { ...t, folderId: undefined } : t
          ),
          selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId
        }));
      },

      // Approval operations
      requestApproval: async (templateId) => {
        const template = get().templates.find(t => t.id === templateId);
        if (!template) throw new Error('Template not found');

        await get().updateTemplate(templateId, { status: 'pending_approval' });

        const newRequest: ApprovalRequest = {
          id: `approval_${Date.now()}`,
          templateId,
          templateVersion: template.version,
          requestedBy: get().currentUser?.id || 'unknown',
          requestedAt: new Date(),
          approvers: ['approver1', 'approver2'], // Mock approvers
          status: 'pending',
          changes: 'Template updates requested for approval',
        };

        set((state) => ({
          approvalRequests: [...state.approvalRequests, newRequest],
          pendingApprovalsCount: state.pendingApprovalsCount + 1
        }));
      },

      approveTemplate: async (templateId, comments) => {
        await get().updateTemplate(templateId, { 
          status: 'approved',
          enabled: true,
          approvedBy: get().currentUser?.id,
          approvedAt: new Date()
        });

        set((state) => ({
          approvalRequests: state.approvalRequests.map(req =>
            req.templateId === templateId 
              ? { ...req, status: 'approved' as const, approvedBy: get().currentUser?.id, approvedAt: new Date(), comments }
              : req
          ),
          pendingApprovalsCount: Math.max(0, state.pendingApprovalsCount - 1)
        }));
      },

      rejectTemplate: async (templateId, comments) => {
        await get().updateTemplate(templateId, { status: 'draft' });

        set((state) => ({
          approvalRequests: state.approvalRequests.map(req =>
            req.templateId === templateId 
              ? { ...req, status: 'rejected' as const, comments }
              : req
          ),
          pendingApprovalsCount: Math.max(0, state.pendingApprovalsCount - 1)
        }));
      },

      // Bulk operations
      bulkDeleteTemplates: async (templateIds) => {
        set((state) => ({
          templates: state.templates.filter(t => !templateIds.includes(t.id)),
          selectedTemplateIds: []
        }));
      },

      bulkMoveTemplates: async (templateIds, folderId) => {
        set((state) => ({
          templates: state.templates.map(t =>
            templateIds.includes(t.id) ? { ...t, folderId } : t
          ),
          selectedTemplateIds: []
        }));
      },

      bulkArchiveTemplates: async (templateIds) => {
        set((state) => ({
          templates: state.templates.map(t =>
            templateIds.includes(t.id) ? { ...t, status: 'archived' as const, enabled: false } : t
          ),
          selectedTemplateIds: []
        }));
      },

      // Computed getters
      getFilteredTemplates: () => {
        const { templates, searchQuery, searchFilters, selectedFolderId } = get();
        
        return templates.filter(template => {
          // Folder filter
          if (selectedFolderId !== null && template.folderId !== selectedFolderId) {
            return false;
          }

          // Search query
          if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
              !template.subject.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
          }

          // Status filter
          if (searchFilters.status && searchFilters.status.length > 0 && 
              !searchFilters.status.includes(template.status)) {
            return false;
          }

          // Enabled filter
          if (searchFilters.enabled !== undefined && template.enabled !== searchFilters.enabled) {
            return false;
          }

          // Tags filter
          if (searchFilters.tags && searchFilters.tags.length > 0) {
            const templateTags = template.tags || [];
            if (!searchFilters.tags.some(tag => templateTags.includes(tag))) {
              return false;
            }
          }

          return true;
        });
      },

      getPendingApprovals: () => {
        return get().approvalRequests.filter(req => req.status === 'pending');
      },
    }),
    {
      name: 'template-store',
    }
  )
);