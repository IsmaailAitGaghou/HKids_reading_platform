export interface Child {
  id: string;
  parentId: string;
  name: string;
  age: number;
  avatar: string;
  ageGroupId: string | null;
  isActive: boolean;
}

export interface CreateChildRequest {
  name: string;
  age: number;
  avatar?: string;
  ageGroupId?: string;
  pin?: string;
}

export interface UpdateChildRequest {
  name?: string;
  age?: number;
  avatar?: string;
  ageGroupId?: string;
  pin?: string;
  isActive?: boolean;
}

export interface Policy {
  childId: string;
  allowedCategoryIds: string[];
  allowedAgeGroupIds: string[];
  dailyLimitMinutes: number;
  schedule: {
    start: string;
    end: string;
  } | null;
}

export interface UpdatePolicyRequest {
  allowedCategoryIds?: string[];
  allowedAgeGroupIds?: string[];
  dailyLimitMinutes?: number;
  schedule?: {
    start: string;
    end: string;
  };
}

export interface ParentAnalyticsTopBook {
  bookId: string;
  title?: string;
  sessions: number;
  minutes: number;
}

export interface ParentAnalytics {
  totalSessions: number;
  totalMinutes: number;
  lastReadAt: string | null;
  topBooks: ParentAnalyticsTopBook[];
}

export interface ChildAnalyticsResponse {
  child: Child;
  analytics: ParentAnalytics;
}

export interface AnalyticsQuery {
  from?: string;
  to?: string;
}
