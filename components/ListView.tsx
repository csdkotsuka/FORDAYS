'use client';

import React, { useState } from 'react';
import { CalendarEvent } from '@/lib/types';
import { getColorTheme } from '@/lib/colorHelper';
import { format, isPast, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Search,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ListViewProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export const ListView: React.FC<ListViewProps> = ({ events, onSelectEvent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUpcoming, setFilterUpcoming] = useState(false);

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.location && ev.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ev.description && ev.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterUpcoming) {
      const endDate = new Date(ev.end);
      return !isPast(endDate) || isToday(endDate);
    }

    return true;
  });

  // Group events by date (yyyy-MM-dd)
  const groupedEvents: { [key: string]: CalendarEvent[] } = {};
  filteredEvents.forEach((ev) => {
    const key = format(new Date(ev.start), 'yyyy-MM-dd');
    if (!groupedEvents[key]) {
      groupedEvents[key] = [];
    }
    groupedEvents[key].push(ev);
  });

  const sortedDateKeys = Object.keys(groupedEvents).sort();

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="イベント名・場所で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUpcoming((prev) => !prev)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${
              filterUpcoming
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {filterUpcoming ? '✓ 今後の予定のみ' : 'すべての予定'}
          </button>
        </div>
      </div>

      {/* Events List */}
      {sortedDateKeys.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm space-y-2">
          <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-medium text-sm">該当する予定が見つかりませんでした</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-sky-600 font-semibold hover:underline"
            >
              検索条件をクリア
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDateKeys.map((dateKey) => {
            const dateObj = new Date(dateKey + 'T00:00:00');
            const dayEvents = groupedEvents[dateKey];
            const isDayToday = isToday(dateObj);

            return (
              <div key={dateKey} className="space-y-2">
                {/* Date header badge */}
                <div className="flex items-center gap-2 px-1">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isDayToday
                        ? 'bg-sky-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {format(dateObj, 'yyyy年M月d日 (E)', { locale: ja })}
                    {isDayToday && '（今日）'}
                  </span>
                  <div className="h-px bg-gray-100 flex-1" />
                </div>

                {/* Event items for this date */}
                <div className="space-y-2">
                  {dayEvents.map((ev) => {
                    const evTheme = getColorTheme(ev.color);
                    const startD = new Date(ev.start);
                    const endD = new Date(ev.end);
                    const timeStr = ev.allDay
                      ? '終日'
                      : `${format(startD, 'HH:mm')} 〜 ${format(endD, 'HH:mm')}`;

                    return (
                      <div
                        key={ev.id}
                        onClick={() => onSelectEvent(ev)}
                        style={{
                          borderLeftColor: evTheme.hex,
                          borderLeftWidth: '5px',
                        }}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition active:scale-[0.99] flex items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2">
                            <span
                              className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border"
                              style={{
                                backgroundColor: evTheme.bgLight,
                                color: evTheme.textDark,
                                borderColor: evTheme.border,
                              }}
                            >
                              <Clock className="w-3 h-3" style={{ color: evTheme.hex }} />
                              {timeStr}
                            </span>
                            {ev.location && (
                              <span className="inline-flex items-center gap-0.5 text-xs text-gray-500 truncate max-w-[200px]">
                                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                {ev.location}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-gray-900 group-hover:text-sky-600 transition truncate">
                            {ev.title}
                          </h3>

                          {ev.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {ev.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-gray-400 group-hover:text-sky-600 transition shrink-0">
                          <span className="text-xs font-medium hidden sm:inline">詳細・登録</span>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
