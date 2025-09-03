export interface User {
    id: string;
    email: string;
    name: string;
    domain: string;
    groups: string[];
    permissions: {
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canApprove: boolean;
        canBulkOperation: boolean;
    };
    avatar?: string;
}

export type TemplateStatus = 'draft' | 'pending_approval' | 'approved' | 'archived';

export interface EmailTemplate {
    id: string;
    domain: string;
    folderId?: string;
    name: string;
    subject: string;
    htmlContent: string;
    plainTextContent: string;
    variables: string[];
    status: TemplateStatus;
    enabled: boolean;
    version: number;
    createdBy: string;
    createdAt: Date;
    lastModifiedBy: string;
    lastModifiedAt: Date;
    approvedBy?: string;
    approvedAt?: Date;
    tags?: string[];
    sharedComponents?: string[];
}

export interface TemplateVersion {
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

export interface Folder {
    id: string;
    domain: string;
    name: string;
    parentId?: string;
    createdBy: string;
    createdAt: Date;
    templateCount: number;
    color?: string;
}

export interface ReusableComponent {
    id: string;
    domain: string;
    name: string;
    type: 'header' | 'footer' | 'button' | 'section' | 'custom';
    htmlContent: string;
    cssStyles?: string;
    variables?: string[];
    isGlobal: boolean;
}

export interface ApprovalRequest {
    id: string;
    templateId: string;
    templateVersion: number;
    requestedBy: string;
    requestedAt: Date;
    approvers: string[];
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: Date;
    comments?: string;
    changes: string;
}

export interface AuditLog {
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

export interface SearchFilters {
    query?: string;
    status?: TemplateStatus[];
    folderId?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
    enabled?: boolean;
    tags?: string[];
}

export interface BulkOperationResult {
    succeeded: string[];
    failed: { id: string; reason: string }[];
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: {
        timestamp: string;
        requestId: string;
        pagination?: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}

export interface ApiError {
    error: {
        code: string;
        message: string;
        details?: string;
    };
    timestamp: string;
}

// WebSocket event types
export interface WebSocketEvent<T = any> {
    type: string;
    data: T;
    timestamp: string;
}

export interface TemplateLockEvent {
    templateId: string;
    userId: string;
    userName: string;
    action: 'lock' | 'unlock';
}

export interface TemplateUpdateEvent {
    templateId: string;
    userId: string;
    changes: string[];
    timestamp: string;
}

export interface UserPresenceEvent {
    userId: string;
    userName: string;
    status: 'online' | 'offline';
    currentTemplate?: string;
} 