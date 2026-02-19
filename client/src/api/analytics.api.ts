import { API_ENDPOINTS } from '@/utils/constants';
import { get } from '@/api/client';

// Analytics API types
export interface AdminOverviewAnalytics {
  overview: {
    totalParents: number;
    totalChildren: number;
    totalBooks: number;
    publishedBooks: number;
    totalSessions: number;
    totalMinutesRead: number;
  };
}

export interface ReadingAnalytics {
  reading: {
    totalSessions: number;
    totalMinutes: number;
    averageSessionMinutes: number;
    dailyStats: Array<{
      date: string;
      sessions: number;
      minutes: number;
    }>;
  };
}

export interface TopBooksAnalytics {
  topBooks: Array<{
    bookId: string;
    title: string;
    coverImageUrl: string | null;
    sessions: number;
    totalMinutes: number;
    uniqueChildren: number;
  }>;
}

/**
 * Get admin overview analytics (total counts and stats)
 */
export const getAdminOverview = async (): Promise<AdminOverviewAnalytics> => {
  const response = await get<AdminOverviewAnalytics>(API_ENDPOINTS.ANALYTICS.OVERVIEW);
  return response;
};

/**
 * Get reading analytics with optional date range
 */
export const getReadingAnalytics = async (params?: {
  from?: string;
  to?: string;
}): Promise<ReadingAnalytics> => {
  const response = await get<ReadingAnalytics>(API_ENDPOINTS.ANALYTICS.READING, {
    params,
  });
  return response;
};

/**
 * Get top books analytics
 */
export const getTopBooks = async (params?: {
  from?: string;
  to?: string;
  limit?: number;
}): Promise<TopBooksAnalytics> => {
  const response = await get<TopBooksAnalytics>(API_ENDPOINTS.ANALYTICS.TOP_BOOKS, {
    params,
  });
  return response;
};
