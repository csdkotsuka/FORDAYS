'use client';

import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '@/lib/types';
import { downloadAllEventsIcsFile } from '@/lib/calendarHelper';
import {
  X,
  Smartphone,
  CheckCircle2,
  Download,
  Calendar as CalendarIcon,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface SyncCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
}

export const SyncCalendarModal: React.FC<SyncCalendarModalProps> = ({
  isOpen,
  onClose,
  events,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDownloaded(false);
      setCopied(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownloadAll = () => {
    downloadAllEventsIcsFile(events);
    setDownloaded(true);
  };

  const handleCopyFeedUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fordays.vercel.app';
    const feedUrl = `${origin}/api/calendar/export`;
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity"
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle on mobile */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-xs shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  カレンダー連携
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                カレンダー全体をスマホに同期
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition"
            title="閉じる"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Visual card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-slate-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>ワンタップで一括登録！</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 leading-snug">
                このカレンダーの予定（全 <span className="text-sky-700 font-bold text-base">{events.length}</span> 件）を、お使いのスマホのカレンダーにまとめて保存できます。
              </p>
            </div>
          </div>

          {/* Main Action: 1-Tap Save to iPhone / Android */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleDownloadAll}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-md active:scale-[0.98] transition flex items-center justify-center gap-2.5 font-bold text-sm sm:text-base"
            >
              <Download className="w-5 h-5 shrink-0" />
              <span>① スマホにまとめて全部入れる</span>
            </button>

            {downloaded && (
              <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-2.5 text-emerald-900 animate-in fade-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs sm:text-sm font-bold leading-tight">
                  <p className="text-emerald-800 font-black">予定ファイルを保存しました！</p>
                  <p className="text-emerald-700 text-[11px] sm:text-xs font-medium mt-0.5">
                    画面に出てくる「すべて追加」を押すと、スマホのカレンダーに入ります。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Simple 3 Steps */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-3">
            <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <span>🔰</span>
              <span>使いかた（３ステップ）</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-xs space-y-1">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center mx-auto">
                  1
                </div>
                <p className="text-[11px] font-bold text-gray-800 leading-tight">
                  上のボタンを押す
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-xs space-y-1">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center mx-auto">
                  2
                </div>
                <p className="text-[11px] font-bold text-gray-800 leading-tight">
                  画面の「すべて追加」を押す
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-xs space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center mx-auto">
                  ✓
                </div>
                <p className="text-[11px] font-bold text-emerald-700 leading-tight">
                  スマホに全部入って完了！
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Option: Copy feed link for auto-updating calendar */}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <p className="text-[11px] text-gray-500 font-bold">その他の連携方法</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyFeedUrl}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">カレンダーURLをコピーしました！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-500" />
                    <span>自動更新用カレンダーURLをコピー</span>
                  </>
                )}
              </button>

              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 py-2.5 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition shrink-0"
              >
                <CalendarIcon className="w-4 h-4 text-amber-600" />
                <span>Googleカレンダー</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Close Button */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-center text-sm font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl transition shadow-xs active:scale-[0.99]"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
