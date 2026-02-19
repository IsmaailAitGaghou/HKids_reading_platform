import type { BookStatus } from '@/utils/constants';

// Book Types
export interface Book {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  coverImageUrl: string;
  categoryIds: string[];
  ageGroupId?: string;
  ageGroupIds?: string[];
  tags?: string[];
  visibility?: 'private' | 'public';
  isApproved?: boolean;
  status: BookStatus | 'draft' | 'published' | 'archived';
  totalPages: number;
  reviewNotes?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookPage {
  id?: string;
  bookId?: string;
  pageNumber: number;
  title?: string;
  imageUrl?: string;
  narrationUrl?: string;
  text: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookWithPages extends Book {
  pages: BookPage[];
}

// Admin Book Requests
export interface CreateBookRequest {
  title: string;
  summary?: string;
  coverImageUrl?: string;
  ageGroupId: string;
  categoryIds: string[];
  pages: Array<{
    pageNumber: number;
    title?: string;
    text: string;
    imageUrl?: string;
    narrationUrl?: string;
  }>;
  tags: string[];
  visibility: 'private' | 'public';
}

export interface UpdateBookRequest {
  title?: string;
  summary?: string;
  coverImageUrl?: string;
  ageGroupId?: string;
  categoryIds?: string[];
  pages?: Array<{
    pageNumber: number;
    title?: string;
    text: string;
    imageUrl?: string;
    narrationUrl?: string;
  }>;
  tags?: string[];
  visibility?: 'private' | 'public';
  status?: 'draft' | 'published' | 'archived';
}

export interface ReviewBookRequest {
  status: 'REVIEW' | 'PUBLISHED' | 'DRAFT';
  reviewNotes?: string;
}

export interface ReorderPagesRequest {
  pageOrders: Array<{
    pageId: string;
    order: number;
  }>;
}

// Book Query Filters
export interface BookFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: BookStatus | 'draft' | 'published' | 'archived';
  categoryId?: string;
  ageGroupId?: string;
  sortBy?: 'title' | 'createdAt' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
}

// Kids Book Types (policy-filtered)
export interface KidsBook {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  totalPages: number;
  lastReadPage?: number;
  progressPercentage?: number;
}

export interface BookResumeData {
  bookId: string;
  lastPageNumber: number;
  lastReadAt: string;
  progressPercentage: number;
  totalTimeMinutes: number;
}
