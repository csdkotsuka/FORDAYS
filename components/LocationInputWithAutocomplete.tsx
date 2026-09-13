'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Search } from 'lucide-react';

interface PlaceItem {
  name: string;
  address?: string;
  source: 'google' | 'osm' | 'history';
}

interface LocationInputWithAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  pastLocations?: string[];
}

export const LocationInputWithAutocomplete: React.FC<LocationInputWithAutocompleteProps> = ({
  value,
  onChange,
  placeholder = '会場名や住所を入力（例: パフィオ宇和島、松前文化センター）',
  pastLocations = [],
}) => {
  const [suggestions, setSuggestions] = useState<PlaceItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          const items: PlaceItem[] = data.places || [];
          setSuggestions(items);
          setIsOpen(items.length > 0);
        }
      } catch {
        // ignore network errors
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const handleSelectPlace = (placeName: string) => {
    onChange(placeName);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      {/* Past locations dropdown selector if available */}
      {pastLocations.length > 0 && (
        <div className="relative">
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                onChange(e.target.value);
              }
            }}
            className="w-full px-3 py-1.5 text-xs bg-sky-50/70 border border-sky-200 rounded-lg text-sky-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition appearance-none cursor-pointer"
          >
            <option value="">▼ 過去の履歴から選択する（{pastLocations.length}件）</option>
            {pastLocations.map((loc, idx) => (
              <option key={idx} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-sky-700">
            <MapPin className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Input box with autocomplete */}
      <div className="relative">
        <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-3.5 h-3.5 text-sky-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto animate-in fade-in duration-150">
          <div className="px-3 py-1 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-semibold">
            <span className="flex items-center gap-1">
              <Search className="w-3 h-3 text-sky-600" />
              <span>施設・住所の候補</span>
            </span>
            <span>クリックで入力</span>
          </div>

          <div className="divide-y divide-gray-50">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPlace(item.name)}
                className="w-full px-3 py-2 text-left hover:bg-sky-50/70 transition flex items-start gap-2 group"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0 group-hover:scale-110 transition" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 group-hover:text-sky-700 truncate">
                    {item.name}
                  </p>
                  {item.address && (
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">
                      {item.address}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
