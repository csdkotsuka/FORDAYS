'use client';

import React, { useState } from 'react';
import { CalendarEvent } from '@/lib/types';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
} from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onSelectEvent,
  currentDate,
  setCurrentDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  // Filter events for a given day
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, day);
    });
  };

  const selectedDayEvents = getEventsForDay(selectedDate);

  const prevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const nextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            {format(currentDate, 'yyyy年 M月', { locale: ja })}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition"
          >
            今日
          </button>
          <button
            onClick={prevMonth}
            className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
            aria-label="前月"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
            aria-label="次月"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/70 text-center text-xs font-semibold py-2.5">
          {weekDays.map((dayName, idx) => {
            const isSun = idx === 0;
            const isSat = idx === 6;
            return (
              <span
                key={dayName}
                className={isSun ? 'text-rose-600' : isSat ? 'text-sky-600' : 'text-gray-600'}
              >
                {dayName}
              </span>
            );
          })}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 border-b border-gray-100">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const inCurrentMonth = isSameMonth(day, monthStart);
            const dayIsToday = isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            const dayOfWeek = day.getDay();
            const isSun = dayOfWeek === 0;
            const isSat = dayOfWeek === 6;

            return (
              <div
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  if (dayEvents.length === 1) {
                    onSelectEvent(dayEvents[0]);
                  }
                }}
                className={`min-h-[76px] sm:min-h-[105px] p-1.5 sm:p-2 cursor-pointer transition flex flex-col justify-between ${
                  !inCurrentMonth ? 'bg-gray-50/40 text-gray-300' : 'hover:bg-sky-50/40'
                } ${isSelected ? 'bg-sky-50 ring-2 ring-inset ring-sky-500' : ''}`}
              >
                {/* Date number */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full ${
                      dayIsToday
                        ? 'bg-sky-600 text-white shadow-sm'
                        : isSelected
                        ? 'bg-sky-200 text-sky-900'
                        : !inCurrentMonth
                        ? 'text-gray-300'
                        : isSun
                        ? 'text-rose-600'
                        : isSat
                        ? 'text-sky-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  {dayEvents.length > 0 && (
                    <span className="text-[10px] sm:text-xs font-bold text-sky-700 bg-sky-100 rounded-full px-1.5">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event previews in calendar cell */}
                <div className="mt-1 space-y-1 overflow-hidden flex-1">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                      }}
                      className="text-[10px] sm:text-xs truncate bg-sky-50 border border-sky-200/80 text-sky-900 rounded px-1 py-0.5 font-medium hover:bg-sky-100 transition active:scale-95"
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[9px] sm:text-[11px] text-gray-500 font-medium pl-0.5">
                      他 {dayEvents.length - 2} 件
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day's Events Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-600" />
            {format(selectedDate, 'yyyy年M月d日 (E)', { locale: ja })} の予定
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            {selectedDayEvents.length} 件
          </span>
        </div>

        {selectedDayEvents.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-400 py-3 text-center">
            この日の予定はありません
          </p>
        ) : (
          <div className="space-y-2">
            {selectedDayEvents.map((ev) => {
              const startD = new Date(ev.start);
              const endD = new Date(ev.end);
              const timeStr = ev.allDay
                ? '終日'
                : `${format(startD, 'HH:mm')}〜${format(endD, 'HH:mm')}`;

              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className="p-3 bg-gradient-to-r from-sky-50/50 to-white hover:to-sky-50 border border-sky-100 rounded-xl cursor-pointer transition active:scale-[0.99] flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        {timeStr}
                      </span>
                      {ev.location && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-gray-500 truncate max-w-[180px]">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-sky-600 transition">
                      {ev.title}
                    </h4>
                  </div>

                  <div className="flex items-center self-end sm:self-center">
                    <span className="text-xs font-medium text-sky-600 group-hover:underline">
                      詳細・登録 →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
