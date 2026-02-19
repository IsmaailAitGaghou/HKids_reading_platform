// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// User Roles
export const ROLES = {
  ADMIN: 'ADMIN',
  PARENT: 'PARENT',
  CHILD: 'CHILD',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Auth Token Keys
export const TOKEN_KEY = 'hkids_auth_token';
export const USER_KEY = 'hkids_user';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    CHILD_PIN: '/auth/child/pin',
    ME: '/auth/me',
  },
  // Books (Admin)
  BOOKS: {
    BASE: '/books',
    BY_ID: (id: string) => `/books/${id}`,
    REVIEW: (id: string) => `/books/${id}/review`,
    REORDER_PAGES: (id: string) => `/books/${id}/pages/reorder`,
    PUBLISH: (id: string) => `/books/${id}/publish`,
    UNPUBLISH: (id: string) => `/books/${id}/unpublish`,
  },
  // Categories
  CATEGORIES: {
    BASE: '/categories',
    PUBLIC: '/categories/public',
    BY_ID: (id: string) => `/categories/${id}`,
    CREATE: '/categories/create',
    EDIT: (id: string) => `/categories/${id}/edit`,
  },
  // Age Groups
  AGE_GROUPS: {
    BASE: '/age-groups',
    PUBLIC: '/age-groups/public',
    BY_ID: (id: string) => `/age-groups/${id}`,
  },
  // Parent
  PARENT: {
    CHILDREN: '/parent/children',
    CHILD_BY_ID: (id: string) => `/parent/children/${id}`,
    CHILD_POLICY: (id: string) => `/parent/children/${id}/policy`,
    CHILD_ANALYTICS: (id: string) => `/parent/children/${id}/analytics`,
  },
  // Kids
  KIDS: {
    BOOKS: '/kids/books',
    BOOK_BY_ID: (id: string) => `/kids/books/${id}`,
    BOOK_PAGES: (id: string) => `/kids/books/${id}/pages`,
    BOOK_RESUME: (id: string) => `/kids/books/${id}/resume`,
    READING_START: '/kids/reading/start',
    READING_PROGRESS: '/kids/reading/progress',
    READING_END: '/kids/reading/end',
  },
  // Analytics (Admin)
  ANALYTICS: {
    OVERVIEW: '/admin/analytics/overview',
    READING: '/admin/analytics/reading',
    TOP_BOOKS: '/admin/analytics/books/top',
  },
  // Uploads
  UPLOADS: {
    IMAGE: '/uploads/image',
    FILE: '/uploads/file',
  },
} as const;

// Route Paths
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHILD_LOGIN: '/child-login',
  
  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    BOOKS: '/admin/books',
    BOOK_CREATE: '/admin/books/create',
    BOOK_EDIT: (id: string) => `/admin/books/${id}/edit`,
    BOOK_VIEW: (id: string) => `/admin/books/${id}`,
    CATEGORIES: '/admin/categories',
    AGE_GROUPS: '/admin/age-groups',
    ANALYTICS: '/admin/analytics',
    READING_STATS: '/admin/analytics/reading',
  },
  
  // Parent
  PARENT: {
    PORTAL: '/parent/portal',
    DASHBOARD: '/parent/portal',
    CHILDREN: '/parent/children',
    CHILD_CREATE: '/parent/children/create',
    CHILD_EDIT: (id: string) => `/parent/children/${id}/edit`,
    CHILD_VIEW: (id: string) => `/parent/children/${id}`,
    CHILD_POLICY: (id: string) => `/parent/children/${id}/policy`,
    CHILD_ANALYTICS: (id: string) => `/parent/children/${id}/analytics`,
  },
  
  // Kids
  KIDS: {
    LIBRARY: '/kids/library',
    BOOK_VIEW: (id: string) => `/kids/books/${id}`,
    READING: (id: string) => `/kids/read/${id}`,
  },
} as const;

// Query Keys for React Query
export const QUERY_KEYS = {
  AUTH: {
    CURRENT_USER: ['auth', 'currentUser'],
  },
  BOOKS: {
    LIST: (filters?: object) => ['books', 'list', filters],
    DETAIL: (id: string) => ['books', 'detail', id],
  },
  CATEGORIES: {
    LIST: (filters?: object) => ['categories', 'list', filters],
    PUBLIC: ['categories', 'public'],
    DETAIL: (id: string) => ['categories', 'detail', id],
  },
  AGE_GROUPS: {
    LIST: ['ageGroups', 'list'],
    PUBLIC: ['ageGroups', 'public'],
    DETAIL: (id: string) => ['ageGroups', 'detail', id],
  },
  PARENT: {
    CHILDREN: ['parent', 'children'],
    CHILD: (id: string) => ['parent', 'child', id],
    CHILD_POLICY: (id: string) => ['parent', 'child', id, 'policy'],
    CHILD_ANALYTICS: (id: string, filters?: object) => ['parent', 'child', id, 'analytics', filters],
  },
  KIDS: {
    BOOKS: ['kids', 'books'],
    BOOK: (id: string) => ['kids', 'book', id],
    BOOK_PAGES: (id: string) => ['kids', 'book', id, 'pages'],
    BOOK_RESUME: (id: string) => ['kids', 'book', id, 'resume'],
  },
  ANALYTICS: {
    OVERVIEW: ['analytics', 'overview'],
    READING: (filters?: object) => ['analytics', 'reading', filters],
    TOP_BOOKS: (filters?: object) => ['analytics', 'topBooks', filters],
  },
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Book Status
export const BOOK_STATUS = {
  DRAFT: 'DRAFT',
  REVIEW: 'REVIEW',
  PUBLISHED: 'PUBLISHED',
} as const;

export type BookStatus = typeof BOOK_STATUS[keyof typeof BOOK_STATUS];
