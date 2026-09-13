'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CalendarEvent, EventsApiResponse } from '@/lib/types';
import { CalendarView } from '@/components/CalendarView';
import { ListView } from '@/components/ListView';
import { EventDetailModal } from '@/components/EventDetailModal';
import { ConfigHelpModal } from '@/components/ConfigHelpModal';
import {
  Calendar as CalendarIcon,
  List,
  RotateCw,
  HelpCircle,
  Sparkles,
  AlertCircle,
  Info,
} from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/events');
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data: EventsApiResponse = await res.json();
      const loadedEvents = data.events || [];
      setEvents(loadedEvents);
      setIsMock(data.source === 'mock');
      setApiMessage(data.message || null);

      // If events exist, check if current month has events; if not, align to closest event month
      if (loadedEvents.length > 0) {
        const now = new Date();
        const hasEventsThisMonth = loadedEvents.some((ev) => {
          const d = new Date(ev.start);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        });

        if (!hasEventsThisMonth) {
          // Find the first upcoming event or latest past event
          const futureEvents = loadedEvents.filter((ev) => new Date(ev.start) >= now);
          const targetEvent = futureEvents.length > 0 ? futureEvents[0] : loadedEvents[0];
          setCurrentDate(new Date(targetEvent.start));
        }
      }
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError('予定データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 py-3 sm:py-4 transition-all">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-gray-900">
                  FORDAYS
                </h1>
                <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  カレンダー
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                Googleカレンダー連携スケジュール
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Status indicator / Help button */}
            <button
              onClick={() => setShowHelpModal(true)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition ${
                isMock
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
              title="連携設定を確認"
            >
              {isMock ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="hidden sm:inline">デモ表示中</span>
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="hidden sm:inline">Google同期中</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                    {events.length}件
                  </span>
                </>
              )}
            </button>

            {/* Refresh button */}
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-sky-600 rounded-xl hover:bg-gray-100 active:scale-95 transition disabled:opacity-50"
              aria-label="再読み込み"
              title="予定を再読み込み"
            >
              <RotateCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-4 flex-1">
        {/* API notification message / hint */}
        {apiMessage && (
          <div
            onClick={() => setShowHelpModal(true)}
            className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-2 cursor-pointer hover:bg-amber-100/70 transition group"
          >
            <div className="flex items-start gap-2 text-xs sm:text-sm text-amber-900 font-medium">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{apiMessage}</span>
            </div>
            <span className="text-xs text-amber-700 font-semibold underline group-hover:text-amber-800 shrink-0">
              設定手順 →
            </span>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-center">
          <div className="bg-gray-200/80 p-1 rounded-2xl flex items-center w-full max-w-xs shadow-inner">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
                viewMode === 'calendar'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>カレンダー表示</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
                viewMode === 'list'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>リスト表示 ({events.length})</span>
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && events.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-3">
            <RotateCw className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-sm font-medium text-gray-500">予定を読み込んでいます...</p>
          </div>
        ) : error && events.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-rose-100 shadow-sm space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-medium text-gray-700">{error}</p>
            <button
              onClick={fetchEvents}
              className="px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-xl hover:bg-sky-700 transition"
            >
              再試行する
            </button>
          </div>
        ) : (
          <div>
            {viewMode === 'calendar' ? (
              <CalendarView
                events={events}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
              />
            ) : (
              <ListView
                events={events}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
              />
            )}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Config Help Modal */}
      <ConfigHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        isMockData={isMock}
      />
    </main>
  );
}
