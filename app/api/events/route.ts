import { NextResponse } from 'next/server';
import ical from 'node-ical';
import { CalendarEvent, EventsApiResponse } from '@/lib/types';
import { getMockEvents } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

/**
 * Normalize and convert user-provided Google Calendar URLs to proper .ics endpoint
 */
function normalizeGoogleCalendarUrl(inputUrl: string): string {
  let url = inputUrl.trim();

  // If user provided just an email or calendar ID (e.g. xxx@group.calendar.google.com)
  if (url.includes('@') && !url.startsWith('http')) {
    return `https://calendar.google.com/calendar/ical/${encodeURIComponent(url)}/public/basic.ics`;
  }

  try {
    const parsed = new URL(url);

    // If already an .ics URL
    if (parsed.pathname.endsWith('.ics')) {
      return url;
    }

    // If user provided embed URL: https://calendar.google.com/calendar/embed?src=xxx
    const srcParam = parsed.searchParams.get('src');
    if (srcParam) {
      return `https://calendar.google.com/calendar/ical/${encodeURIComponent(srcParam)}/public/basic.ics`;
    }

    // If user provided cid URL: https://calendar.google.com/calendar/u/0?cid=xxx
    const cidParam = parsed.searchParams.get('cid');
    if (cidParam) {
      // Decode base64 cid if needed, or use directly
      let calId = cidParam;
      try {
        if (!cidParam.includes('@') && cidParam.length > 20) {
          const decoded = Buffer.from(cidParam, 'base64').toString('utf-8');
          if (decoded.includes('@')) {
            calId = decoded;
          }
        }
      } catch (e) {
        // use raw cidParam
      }
      return `https://calendar.google.com/calendar/ical/${encodeURIComponent(calId)}/public/basic.ics`;
    }
  } catch (e) {
    // Return original if parsing fails
  }

  return url;
}

export async function GET() {
  const rawIcalUrl = process.env.GOOGLE_CALENDAR_ICAL_URL;

  if (!rawIcalUrl) {
    return NextResponse.json<EventsApiResponse>({
      events: getMockEvents(),
      source: 'mock',
      message: 'GOOGLE_CALENDAR_ICAL_URL が未設定のため、サンプルデータを表示しています。',
    });
  }

  const icalUrl = normalizeGoogleCalendarUrl(rawIcalUrl);

  try {
    const res = await fetch(icalUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FORDAYS-Calendar/1.0)',
        'Accept': 'text/calendar, application/xhtml+xml, text/html, */*',
      },
    });

    if (!res.ok) {
      throw new Error(`Googleサーバーからの応答エラー: HTTP ${res.status} (${res.statusText})`);
    }

    const icsText = await res.text();

    // Check if the response is actually HTML instead of iCalendar
    const trimmed = icsText.trim();
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.includes('<body')) {
      return NextResponse.json<EventsApiResponse>({
        events: getMockEvents(),
        source: 'mock',
        message: '設定されたURLからHTMLが返却されました。Googleカレンダーの「設定と共有」>「カレンダーの統合」にある「iCal 形式の非公開URL（basic.ics）」を設定してください。',
      });
    }

    if (!icsText.includes('BEGIN:VCALENDAR')) {
      return NextResponse.json<EventsApiResponse>({
        events: getMockEvents(),
        source: 'mock',
        message: '有効なカレンダーデータ(iCal)が見つかりませんでした。URLを確認してください。',
      });
    }

    const parsedData = ical.sync.parseICS(icsText);
    const events: CalendarEvent[] = [];
    const now = new Date();
    // Expand recurring events for the window: 3 months past to 12 months future
    const rangeStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 12, 1);

    for (const key in parsedData) {
      const rawItem = parsedData[key];
      if (!rawItem) continue;

      const itemType = (rawItem.type || '').toUpperCase();
      if (itemType !== 'VEVENT') continue;

      const item = rawItem as any;

      // Handle normal event
      if (item.start) {
        const startDate = new Date(item.start);
        const endDate = item.end ? new Date(item.end) : startDate;

        const isAllDay = item.datetype === 'date' ||
          (startDate.getHours() === 0 && startDate.getMinutes() === 0 &&
           endDate.getHours() === 0 && endDate.getMinutes() === 0 &&
           (endDate.getTime() - startDate.getTime()) >= 86400000);

        let eventTitle = item.summary || '(タイトルなし)';
        if (eventTitle === 'Busy') {
          eventTitle = 'FORDAYS 予定 (詳細非公開)';
        }

        events.push({
          id: item.uid || key,
          title: eventTitle,
          description: item.description || '',
          location: item.location || '',
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          allDay: isAllDay,
          url: item.url || '',
          source: 'google',
        });
      }

      // Handle recurring event instances (RRULE)
      if (item.rrule) {
        try {
          const dates = item.rrule.between(rangeStart, rangeEnd, true);
          const duration = item.end && item.start
            ? new Date(item.end).getTime() - new Date(item.start).getTime()
            : 3600000;

          dates.forEach((date: Date, index: number) => {
            const recurStart = new Date(date);
            const recurEnd = new Date(recurStart.getTime() + duration);

            events.push({
              id: `${item.uid || key}-recur-${index}`,
              title: item.summary || '(タイトルなし)',
              description: item.description || '',
              location: item.location || '',
              start: recurStart.toISOString(),
              end: recurEnd.toISOString(),
              allDay: item.datetype === 'date',
              url: item.url || '',
              source: 'google',
            });
          });
        } catch (rruleErr) {
          console.error('Error expanding RRULE:', rruleErr);
        }
      }
    }

    // If after parsing, 0 events were found in the calendar
    if (events.length === 0) {
      return NextResponse.json<EventsApiResponse>({
        events: getMockEvents(),
        source: 'mock',
        message: 'Googleカレンダーに登録されている予定が0件だったため、サンプルの予定を表示しています。',
      });
    }

    // Sort events by start date
    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return NextResponse.json<EventsApiResponse>({
      events,
      source: 'google',
    });
  } catch (error: any) {
    console.error('Error fetching/parsing Google Calendar iCal:', error);
    return NextResponse.json<EventsApiResponse>({
      events: getMockEvents(),
      source: 'mock',
      message: `カレンダーの取得に失敗したためサンプルを表示しています (${error?.message || '不明なエラー'})`,
    });
  }
}
