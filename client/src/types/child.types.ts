// Child Management Types
export interface ChildProfile {
  id: string;
  name: string;
  email: string;
  pin: string;
  avatar?: string;
  dateOfBirth?: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChildRequest {
  name: string;
  email: string;
  pin: string;
  avatar?: string;
  dateOfBirth?: string;
}

export interface UpdateChildRequest {
  name?: string;
  email?: string;
  pin?: string;
  avatar?: string;
  dateOfBirth?: string;
}

// Child Policy Types
export interface ChildPolicy {
  id: string;
  childId: string;
  allowedCategoryIds: string[];
  allowedAgeGroupIds: string[];
  dailyLimitMinutes?: number;
  scheduleStart?: string; // HH:mm format
  scheduleEnd?: string; // HH:mm format
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePolicyRequest {
  allowedCategoryIds?: string[];
  allowedAgeGroupIds?: string[];
  dailyLimitMinutes?: number;
  scheduleStart?: string;
  scheduleEnd?: string;
}

// Child Analytics Types
export interface ChildAnalytics {
  childId: string;
  childName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalSessions: number;
  totalMinutes: number;
  totalBooksRead: number;
  averageSessionMinutes: number;
  dailyActivity: DailyActivity[];
  topBooks: TopBook[];
  categoryDistribution: CategoryDistribution[];
}

export interface DailyActivity {
  date: string;
  sessions: number;
  minutes: number;
  booksRead: number;
}

export interface TopBook {
  bookId: string;
  bookTitle: string;
  coverImage: string;
  sessions: number;
  totalMinutes: number;
  completionPercentage: number;
}

export interface CategoryDistribution {
  categoryId: string;
  categoryName: string;
  sessions: number;
  minutes: number;
  percentage: number;
}

// Analytics Query
export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}
