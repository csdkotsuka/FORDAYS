'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CalendarEvent } from '@/lib/types';
import { downloadIcsFile, getGoogleCalendarUrl } from '@/lib/calendarHelper';
import { EVENT_COLORS, getColorTheme } from '@/lib/colorHelper';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileText,
  Download,
  ExternalLink,
  Check,
  Palette,
  Edit3,
  Save,
} from 'lucide-react';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  isOwner?: boolean;
  onUpdateEvent?: (updated: CalendarEvent) => void;
  allEvents?: CalendarEvent[];
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  isOwner = false,
  onUpdateEvent,
  allEvents = [],
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('sky');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDateStr, setStartDateStr] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');

  // Reset/Initialize fields whenever the event opens
  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setColor(event.color || 'sky');
      setLocation(event.location || '');
      setDescription(event.description || '');
      setAllDay(Boolean(event.allDay));
      setIsEditing(false);

      const startD = new Date(event.start);
      const endD = new Date(event.end);
      setStartDateStr(format(startD, 'yyyy-MM-dd'));
      setStartTimeStr(format(startD, 'HH:mm'));
      setEndDateStr(format(endD, 'yyyy-MM-dd'));
      setEndTimeStr(format(endD, 'HH:mm'));
    }
  }, [event]);

  // Extract past locations for dropdown
  const pastLocations = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((ev) => {
      if (ev.location?.trim()) set.add(ev.location.trim());
    });
    return Array.from(set).sort();
  }, [allEvents]);

  // Check if anything has been modified
  const isDirty = useMemo(() => {
    if (!event) return false;
    const initialStartD = new Date(event.start);
    const initialEndD = new Date(event.end);

    const initialStartDateStr = format(initialStartD, 'yyyy-MM-dd');
    const initialStartTimeStr = format(initialStartD, 'HH:mm');
    const initialEndDateStr = format(initialEndD, 'yyyy-MM-dd');
    const initialEndTimeStr = format(initialEndD, 'HH:mm');

    const titleChanged = title.trim() !== (event.title || '').trim();
    const colorChanged = (color || 'sky') !== (event.color || 'sky');
    const locationChanged = location.trim() !== (event.location || '').trim();
    const descChanged = description.trim() !== (event.description || '').trim();
    const allDayChanged = Boolean(allDay) !== Boolean(event.allDay);

    const datesChanged =
      startDateStr !== initialStartDateStr ||
      startTimeStr !== initialStartTimeStr ||
      endDateStr !== initialEndDateStr ||
      endTimeStr !== initialEndTimeStr;

    return titleChanged || colorChanged || locationChanged || descChanged || allDayChanged || datesChanged;
  }, [event, title, color, location, description, allDay, startDateStr, startTimeStr, endDateStr, endTimeStr]);

  // Build the updated event object
  const buildUpdatedEvent = (): CalendarEvent | null => {
    if (!event) return null;

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
      ...event,
      title: title.trim() || '(タイトルなし)',
      color,
      location: location.trim(),
      description: description.trim(),
      allDay,
      start: startIso,
      end: endIso,
    };
  };

  const handleSave = () => {
    if (onUpdateEvent) {
      const updated = buildUpdatedEvent();
      if (updated) {
        onUpdateEvent(updated);
      }
    }
    setIsEditing(false);
    onClose();
  };

  const handleBottomButtonClick = () => {
    if (isDirty) {
      handleSave();
    } else {
      onClose();
    }
  };

  // Keyboard shortcut: Escape key handling for PC
  useEffect(() => {
    if (!event) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isDirty) {
          const confirmSave = window.confirm('変更内容を保存しますか？\n・[OK]: 保存して閉じる\n・[キャンセル]: 保存せずに閉じる');
          if (confirmSave) {
            handleSave();
          } else {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [event, isDirty, title, color, location, description, allDay, startDateStr, startTimeStr, endDateStr, endTimeStr]);

  if (!event) return null;

  const currentTheme = getColorTheme(color);

  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const dateStr = format(startDate, 'yyyy年M月d日 (E)', { locale: ja });
  const timeStr = event.allDay
    ? '終日'
    : `${format(startDate, 'HH:mm')} 〜 ${format(endDate, 'HH:mm')}`;

  const handleDownloadIcs = () => {
    const currentObj = buildUpdatedEvent() || event;
    downloadIcsFile(currentObj);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const googleCalUrl = getGoogleCalendarUrl(buildUpdatedEvent() || event);
  const mapSearchUrl = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar / drag handle on mobile */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Top row */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: currentTheme.bgLight,
                    color: currentTheme.textDark,
                    borderColor: currentTheme.border,
                  }}
                >
                  ● FORDAYS 予定
                </span>

                {isDirty && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full animate-pulse">
                    未保存の変更あり
                  </span>
                )}
              </div>

              {/* Title: Readonly or Editable */}
              {isEditing ? (
                <div className="pt-1">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">イベント名</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-base font-bold bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                  {title}
                </h2>
              )}
            </div>

            {/* Owner Edit Button (No X button as requested) */}
            {isOwner && (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  isEditing
                    ? 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? '完了' : '編集'}</span>
              </button>
            )}
          </div>

          {/* Color Switcher (Visible to Owner, or if already editing) */}
          {isOwner && (
            <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Palette className="w-3.5 h-3.5 text-gray-500" />
                <span>カラー変更:</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {EVENT_COLORS.map((c) => {
                  const isSelected = color === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      title={c.name}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition active:scale-90 ${
                        isSelected ? 'ring-2 ring-offset-2 ring-gray-400 scale-110 shadow-sm' : 'hover:opacity-80'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date & Time info: Readonly or Editable */}
          {isEditing ? (
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">終日イベント</span>
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold mb-0.5">開始日時</label>
                  <input
                    type="date"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white"
                  />
                  {!allDay && (
                    <input
                      type="time"
                      value={startTimeStr}
                      onChange={(e) => setStartTimeStr(e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg bg-white mt-1"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold mb-0.5">終了日時</label>
                  <input
                    type="date"
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white"
                  />
                  {!allDay && (
                    <input
                      type="time"
                      value={endTimeStr}
                      onChange={(e) => setEndTimeStr(e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg bg-white mt-1"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="border rounded-2xl p-4 space-y-2 transition-colors"
              style={{
                backgroundColor: currentTheme.bgLight,
                borderColor: currentTheme.border,
              }}
            >
              <div className="flex items-center font-bold" style={{ color: currentTheme.textDark }}>
                <CalendarIcon className="w-5 h-5 mr-2.5 shrink-0" style={{ color: currentTheme.hex }} />
                <span>{dateStr}</span>
              </div>
              <div className="flex items-center text-gray-700 font-medium">
                <Clock className="w-5 h-5 mr-2.5 shrink-0" style={{ color: currentTheme.hex }} />
                <span>{timeStr}</span>
              </div>
            </div>
          )}

          {/* Location */}
          {isEditing ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">開催場所</label>
              {pastLocations.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setLocation(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-sky-50/70 border border-sky-200 rounded-lg text-sky-900 font-medium"
                >
                  <option value="">▼ 過去の場所から選ぶ</option>
                  {pastLocations.map((loc, i) => (
                    <option key={i} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                placeholder="場所を入力"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 border rounded-lg focus:bg-white"
              />
            </div>
          ) : (
            location && (
              <div className="flex items-start text-gray-700">
                <MapPin className="w-5 h-5 text-rose-500 mr-2.5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{location}</p>
                  {mapSearchUrl && (
                    <a
                      href={mapSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-sky-600 hover:text-sky-800 font-medium mt-0.5 gap-0.5 underline"
                    >
                      Googleマップで開く
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>
              </div>
            )
          )}

          {/* Description */}
          {isEditing ? (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">メモ・詳細</label>
              <textarea
                rows={3}
                placeholder="アジェンダ、詳細など"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 border rounded-lg focus:bg-white"
              />
            </div>
          ) : (
            description && (
              <div className="flex items-start text-gray-700">
                <FileText className="w-5 h-5 text-gray-400 mr-2.5 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm leading-relaxed whitespace-pre-wrap text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  {description}
                </div>
              </div>
            )
          )}

          {/* Mobile Calendar Registration Actions */}
          <div className="pt-2 border-t border-gray-100 space-y-2.5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              スマホのカレンダーに登録
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-medium rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition"
              >
                {downloaded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-xs">登録ファイル保存完了</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="text-xs">iPhone / スマホに追加 (.ics)</span>
                  </>
                )}
              </button>

              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl shadow-sm active:scale-[0.98] transition"
              >
                <CalendarIcon className="w-4 h-4 text-amber-500" />
                <span className="text-xs">Googleカレンダーに追加</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Changes from "閉じる" to "保存" when modified */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={handleBottomButtonClick}
            className={`w-full py-3 text-center text-sm font-bold rounded-xl transition shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 ${
              isDirty
                ? 'bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 text-white shadow-sky-500/20 shadow-md'
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            {isDirty ? (
              <>
                <Save className="w-4 h-4" />
                <span>保存する</span>
              </>
            ) : (
              <span>閉じる</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
