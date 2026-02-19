import { API_ENDPOINTS } from '@/utils/constants';
import { get, post, patch, del } from '@/api/client';

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CategoriesResponse {
  total: number;
  categories: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

/**
 * List all categories (Admin only)
 */
export const listCategories = async (params?: {
  isActive?: boolean;
}): Promise<CategoriesResponse> => {
  const response = await get<CategoriesResponse>(API_ENDPOINTS.CATEGORIES.BASE, {
    params,
  });
  return response;
};

/**
 * List public categories (available to all)
 */
export const listPublicCategories = async (): Promise<CategoriesResponse> => {
  const response = await get<CategoriesResponse>(API_ENDPOINTS.CATEGORIES.PUBLIC);
  return response;
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await get<{ category: Category }>(API_ENDPOINTS.CATEGORIES.BY_ID(id));
  return response.category;
};

/**
 * Create a new category (Admin only)
 */
export const createCategory = async (
  data: CreateCategoryRequest
): Promise<Category> => {
  const response = await post<{ category: Category }, CreateCategoryRequest>(
    API_ENDPOINTS.CATEGORIES.BASE,
    data
  );
  return response.category;
};

/**
 * Update a category (Admin only)
 */
export const updateCategory = async (
  id: string,
  data: UpdateCategoryRequest
): Promise<Category> => {
  const response = await patch<{ category: Category }, UpdateCategoryRequest>(
    API_ENDPOINTS.CATEGORIES.BY_ID(id),
    data
  );
  return response.category;
};

/**
 * Delete a category (Admin only)
 */
export const deleteCategory = async (id: string): Promise<void> => {
  await del(API_ENDPOINTS.CATEGORIES.BY_ID(id));
};
