import { API_ENDPOINTS } from '@/utils/constants';
import { get, post } from '@/api/client';
import type {
  KidsBook,
  BookWithPages,
  BookPage,
  BookResumeData,
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
export const getKidsBooks = async (): Promise<KidsBook[]> => {
  const response = await get<KidsBook[]>(API_ENDPOINTS.KIDS.BOOKS);
  return response.data;
};

/**
 * Get a single book details (kids view)
 */
export const getKidsBook = async (id: string): Promise<BookWithPages> => {
  const response = await get<BookWithPages>(API_ENDPOINTS.KIDS.BOOK_BY_ID(id));
  return response.data;
};

/**
 * Get book pages for reading
 */
export const getKidsBookPages = async (id: string): Promise<BookPage[]> => {
  const response = await get<BookPage[]>(API_ENDPOINTS.KIDS.BOOK_PAGES(id));
  return response.data;
};

/**
 * Get resume data (last read position)
 */
export const getBookResume = async (id: string): Promise<BookResumeData> => {
  const response = await get<BookResumeData>(API_ENDPOINTS.KIDS.BOOK_RESUME(id));
  return response.data;
};

/**
 * Start a reading session
 */
export const startReading = async (
  data: StartReadingRequest
): Promise<StartReadingResponse> => {
  const response = await post<StartReadingResponse, StartReadingRequest>(
    API_ENDPOINTS.KIDS.READING_START,
    data
  );
  return response.data;
};

/**
 * Track reading progress (page views)
 */
export const trackProgress = async (data: TrackProgressRequest): Promise<void> => {
  await post<void, TrackProgressRequest>(
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
  const response = await post<EndReadingResponse, EndReadingRequest>(
    API_ENDPOINTS.KIDS.READING_END,
    data
  );
  return response.data;
};
