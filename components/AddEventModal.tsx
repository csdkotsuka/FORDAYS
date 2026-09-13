'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CalendarEvent } from '@/lib/types';
import { downloadIcsFile, getGoogleCalendarUrl } from '@/lib/calendarHelper';
import { EVENT_COLORS, DEFAULT_COLOR_ID } from '@/lib/colorHelper';
import { format, addHours, startOfHour } from 'date-fns';
import {
  X,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileText,
  Download,
  ExternalLink,
  Check,
  Palette,
} from 'lucide-react';
import { LocationInputWithAutocomplete } from './LocationInputWithAutocomplete';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingEvents: CalendarEvent[];
  onAddEvent: (newEvent: CalendarEvent) => void;
  initialDate?: Date;
  duplicateSource?: CalendarEvent | null;
}

const STORAGE_CUSTOM_LOCATIONS_KEY = 'fordays_custom_locations';

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  existingEvents,
  onAddEvent,
  initialDate,
  duplicateSource,
}) => {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLOR_ID);
  const [allDay, setAllDay] = useState(false);
  const [startDateStr, setStartDateStr] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('10:00');
  const [endDateStr, setEndDateStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('12:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [customLocations, setCustomLocations] = useState<string[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load custom locations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_LOCATIONS_KEY);
      if (saved) {
        setCustomLocations(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, [isOpen]);

  // Set initial dates when modal opens (or populate from duplicateSource)
  useEffect(() => {
    if (isOpen) {
      if (duplicateSource) {
        setTitle(duplicateSource.title ? `${duplicateSource.title} (コピー)` : '');
        setLocation(duplicateSource.location || '');
        setDescription(duplicateSource.description || '');
        setSelectedColor(duplicateSource.color || DEFAULT_COLOR_ID);
        setAllDay(Boolean(duplicateSource.allDay));
        try {
          const s = new Date(duplicateSource.start);
          const e = new Date(duplicateSource.end);
          setStartDateStr(format(s, 'yyyy-MM-dd'));
          setStartTimeStr(format(s, 'HH:mm'));
          setEndDateStr(format(e, 'yyyy-MM-dd'));
          setEndTimeStr(format(e, 'HH:mm'));
        } catch {
          const baseDate = initialDate || new Date();
          const dateStr = format(baseDate, 'yyyy-MM-dd');
          setStartDateStr(dateStr);
          setEndDateStr(dateStr);
          setStartTimeStr('13:30');
          setEndTimeStr('15:30');
        }
      } else {
        const baseDate = initialDate || new Date();
        const dateStr = format(baseDate, 'yyyy-MM-dd');

        setStartDateStr(dateStr);
        setEndDateStr(dateStr);
        setStartTimeStr('13:30');
        setEndTimeStr('15:30');
        setTitle('');
        setLocation('');
        setDescription('');
        setSelectedColor(DEFAULT_COLOR_ID);
        setAllDay(false);
      }
      setSavedSuccess(false);
    }
  }, [isOpen, initialDate, duplicateSource]);

  // Extract unique past locations from existing events + customLocations
  const pastLocations = useMemo(() => {
    const locSet = new Set<string>();
    existingEvents.forEach((ev) => {
      if (ev.location && ev.location.trim()) {
        locSet.add(ev.location.trim());
      }
    });
    customLocations.forEach((loc) => {
      if (loc && loc.trim()) {
        locSet.add(loc.trim());
      }
    });
    return Array.from(locSet).sort();
  }, [existingEvents, customLocations]);

  if (!isOpen) return null;

  // Build the event object
  const buildEvent = (): CalendarEvent => {
    let startIso: string;
    let endIso: string;

    if (allDay) {
      startIso = new Date(`${startDateStr}T00:00:00`).toISOString();
      endIso = new Date(`${endDateStr || startDateStr}T23:59:59`).toISOString();
    } else {
      startIso = new Date(`${startDateStr}T${startTimeStr}:00`).toISOString();
      endIso = new Date(`${endDateStr || startDateStr}T${endTimeStr}:00`).toISOString();
    }

    return {
      id: `custom-${Date.now()}`,
      title: title.trim() || '新規イベント',
      location: location.trim(),
      description: description.trim(),
      start: startIso,
      end: endIso,
      allDay,
      color: selectedColor,
      source: 'mock',
    };
  };

  const handleSaveToApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      alert('イベント名を入力してください');
      return;
    }

    const newEv = buildEvent();
    onAddEvent(newEv);

    // Save location to customLocations if new
    if (location.trim() && !customLocations.includes(location.trim())) {
      const updated = [...customLocations, location.trim()];
      setCustomLocations(updated);
      try {
        localStorage.setItem(STORAGE_CUSTOM_LOCATIONS_KEY, JSON.stringify(updated));
      } catch (err) {
        // ignore
      }
    }

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleAddToGoogleCalendar = () => {
    if (!title.trim()) {
      alert('イベント名を入力してください');
      return;
    }
    const newEv = buildEvent();
    handleSaveToApp();
    const url = getGoogleCalendarUrl(newEv);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadIcs = () => {
    if (!title.trim()) {
      alert('イベント名を入力してください');
      return;
    }
    const newEv = buildEvent();
    handleSaveToApp();
    downloadIcsFile(newEv);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle on mobile */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">予定を新規作成</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveToApp} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              イベント名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例: FORDAYS 定例セミナー、核酸勉強会"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
          </div>

          {/* Color Palette Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-gray-500" />
              <span>予定のカラー</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
              {EVENT_COLORS.map((c) => {
                const isSelected = selectedColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    title={c.name}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition active:scale-95 relative ${
                      isSelected ? 'ring-2 ring-offset-2 ring-gray-400 scale-105' : 'hover:opacity-80'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* All day toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-semibold text-gray-700">終日イベント</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {/* Date & Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100">
            {/* Start */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-sky-900">開始</label>
              <input
                type="date"
                required
                value={startDateStr}
                onChange={(e) => {
                  setStartDateStr(e.target.value);
                  if (!endDateStr || e.target.value > endDateStr) {
                    setEndDateStr(e.target.value);
                  }
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {!allDay && (
                <input
                  type="time"
                  required
                  value={startTimeStr}
                  onChange={(e) => setStartTimeStr(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 mt-1"
                />
              )}
            </div>

            {/* End */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-sky-900">終了</label>
              <input
                type="date"
                required
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {!allDay && (
                <input
                  type="time"
                  required
                  value={endTimeStr}
                  onChange={(e) => setEndTimeStr(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 mt-1"
                />
              )}
            </div>
          </div>

          {/* Location with Autocomplete & Past Locations */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              開催場所
            </label>
            <LocationInputWithAutocomplete
              value={location}
              onChange={setLocation}
              placeholder="場所・施設・住所を入力（候補が自動表示されます）"
              pastLocations={pastLocations}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              メモ・詳細
            </label>
            <textarea
              rows={3}
              placeholder="アジェンダ、持ち物、ZoomのURLなど"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-gray-100 space-y-2.5">
            {/* Direct Save to App */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>アプリのカレンダーに保存しました！</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>アプリのカレンダーに追加する</span>
                </>
              )}
            </button>

            {/* Smartphone & Google Calendar registration */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition"
              >
                <Download className="w-4 h-4 text-sky-600" />
                <span>iPhoneに追加 (.ics)</span>
              </button>

              <button
                type="button"
                onClick={handleAddToGoogleCalendar}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded-xl transition"
              >
                <CalendarIcon className="w-4 h-4 text-amber-500" />
                <span>Googleカレンダーに追加</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
