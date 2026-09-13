import { NextResponse } from 'next/server';
import { FORDAYS_PRESET_EVENTS } from '@/lib/presetEvents';
import { generateAllEventsIcsContent } from '@/lib/calendarHelper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const isWebcal = url.searchParams.get('format') === 'webcal';

  const events = [...FORDAYS_PRESET_EVENTS];
  const icsContent = generateAllEventsIcsContent(events, 'フォーデイズ公式予定表');

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="fordays-all-events.ics"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
