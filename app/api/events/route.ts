import { NextResponse } from 'next/server';
import ical from 'node-ical';
import { CalendarEvent, EventsApiResponse } from '@/lib/types';
import { getMockEvents } from '@/lib/mockData';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 1 minute cache

export async function GET() {
  const icalUrl = process.env.GOOGLE_CALENDAR_ICAL_URL;

  if (!icalUrl) {
    return NextResponse.json<EventsApiResponse>({
      events: getMockEvents(),
      source: 'mock',
      message: 'GOOGLE_CALENDAR_ICAL_URL が未設定のため、サンプルデータを表示しています。',
    });
  }

  try {
    const res = await fetch(icalUrl, {
      next: { revalidate: 60 },
      headers: {
        'User-Agent': 'FORDAYS-Calendar-App/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ical data: ${res.status} ${res.statusText}`);
    }

    const icsText = await res.text();
    const parsedData = ical.sync.parseICS(icsText);

    const events: CalendarEvent[] = [];

    for (const key in parsedData) {
      const item = parsedData[key];
      if (item && item.type === 'VEVENT') {
        if (!item.start) continue;

        const startDate = new Date(item.start);
        const endDate = item.end ? new Date(item.end) : startDate;

        // Determine if allDay event
        const isAllDay = (item as any).datetype === 'date' || 
          (startDate.getHours() === 0 && startDate.getMinutes() === 0 && 
           endDate.getHours() === 0 && endDate.getMinutes() === 0 &&
           (endDate.getTime() - startDate.getTime()) >= 86400000);

        events.push({
          id: item.uid || key,
          title: item.summary || '(タイトルなし)',
          description: item.description || '',
          location: item.location || '',
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          allDay: isAllDay,
          url: (item as any).url || '',
          source: 'google',
        });
      }
    }

    // Sort events by start date
    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return NextResponse.json<EventsApiResponse>({
      events,
      source: 'google',
    });
  } catch (error: any) {
    console.error('Error parsing Google Calendar iCal:', error);
    return NextResponse.json<EventsApiResponse>({
      events: getMockEvents(),
      source: 'mock',
      message: `Googleカレンダーの取得に失敗したためサンプルを表示しています (${error?.message || '不明なエラー'})`,
    });
  }
}
