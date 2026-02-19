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
  startPage?: number;
}

export interface StartReadingResponse {
  sessionId: string;
  bookId: string;
  startTime: string;
  startPage: number;
  remainingMinutesToday?: number;
}

export interface TrackProgressRequest {
  sessionId: string;
  pageNumber: number;
  action: 'view' | 'complete';
}

export interface EndReadingRequest {
  sessionId: string;
  endPage: number;
}

export interface EndReadingResponse {
  sessionId: string;
  totalMinutes: number;
  pagesRead: number;
  completionPercentage: number;
}
