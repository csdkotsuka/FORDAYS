'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { CalendarEvent, EventsApiResponse } from '@/lib/types';
import { CalendarView } from '@/components/CalendarView';
import { ListView } from '@/components/ListView';
import { EventDetailModal } from '@/components/EventDetailModal';
import { AddEventModal } from '@/components/AddEventModal';
import { ConfigHelpModal } from '@/components/ConfigHelpModal';
import { OwnerLoginModal } from '@/components/OwnerLoginModal';
import {
  Calendar as CalendarIcon,
  List,
  RotateCw,
  HelpCircle,
  Plus,
  Info,
  Lock,
  ShieldCheck,
} from 'lucide-react';

const STORAGE_CUSTOM_EVENTS_KEY = 'fordays_custom_events';
const STORAGE_EDITED_EVENTS_KEY = 'fordays_edited_events';
const STORAGE_DELETED_EVENTS_KEY = 'fordays_deleted_events';
const STORAGE_IS_OWNER_KEY = 'fordays_is_owner';

export default function Home() {
  const [apiEvents, setApiEvents] = useState<CalendarEvent[]>([]);
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [editedEventsMap, setEditedEventsMap] = useState<{ [id: string]: CalendarEvent }>({});
  const [deletedEventIds, setDeletedEventIds] = useState<string[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [showOwnerModal, setShowOwnerModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [addModalInitialDate, setAddModalInitialDate] = useState<Date>(new Date());

  // Load state from localStorage on client mount
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem(STORAGE_CUSTOM_EVENTS_KEY);
      if (savedEvents) setCustomEvents(JSON.parse(savedEvents));

      const savedEdited = localStorage.getItem(STORAGE_EDITED_EVENTS_KEY);
      if (savedEdited) setEditedEventsMap(JSON.parse(savedEdited));

      const savedDeleted = localStorage.getItem(STORAGE_DELETED_EVENTS_KEY);
      if (savedDeleted) setDeletedEventIds(JSON.parse(savedDeleted));

      const savedOwner = localStorage.getItem(STORAGE_IS_OWNER_KEY);
      if (savedOwner === 'true') setIsOwner(true);
    } catch (e) {
      // ignore
    }
  }, []);

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
      setApiEvents(loadedEvents);
      setIsMock(data.source === 'mock');
      setApiMessage(data.message || null);

      if (loadedEvents.length > 0) {
        const now = new Date();
        const hasEventsThisMonth = loadedEvents.some((ev) => {
          const d = new Date(ev.start);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        });

        if (!hasEventsThisMonth) {
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

  // Combined events with edited overrides applied, and deleted events filtered out:
  const allEvents = useMemo(() => {
    const combined = [...customEvents, ...apiEvents]
      .filter((ev) => !deletedEventIds.includes(ev.id))
      .map((ev) => {
        const edited = editedEventsMap[ev.id];
        if (edited) {
          return {
            ...ev,
            ...edited,
          };
        }
        return ev;
      });
    return combined.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
  }, [apiEvents, customEvents, editedEventsMap, deletedEventIds]);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    const updated = [newEvent, ...customEvents];
    setCustomEvents(updated);
    try {
      localStorage.setItem(STORAGE_CUSTOM_EVENTS_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const handleUpdateEvent = (updated: CalendarEvent) => {
    // 1. Update editedEventsMap
    const newEditedMap = {
      ...editedEventsMap,
      [updated.id]: updated,
    };
    setEditedEventsMap(newEditedMap);
    try {
      localStorage.setItem(STORAGE_EDITED_EVENTS_KEY, JSON.stringify(newEditedMap));
    } catch (e) {
      // ignore
    }

    // 2. If it's a locally added custom event, update it there too
    if (customEvents.some((c) => c.id === updated.id)) {
      const newCustom = customEvents.map((c) => (c.id === updated.id ? updated : c));
      setCustomEvents(newCustom);
      try {
        localStorage.setItem(STORAGE_CUSTOM_EVENTS_KEY, JSON.stringify(newCustom));
      } catch (e) {
        // ignore
      }
    }

    if (selectedEvent && selectedEvent.id === updated.id) {
      setSelectedEvent(updated);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    // 1. Add to deletedEventIds and persist
    const newDeleted = Array.from(new Set([...deletedEventIds, eventId]));
    setDeletedEventIds(newDeleted);
    try {
      localStorage.setItem(STORAGE_DELETED_EVENTS_KEY, JSON.stringify(newDeleted));
    } catch (e) {
      // ignore
    }

    // 2. If it was in customEvents, remove it
    if (customEvents.some((c) => c.id === eventId)) {
      const newCustom = customEvents.filter((c) => c.id !== eventId);
      setCustomEvents(newCustom);
      try {
        localStorage.setItem(STORAGE_CUSTOM_EVENTS_KEY, JSON.stringify(newCustom));
      } catch (e) {
        // ignore
      }
    }

    // 3. If it was in editedEventsMap, clean up
    if (editedEventsMap[eventId]) {
      const newEditedMap = { ...editedEventsMap };
      delete newEditedMap[eventId];
      setEditedEventsMap(newEditedMap);
      try {
        localStorage.setItem(STORAGE_EDITED_EVENTS_KEY, JSON.stringify(newEditedMap));
      } catch (e) {
        // ignore
      }
    }

    setSelectedEvent(null);
  };

  const handleOwnerLogin = () => {
    setIsOwner(true);
    try {
      localStorage.setItem(STORAGE_IS_OWNER_KEY, 'true');
    } catch (e) {
      // ignore
    }
  };

  const handleOwnerLogout = () => {
    setIsOwner(false);
    try {
      localStorage.removeItem(STORAGE_IS_OWNER_KEY);
    } catch (e) {
      // ignore
    }
  };

  const handleDateLongPress = (date: Date) => {
    if (!isOwner) {
      setShowOwnerModal(true);
      return;
    }
    setAddModalInitialDate(date);
    setShowAddModal(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col pb-20 sm:pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-3 sm:px-4 py-2.5 sm:py-4 transition-all">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <CalendarIcon className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 leading-tight">
                FORDAYS
              </h1>
              <p className="text-[11px] text-gray-400 font-medium hidden sm:block">
                Googleカレンダー連携スケジュール
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Owner badge / Login button */}
            <button
              onClick={() => setShowOwnerModal(true)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                isOwner
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }`}
              title={isOwner ? '持ち主としてログイン中' : 'アカウントの持ち主としてログイン'}
            >
              {isOwner ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">持ち主（編集可）</span>
                  <span className="sm:hidden text-xs">持ち主</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="hidden sm:inline">閲覧中</span>
                </>
              )}
            </button>

            {/* Add Event Button: Visible to Owner on desktop (on mobile, long-press calendar or use FAB) */}
            {isOwner && (
              <button
                onClick={() => {
                  setAddModalInitialDate(currentDate);
                  setShowAddModal(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>新規予定</span>
              </button>
            )}

            {/* Sync status indicator: Hidden on mobile to avoid clutter, count omitted */}
            <button
              onClick={() => setShowHelpModal(true)}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition ${
                isMock
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
              title="連携設定を確認"
            >
              {isMock ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>デモ表示中</span>
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>同期中</span>
                </>
              )}
            </button>

            {/* Refresh button */}
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-sky-600 rounded-xl hover:bg-gray-100 active:scale-95 transition disabled:opacity-50"
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
              <span>リスト表示 ({allEvents.length})</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading && allEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-3">
            <RotateCw className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-sm font-medium text-gray-500">予定を読み込んでいます...</p>
          </div>
        ) : error && allEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-rose-100 shadow-sm space-y-3">
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
                events={allEvents}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                onDateLongPress={handleDateLongPress}
              />
            ) : (
              <ListView
                events={allEvents}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
              />
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) on mobile: only for Owner */}
      {isOwner && (
        <button
          onClick={() => {
            setAddModalInitialDate(new Date());
            setShowAddModal(true);
          }}
          className="sm:hidden fixed bottom-6 right-5 z-40 w-14 h-14 bg-gradient-to-tr from-sky-600 to-sky-500 text-white rounded-full shadow-lg shadow-sky-600/30 flex items-center justify-center active:scale-95 transition"
          aria-label="予定を追加"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        existingEvents={allEvents}
        onAddEvent={handleAddEvent}
        initialDate={addModalInitialDate}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        key={selectedEvent ? `${selectedEvent.id}-${selectedEvent.start}` : 'none'}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        isOwner={isOwner}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
        allEvents={allEvents}
      />

      {/* Owner Login Modal */}
      <OwnerLoginModal
        isOpen={showOwnerModal}
        onClose={() => setShowOwnerModal(false)}
        isOwner={isOwner}
        onLogin={handleOwnerLogin}
        onLogout={handleOwnerLogout}
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
