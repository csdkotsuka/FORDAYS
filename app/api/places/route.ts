import { NextResponse } from 'next/server';
import { FORDAYS_PRESET_EVENTS } from '@/lib/presetEvents';

export const dynamic = 'force-dynamic';

interface PlaceCandidate {
  name: string;
  address?: string;
  source: 'google' | 'osm' | 'history';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ places: [] });
  }

  const results: PlaceCandidate[] = [];
  const seen = new Set<string>();

  const addResult = (name: string, address?: string, source: 'google' | 'osm' | 'history' = 'google') => {
    const cleanName = name.trim();
    if (!cleanName || seen.has(cleanName)) return;
    seen.add(cleanName);
    results.push({ name: cleanName, address: address?.trim(), source });
  };

  // 1. If Google Places API key is configured in environment
  const googleApiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (googleApiKey) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&types=establishment&language=ja&components=country:jp&key=${googleApiKey}`;
      const res = await fetch(gUrl, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        if (data.predictions && Array.isArray(data.predictions)) {
          for (const pred of data.predictions) {
            const mainText = pred.structured_formatting?.main_text || pred.description;
            const secondaryText = pred.structured_formatting?.secondary_text;
            addResult(mainText, secondaryText, 'google');
          }
        }
      }
    } catch (e) {
      console.error('Error fetching Google Places:', e);
    }
  }

  // 2. OpenStreetMap / Geocoding facility search fallback
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&countrycodes=jp&format=json&limit=6&addressdetails=1`;
    const res = await fetch(osmUrl, {
      headers: {
        'User-Agent': 'fordays-calendar/1.0 (contact@fordays.app)',
        'Accept-Language': 'ja',
      },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const parts = (item.display_name || '').split(',');
          const mainName = parts[0]?.trim() || item.name;
          const address = parts.slice(1, 4).join(', ').trim();
          addResult(mainName, address, 'osm');
        }
      }
    }
  } catch (e) {
    // Ignore external geocoding errors
  }

  // 3. Search known FORDAYS venues from preset events matching query
  for (const ev of FORDAYS_PRESET_EVENTS) {
    if (ev.location && ev.location.toLowerCase().includes(query.toLowerCase())) {
      addResult(ev.location, 'FORDAYS 過去・定例会場', 'history');
    }
  }

  return NextResponse.json({
    places: results.slice(0, 8),
    hasGoogleApiKey: Boolean(googleApiKey),
  });
}
