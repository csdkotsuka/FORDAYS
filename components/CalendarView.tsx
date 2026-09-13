'use client';

import React, { useState } from 'react';
import { CalendarEvent } from '@/lib/types';
import { getColorTheme } from '@/lib/colorHelper';
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
  Printer,
} from 'lucide-react';
import { OfficialPrintHeader } from './OfficialBanner';

interface CalendarViewProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  onDateLongPress?: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onSelectEvent,
  currentDate,
  setCurrentDate,
  onDateLongPress,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const isLongPressTriggeredRef = React.useRef<boolean>(false);

  const startLongPress = (date: Date, clientX: number, clientY: number) => {
    isLongPressTriggeredRef.current = false;
    touchStartPosRef.current = { x: clientX, y: clientY };

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        try {
          window.navigator.vibrate(40);
        } catch {}
      }
      if (onDateLongPress) {
        onDateLongPress(date);
      }
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
    if (dx > 8 || dy > 8) {
      cancelLongPress();
    }
  };

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 print:space-y-0 print-page-fit">
      {/* Official Print Header for A4 PDF Output */}
      <OfficialPrintHeader currentDate={currentDate} />

      {/* Month Navigation Header (Hidden on print) */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            {format(currentDate, 'yyyy年 M月', { locale: ja })}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {/* A4 PDF / Print button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-2xs hover:shadow-xs transition active:scale-95 mr-1"
            title="A4用紙でPDF出力 / 印刷"
          >
            <Printer className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">A4 PDF出力</span>
            <span className="sm:hidden">PDF</span>
          </button>

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:border-black print:rounded-none print:shadow-none">
        {/* Hint Bar (Hidden on print) */}
        <div className="px-3 py-1.5 bg-sky-50/50 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500 print:hidden">
          <span>タップで詳細表示</span>
          <span className="text-sky-700 font-medium">日付長押しで新規予定を追加</span>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/70 text-center text-xs font-semibold py-2.5 print:bg-gray-100 print:border-black print:py-1">
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
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  startLongPress(day, touch.clientX, touch.clientY);
                }}
                onTouchMove={handleTouchMove}
                onTouchEnd={cancelLongPress}
                onTouchCancel={cancelLongPress}
                onMouseDown={(e) => {
                  if (e.button === 0) {
                    startLongPress(day, e.clientX, e.clientY);
                  }
                }}
                onMouseMove={(e) => {
                  if (!touchStartPosRef.current) return;
                  const dx = Math.abs(e.clientX - touchStartPosRef.current.x);
                  const dy = Math.abs(e.clientY - touchStartPosRef.current.y);
                  if (dx > 8 || dy > 8) {
                    cancelLongPress();
                  }
                }}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onClick={() => {
                  if (isLongPressTriggeredRef.current) {
                    isLongPressTriggeredRef.current = false;
                    return;
                  }
                  setSelectedDate(day);
                  if (dayEvents.length === 1) {
                    onSelectEvent(dayEvents[0]);
                  }
                }}
                className={`min-h-[76px] sm:min-h-[105px] print:min-h-[100px] p-1.5 sm:p-2 print:p-1 cursor-pointer select-none transition flex flex-col justify-between ${
                  !inCurrentMonth ? 'bg-gray-50/40 text-gray-300 print:bg-gray-50/60 print:text-gray-400' : 'hover:bg-sky-50/40'
                } ${isSelected ? 'bg-sky-50 ring-2 ring-inset ring-sky-500 print:ring-0 print:bg-transparent' : ''}`}
              >
                {/* Date number */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full ${
                      dayIsToday
                        ? 'bg-sky-600 text-white shadow-sm print:bg-transparent print:text-black print:font-bold'
                        : isSelected
                        ? 'bg-sky-200 text-sky-900 print:bg-transparent print:text-black'
                        : !inCurrentMonth
                        ? 'text-gray-300 print:text-gray-400'
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
                    <span className="text-[10px] sm:text-xs font-bold text-sky-700 bg-sky-100 rounded-full px-1.5 print:hidden">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event previews in calendar cell - Screen View */}
                <div className="mt-1 space-y-1 overflow-hidden flex-1 print:hidden">
                  {dayEvents.slice(0, 2).map((ev) => {
                    const evTheme = getColorTheme(ev.color);
                    return (
                      <div
                        key={ev.id}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev);
                        }}
                        style={{
                          backgroundColor: evTheme.bgLight,
                          color: evTheme.textDark,
                          borderColor: evTheme.border,
                        }}
                        className="text-[10px] sm:text-xs truncate border rounded px-1 py-0.5 font-semibold transition active:scale-95 shadow-2xs"
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-[9px] sm:text-[11px] text-gray-500 font-medium pl-0.5">
                      他 {dayEvents.length - 2} 件
                    </div>
                  )}
                </div>

                {/* Event previews in calendar cell - Print View (Show all events with details) */}
                <div className="hidden print:flex flex-col space-y-0.5 mt-0.5 overflow-visible flex-1">
                  {dayEvents.map((ev) => {
                    const evTheme = getColorTheme(ev.color);
                    const sTime = ev.allDay ? '' : format(new Date(ev.start), 'HH:mm');
                    return (
                      <div
                        key={ev.id}
                        style={{
                          backgroundColor: evTheme.bgLight,
                          color: evTheme.textDark,
                          borderColor: evTheme.border,
                        }}
                        className="text-[8px] leading-tight border rounded px-1 py-0.5 font-bold"
                      >
                        {sTime && <span className="mr-0.5 text-[7px]">{sTime}〜</span>}
                        <span>{ev.title}</span>
                        {ev.location && (
                          <span className="block font-normal text-[7px] text-gray-600 truncate">
                            ({ev.location})
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day's Events Section (Hidden on print) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3 print:hidden">
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
              const evTheme = getColorTheme(ev.color);
              const startD = new Date(ev.start);
              const endD = new Date(ev.end);
              const timeStr = ev.allDay
                ? '終日'
                : `${format(startD, 'HH:mm')}〜${format(endD, 'HH:mm')}`;

              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  style={{
                    borderLeftColor: evTheme.hex,
                    borderLeftWidth: '4px',
                  }}
                  className="p-3 bg-white hover:bg-gray-50/80 border border-gray-100 rounded-xl cursor-pointer transition active:scale-[0.99] flex flex-col sm:flex-row sm:items-center justify-between gap-2 group shadow-2xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: evTheme.bgLight,
                          color: evTheme.textDark,
                          borderColor: evTheme.border,
                        }}
                      >
                        <Clock className="w-3.5 h-3.5" style={{ color: evTheme.hex }} />
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
