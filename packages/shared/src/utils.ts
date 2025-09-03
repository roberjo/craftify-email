// Date utilities
export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const isToday = (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    );
};

export const isYesterday = (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear()
    );
};

// String utilities
export const truncate = (str: string, length: number): string => {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
};

export const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (str: string): string => {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

export const unique = <T>(array: T[]): T[] => {
    return Array.from(new Set(array));
};

export const groupBy = <T, K extends string | number>(
    array: T[],
    key: (item: T) => K
): Record<K, T[]> => {
    return array.reduce((groups, item) => {
        const groupKey = key(item);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {} as Record<K, T[]>);
};

// Validation utilities
export const createApiResponse = <T>(
    data: T,
    meta?: Record<string, any>
): { success: true; data: T; meta?: Record<string, any> } => {
    return {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: generateRequestId(),
            ...meta,
        },
    };
};

export const createApiError = (
    code: string,
    message: string,
    details?: string
): { success: false; error: { code: string; message: string; details?: string }; timestamp: string } => {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
        timestamp: new Date().toISOString(),
    };
};

// ID generation
export const generateId = (): string => {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateRequestId = (): string => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Permission utilities
export const hasPermission = (
    userPermissions: Record<string, boolean>,
    permission: string
): boolean => {
    return userPermissions[permission] === true;
};

export const checkDomainAccess = (
    userDomain: string,
    resourceDomain: string
): boolean => {
    return userDomain === resourceDomain;
};

// Template utilities
export const extractVariables = (content: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
        variables.push(match[1].trim());
    }

    return unique(variables);
};

export const replaceVariables = (
    content: string,
    variables: Record<string, string>
): string => {
    return content.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        return variables[key.trim()] || match;
    });
};

// Color utilities
export const generateColor = (seed: string): string => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
};

// File utilities
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// URL utilities
export const buildUrl = (base: string, params: Record<string, any>): string => {
    const url = new URL(base);

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
        }
    });

    return url.toString();
};

export const parseQueryParams = (queryString: string): Record<string, string> => {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(queryString);

    searchParams.forEach((value, key) => {
        params[key] = value;
    });

    return params;
};

// Error utilities
export const isApiError = (error: any): error is { error: { code: string; message: string } } => {
    return error && typeof error === 'object' && 'error' in error && 'code' in error.error;
};

export const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (isApiError(error)) return error.error.message;
    return 'An unknown error occurred';
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}; 