// Reading Session Types
export interface ReadingSession {
  id: string;
  childId: string;
  bookId: string;
  startTime: string;
  endTime?: string;
  startPage: number;
  endPage?: number;
  totalMinutes?: number;
  progressEvents: ProgressEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ProgressEvent {
  pageNumber: number;
  timestamp: string;
  action: 'view' | 'complete';
}

// Reading API Requests
export interface StartReadingRequest {
  bookId: string;
}

export interface StartReadingResponse {
  message: string;
  session: {
    id: string;
    childId: string;
    bookId: string;
    startedAt: string;
    resumePageIndex: number;
    resumed: boolean;
  };
}

export interface TrackProgressRequest {
  sessionId: string;
  pageIndex: number;
}

export interface EndReadingRequest {
  sessionId: string;
}

export interface EndReadingResponse {
  message: string;
  session: {
    id: string;
    minutes: number;
    pagesRead: number;
    endedAt: string;
  };
  limits: {
    dailyLimitMinutes: number;
    consumedTodayMinutes: number;
    remainingMinutes: number;
  };
}
