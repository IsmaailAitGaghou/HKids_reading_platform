import { API_ENDPOINTS } from '@/utils/constants';
import { get, post, patch, del } from '@/api/client';
import type {
  Book,
  BookWithPages,
  CreateBookRequest,
  UpdateBookRequest,
  ReviewBookRequest,
  ReorderPagesRequest,
  BookFilters,
} from '@/types/book.types';

// Response type matching server
interface BooksListResponse {
  total: number;
  books: Book[];
}

/**
 * List all books (Admin only)
 */
export const listBooks = async (filters?: BookFilters): Promise<BooksListResponse> => {
  const response = await get<BooksListResponse>(API_ENDPOINTS.BOOKS.BASE, {
    params: filters,
  });
  return response;
};

/**
 * Get a single book by ID (Admin only)
 */
export const getBookById = async (id: string): Promise<BookWithPages> => {
  const response = await get<{ book: BookWithPages }>(API_ENDPOINTS.BOOKS.BY_ID(id));
  return response.book;
};

/**
 * Create a new book (Admin only)
 */
export const createBook = async (data: CreateBookRequest): Promise<Book> => {
  const coverImageUrl = data.coverImageUrl?.trim();
  const summary = data.summary?.trim();

  const payload: Record<string, unknown> = {
    title: data.title.trim(),
    ageGroupId: data.ageGroupId.trim(),
    categoryIds: data.categoryIds,
    pages: data.pages,
    tags: data.tags,
    visibility: data.visibility,
  };

  if (summary) {
    payload.summary = summary;
  }

  if (coverImageUrl) {
    payload.coverImageUrl = coverImageUrl;
  }

  const response = await post<{ book: Book }, Record<string, unknown>>(
    API_ENDPOINTS.BOOKS.BASE,
    payload
  );
  return response.book;
};

/**
 * Update a book (Admin only)
 */
export const updateBook = async (id: string, data: UpdateBookRequest): Promise<Book> => {
  const payload: Record<string, unknown> = {};

  if (typeof data.title === 'string') payload.title = data.title.trim();
  if (typeof data.summary === 'string') payload.summary = data.summary.trim();
  if (typeof data.coverImageUrl === 'string') payload.coverImageUrl = data.coverImageUrl.trim();
  if (typeof data.ageGroupId === 'string') payload.ageGroupId = data.ageGroupId.trim();
  if (Array.isArray(data.categoryIds)) payload.categoryIds = data.categoryIds;
  if (Array.isArray(data.pages)) payload.pages = data.pages;
  if (Array.isArray(data.tags)) payload.tags = data.tags;
  if (typeof data.visibility === 'string') payload.visibility = data.visibility;
  if (typeof data.status === 'string') payload.status = data.status;

  const response = await patch<{ book: Book }, Record<string, unknown>>(
    API_ENDPOINTS.BOOKS.BY_ID(id),
    payload
  );
  return response.book;
};

/**
 * Review a book - change status (Admin only)
 */
export const reviewBook = async (id: string, data: ReviewBookRequest): Promise<Book> => {
  const response = await patch<{ book: Book }, ReviewBookRequest>(
    API_ENDPOINTS.BOOKS.REVIEW(id),
    data
  );
  return response.book;
};

/**
 * Reorder book pages (Admin only)
 */
export const reorderBookPages = async (
  id: string,
  data: ReorderPagesRequest
): Promise<Book> => {
  const response = await patch<{ book: Book }, ReorderPagesRequest>(
    API_ENDPOINTS.BOOKS.REORDER_PAGES(id),
    data
  );
  return response.book;
};

/**
 * Publish a book (Admin only)
 */
export const publishBook = async (id: string): Promise<Book> => {
  const response = await patch<{ book: Book }>(API_ENDPOINTS.BOOKS.PUBLISH(id));
  return response.book;
};

/**
 * Unpublish a book (Admin only)
 */
export const unpublishBook = async (id: string): Promise<Book> => {
  const response = await patch<{ book: Book }>(API_ENDPOINTS.BOOKS.UNPUBLISH(id));
  return response.book;
};

/**
 * Delete a book (Admin only)
 */
export const deleteBook = async (id: string): Promise<void> => {
  await del(API_ENDPOINTS.BOOKS.BY_ID(id));
};
