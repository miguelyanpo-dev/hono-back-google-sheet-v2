// Type definitions for the application

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type?: string;
  scope?: string;
}

export interface CalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string;
  created?: string;
  updated?: string;
}

export interface CreateEventRequest {
  accessToken: string;
  refreshToken?: string;
  calendarId?: string;
  startDateTime: string;
  endDateTime?: string;
  summary?: string;
  description?: string;
  location?: string;
  attendees?: Array<{ email: string }>;
}

export interface UpdateEventRequest {
  calendarId?: string;
  summary?: string;
  description?: string;
  location?: string;
  startDateTime?: string;
  endDateTime?: string;
  attendees?: Array<{ email: string }>;
}

export interface CheckAvailabilityRequest {
  calendarId?: string;
  startDateTime: string;
  endDateTime?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

export interface CalendarListItem {
  id: string;
  summary: string;
  description?: string;
  timeZone?: string;
  primary?: boolean;
  accessRole?: string;
}

export interface EventListResponse {
  success: boolean;
  events: CalendarEvent[];
}

export interface CalendarListResponse {
  success: boolean;
  items: CalendarListItem[];
}

export interface AvailabilityResponse {
  success: boolean;
  available: boolean;
  conflictingEvents: CalendarEvent[];
}
