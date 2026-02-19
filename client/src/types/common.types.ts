// Common API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// File Upload
export interface UploadedFile {
  url: string;
  publicId: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
}

// Date Range
export interface DateRange {
  startDate?: string;
  endDate?: string;
}

// Form State
export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
}
