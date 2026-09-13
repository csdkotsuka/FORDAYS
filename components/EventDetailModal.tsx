'use client';

import React from 'react';
import { CalendarEvent } from '@/lib/types';
import { downloadIcsFile, getGoogleCalendarUrl } from '@/lib/calendarHelper';
import { EVENT_COLORS, getColorTheme } from '@/lib/colorHelper';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileText,
  Download,
  ExternalLink,
  Check,
  Palette,
} from 'lucide-react';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onUpdateColor?: (eventId: string, newColorId: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onUpdateColor,
}) => {
  const [downloaded, setDownloaded] = React.useState(false);

  if (!event) return null;

  const currentTheme = getColorTheme(event.color);

  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  const dateStr = format(startDate, 'yyyy年M月d日 (E)', { locale: ja });
  const timeStr = event.allDay
    ? '終日'
    : `${format(startDate, 'HH:mm')} 〜 ${format(endDate, 'HH:mm')}`;

  const handleDownloadIcs = () => {
    downloadIcsFile(event);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const googleCalUrl = getGoogleCalendarUrl(event);
  const mapSearchUrl = event.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar / drag handle on mobile */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Top row */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
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
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                {event.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
              aria-label="閉じる"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Color Switcher */}
          <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Palette className="w-3.5 h-3.5 text-gray-500" />
              <span>予定のカラー:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {EVENT_COLORS.map((c) => {
                const isSelected = (event.color || 'sky') === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onUpdateColor && onUpdateColor(event.id, c.id)}
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

          {/* Date & Time info */}
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

          {/* Location */}
          {event.location && (
            <div className="flex items-start text-gray-700">
              <MapPin className="w-5 h-5 text-rose-500 mr-2.5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{event.location}</p>
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
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start text-gray-700">
              <FileText className="w-5 h-5 text-gray-400 mr-2.5 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm leading-relaxed whitespace-pre-wrap text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100">
                {event.description}
              </div>
            </div>
          )}

          {/* Mobile Calendar Registration Actions */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              スマホのカレンダーに登録
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* iOS / Standard Calendar Button */}
              <button
                onClick={handleDownloadIcs}
                className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-medium rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition"
              >
                {downloaded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>登録ファイル保存完了</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>iPhone / スマホに追加 (.ics)</span>
                  </>
                )}
              </button>

              {/* Google Calendar Link Button */}
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl shadow-sm active:scale-[0.98] transition"
              >
                <CalendarIcon className="w-5 h-5 text-amber-500" />
                <span>Googleカレンダーに追加</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>

            <p className="text-[11px] text-gray-400 text-center leading-tight">
              ※「iPhone / スマホに追加」をタップするとカレンダーアプリが起動してそのまま保存できます。
            </p>
          </div>
        </div>

        {/* Footer close button */}
        <div className="p-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-center text-sm font-semibold text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-200/60 transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
