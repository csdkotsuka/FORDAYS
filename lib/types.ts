export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: string; // ISO string
  end: string;   // ISO string
  allDay?: boolean;
  url?: string;
  color?: string;
  source?: 'google' | 'mock';
}

export interface EventsApiResponse {
  events: CalendarEvent[];
  source: 'google' | 'mock';
  message?: string;
}
