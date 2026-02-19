// Admin Analytics Types
export interface AdminOverview {
  totalUsers: number;
  totalChildren: number;
  totalBooks: number;
  totalCategories: number;
  totalAgeGroups: number;
  totalReadingSessions: number;
  totalReadingMinutes: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  activeUsersThisMonth: number;
}

export interface ReadingAnalytics {
  period: {
    startDate: string;
    endDate: string;
  };
  totalSessions: number;
  totalMinutes: number;
  totalUniqueReaders: number;
  averageSessionMinutes: number;
  dailyStats: DailyReadingStats[];
  peakReadingHours: HourlyStats[];
}

export interface DailyReadingStats {
  date: string;
  sessions: number;
  minutes: number;
  uniqueReaders: number;
  averageMinutesPerSession: number;
}

export interface HourlyStats {
  hour: number;
  sessions: number;
  percentage: number;
}

export interface TopBooksAnalytics {
  period: {
    startDate: string;
    endDate: string;
  };
  topBooks: TopBookStats[];
}

export interface TopBookStats {
  bookId: string;
  bookTitle: string;
  author: string;
  coverImage: string;
  totalSessions: number;
  totalMinutes: number;
  uniqueReaders: number;
  averageCompletionRate: number;
  categoryNames: string[];
  ageGroupNames: string[];
}

// Analytics Query
export interface AnalyticsRangeQuery {
  startDate?: string;
  endDate?: string;
  limit?: number;
}
