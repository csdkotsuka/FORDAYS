import { CalendarEvent } from './types';
import { format } from 'date-fns';

/**
 * Format Date to iCalendar compact date string (YYYYMMDDTHHmmssZ)
 */
function formatToIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatToIcsAllDayDate(date: Date): string {
  return format(date, 'yyyyMMdd');
}

/**
 * Generate .ics file content for an event
 */
export function generateIcsContent(event: CalendarEvent): string {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const uid = event.id ? `${event.id}@fordays-calendar` : `${Date.now()}@fordays-calendar`;
  const dtstamp = formatToIcsDate(new Date());

  let dtStartLine = '';
  let dtEndLine = '';

  if (event.allDay) {
    dtStartLine = `DTSTART;VALUE=DATE:${formatToIcsAllDayDate(startDate)}`;
    dtEndLine = `DTEND;VALUE=DATE:${formatToIcsAllDayDate(endDate)}`;
  } else {
    dtStartLine = `DTSTART:${formatToIcsDate(startDate)}`;
    dtEndLine = `DTEND:${formatToIcsDate(endDate)}`;
  }

  const escapeIcs = (str?: string) => {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FORDAYS Calendar//JP',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    dtStartLine,
    dtEndLine,
    `SUMMARY:${escapeIcs(event.title)}`,
    event.description ? `DESCRIPTION:${escapeIcs(event.description)}` : '',
    event.location ? `LOCATION:${escapeIcs(event.location)}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.join('\r\n');
}

/**
 * Trigger .ics download for iOS/Android/Mac/PC default calendar app
 */
export function downloadIcsFile(event: CalendarEvent): void {
  const icsContent = generateIcsContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  // Use a clean filename
  const safeTitle = event.title.replace(/[^\w\s\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/g, '_');
  link.download = `${safeTitle || 'event'}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generate Google Calendar web add link
 */
export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  const startStr = event.allDay
    ? format(startDate, 'yyyyMMdd')
    : formatToIcsDate(startDate);
  const endStr = event.allDay
    ? format(endDate, 'yyyyMMdd')
    : formatToIcsDate(endDate);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startStr}/${endStr}`,
  });

  if (event.description) {
    params.set('details', event.description);
  }
  if (event.location) {
    params.set('location', event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate .ics file content for ALL events in the calendar
 */
export function generateAllEventsIcsContent(
  events: CalendarEvent[],
  calName: string = 'フォーデイズ予定表'
): string {
  const dtstamp = formatToIcsDate(new Date());

  const escapeIcs = (str?: string) => {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const vevents = events.map((event, idx) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const uid = event.id ? `${event.id}@fordays-calendar` : `event-${Date.now()}-${idx}@fordays-calendar`;

    let dtStartLine = '';
    let dtEndLine = '';

    if (event.allDay) {
      dtStartLine = `DTSTART;VALUE=DATE:${formatToIcsAllDayDate(startDate)}`;
      dtEndLine = `DTEND;VALUE=DATE:${formatToIcsAllDayDate(endDate)}`;
    } else {
      dtStartLine = `DTSTART:${formatToIcsDate(startDate)}`;
      dtEndLine = `DTEND:${formatToIcsDate(endDate)}`;
    }

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      dtStartLine,
      dtEndLine,
      `SUMMARY:${escapeIcs(event.title)}`,
      event.description ? `DESCRIPTION:${escapeIcs(event.description)}` : '',
      event.location ? `LOCATION:${escapeIcs(event.location)}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FORDAYS Calendar//JP',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calName}`,
    'X-WR-TIMEZONE:Asia/Tokyo',
    ...vevents,
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

/**
 * Trigger download of all events into a single .ics file (for iPhone/Android/Mac/PC calendar import)
 */
export function downloadAllEventsIcsFile(
  events: CalendarEvent[],
  filename: string = 'fordays-all-events.ics'
): void {
  const icsContent = generateAllEventsIcsContent(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

