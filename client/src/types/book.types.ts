import type { BookStatus } from '@/utils/constants';

export type BookContentType = 'structured' | 'pdf';

// Book Types
export interface Book {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  coverImageUrl: string;
  contentType?: BookContentType;
  pdfUrl?: string;
  pdfPageCount?: number;
  pageCount?: number;
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
interface BaseCreateBookRequest {
  title: string;
  summary?: string;
  coverImageUrl?: string;
  ageGroupId: string;
  categoryIds: string[];
  tags: string[];
  visibility: 'private' | 'public';
}

export interface CreateStructuredBookRequest extends BaseCreateBookRequest {
  contentType?: 'structured';
  pages: Array<{
    pageNumber: number;
    title?: string;
    text: string;
    imageUrl?: string;
    narrationUrl?: string;
  }>;
}

export interface CreatePdfBookRequest extends BaseCreateBookRequest {
  contentType: 'pdf';
  pdfUrl: string;
  pdfPageCount: number;
}

export type CreateBookRequest = CreateStructuredBookRequest | CreatePdfBookRequest;

export interface UpdateBookRequest {
  title?: string;
  summary?: string;
  coverImageUrl?: string;
  ageGroupId?: string;
  categoryIds?: string[];
  contentType?: BookContentType;
  pages?: Array<{
    pageNumber: number;
    title?: string;
    text: string;
    imageUrl?: string;
    narrationUrl?: string;
  }>;
  pdfUrl?: string;
  pdfPageCount?: number;
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
  summary: string;
  coverImageUrl: string;
  pageCount: number;
  contentType: BookContentType;
  pdfUrl?: string;
  pdfPageCount?: number;
  categoryIds: string[];
}

export interface KidsBooksResponse {
  total: number;
  remainingMinutes: number;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  books: KidsBook[];
}

export interface KidsBookResponse {
  book: KidsBook;
}

export interface KidsBookPagesResponse {
  book: {
    id: string;
    title: string;
    summary: string;
    pageCount: number;
    contentType: BookContentType;
    pdfUrl?: string;
    pdfPageCount?: number;
  };
  pages: BookPage[];
}

export interface BookResumeData {
  hasProgress: boolean;
  pageIndex: number;
  sessionId: string | null;
  hasActiveSession: boolean;
  lastActivityAt: string | null;
}

export interface KidsBookResumeResponse {
  resume: BookResumeData;
}
