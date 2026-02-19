// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'order' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
