import { API_ENDPOINTS } from '@/utils/constants';
import { get, post } from '@/api/client';
import type {
  KidsBook,
  KidsBookResponse,
  KidsBookPagesResponse,
  KidsBooksResponse,
  BookResumeData,
  KidsBookResumeResponse,
} from '@/types/book.types';
import type {
  StartReadingRequest,
  StartReadingResponse,
  TrackProgressRequest,
  EndReadingRequest,
  EndReadingResponse,
} from '@/types/reading.types';

/**
 * Get policy-filtered books for kids
 */
export const getKidsBooks = async (): Promise<KidsBooksResponse> => {
  return get<KidsBooksResponse>(API_ENDPOINTS.KIDS.BOOKS);
};

/**
 * Get a single book details (kids view)
 */
export const getKidsBook = async (id: string): Promise<KidsBook> => {
  const response = await get<KidsBookResponse>(API_ENDPOINTS.KIDS.BOOK_BY_ID(id));
  return response.book;
};

/**
 * Get book pages for reading
 */
export const getKidsBookPages = async (id: string): Promise<KidsBookPagesResponse> => {
  return get<KidsBookPagesResponse>(API_ENDPOINTS.KIDS.BOOK_PAGES(id));
};

/**
 * Get resume data (last read position)
 */
export const getBookResume = async (id: string): Promise<BookResumeData> => {
  const response = await get<KidsBookResumeResponse>(API_ENDPOINTS.KIDS.BOOK_RESUME(id));
  return response.resume;
};

/**
 * Start a reading session
 */
export const startReading = async (
  data: StartReadingRequest
): Promise<StartReadingResponse> => {
  return post<StartReadingResponse, StartReadingRequest>(
    API_ENDPOINTS.KIDS.READING_START,
    data
  );
};

/**
 * Track reading progress (page views)
 */
export const trackProgress = async (
  data: TrackProgressRequest
): Promise<{ message: string; session: { id: string; pagesReadCount: number } }> => {
  return post<{ message: string; session: { id: string; pagesReadCount: number } }, TrackProgressRequest>(
    API_ENDPOINTS.KIDS.READING_PROGRESS,
    data
  );
};

/**
 * End a reading session
 */
export const endReading = async (
  data: EndReadingRequest
): Promise<EndReadingResponse> => {
  return post<EndReadingResponse, EndReadingRequest>(
    API_ENDPOINTS.KIDS.READING_END,
    data
  );
};
