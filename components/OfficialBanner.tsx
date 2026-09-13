'use client';

import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PhoneCall, CalendarSync } from 'lucide-react';

interface OfficialBannerProps {
  currentDate?: Date;
  updateDateText?: string;
}

interface OfficialPhoneBannersProps {
  onSyncClick?: () => void;
}

/**
 * Browser-persistent Phone Advertisement Banners & Calendar Sync Button
 * Placed: Consumer Dial | Customer Dial | Calendar Sync Button (with Grandma illustration)
 */
export const OfficialPhoneBanners: React.FC<OfficialPhoneBannersProps> = ({ onSyncClick }) => {
  return (
    <div className="w-full">
      {/* Horizontally scrollable row on mobile, centered single row on desktop.
          Cards are tightly sized so text never wraps (極力狭い枠で文字の折り返しなし). */}
      <div className="flex items-stretch gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:justify-center max-w-4xl mx-auto no-scrollbar">
        {/* 1. ご注文専用ダイヤル (Mauve) */}
        <a
          href="tel:0120371119"
          className="group block w-[190px] shrink-0 border-2 border-[#9f577b] rounded-xl overflow-hidden bg-white shadow-xs hover:shadow-md transition active:scale-[0.98]"
          title="ご注文専用ダイヤルに発信: 0120-371-119"
        >
          <div className="bg-[#9f577b] text-white px-2 py-1 text-center whitespace-nowrap">
            <p className="text-[9px] leading-tight font-medium opacity-90">
              製品のご注文・ご予約・問合せ
            </p>
            <p className="text-[11px] font-black tracking-wide">
              「ご注文専用ダイヤル」
            </p>
          </div>
          <div className="p-1.5 text-center bg-white group-hover:bg-rose-50/40 transition whitespace-nowrap">
            <div className="flex items-center justify-center gap-1 text-sm font-black text-[#b91c1c] tracking-tight leading-snug">
              <PhoneCall className="w-3 h-3 text-[#9f577b] shrink-0" />
              <span>0120-371-119</span>
            </div>
            <p className="text-[9px] text-gray-600 font-semibold mt-0.5 leading-tight">
              受付 平日9:45〜18:00 土〜13:00
            </p>
          </div>
        </a>

        {/* 2. お客さまダイヤル (Navy) */}
        <a
          href="tel:0120950888"
          className="group block w-[185px] shrink-0 border-2 border-[#0f172a] rounded-xl overflow-hidden bg-white shadow-xs hover:shadow-md transition active:scale-[0.98]"
          title="お客さまダイヤルに発信: 0120-950-888"
        >
          <div className="bg-[#0f172a] text-white px-2 py-1 text-center whitespace-nowrap">
            <p className="text-[9px] leading-tight font-medium opacity-90">
              各種変更・お問合せ
            </p>
            <p className="text-[11px] font-black tracking-wide">
              「お客さまダイヤル」
            </p>
          </div>
          <div className="p-1.5 text-center bg-white group-hover:bg-sky-50/40 transition whitespace-nowrap">
            <div className="flex items-center justify-center gap-1 text-sm font-black text-gray-900 tracking-tight leading-snug">
              <PhoneCall className="w-3 h-3 text-[#0f172a] shrink-0" />
              <span>0120-950-888</span>
            </div>
            <p className="text-[9px] text-gray-600 font-semibold mt-0.5 leading-tight">
              受付 平日9:45〜17:30 他
            </p>
          </div>
        </a>

        {/* 3. カレンダー同期ボタン (Compact with Large Icon) */}
        <button
          type="button"
          onClick={onSyncClick}
          className="group flex flex-col items-center justify-center w-[80px] shrink-0 p-1.5 bg-white hover:bg-sky-50/60 border border-slate-300 hover:border-sky-400 rounded-xl transition shadow-2xs hover:shadow-xs active:scale-95 text-center cursor-pointer"
          title="このカレンダー全体をスマホに同期・一括登録"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-100 group-hover:text-sky-700 flex items-center justify-center transition shadow-2xs mb-1 shrink-0">
            <CalendarSync className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black text-slate-700 group-hover:text-sky-700 leading-tight block whitespace-nowrap">
            カレンダー<br />同期
          </span>
        </button>
      </div>
    </div>
  );
};

/**
 * Official FORDAYS Calendar Header for A4 Print / PDF output.
 * Replicates the official design:
 * [Gold title banner: 2026年 11月 フォーデイズ予定表] [Order Dial] [Customer Dial] [Update date box]
 */
export const OfficialPrintHeader: React.FC<OfficialBannerProps> = ({
  currentDate = new Date(),
  updateDateText,
}) => {
  const yearMonthStr = format(currentDate, 'yyyy年 M月', { locale: ja });
  const displayUpdateDate = updateDateText || format(new Date(), 'M月d日更新', { locale: ja });

  return (
    <div className="hidden print:flex items-center justify-between gap-3 w-full border-b-2 border-black pb-2 mb-2">
      {/* 1. Gold Title Banner: Prominent width with large bold text */}
      <div className="bg-[#e59b00] text-black px-6 py-2.5 rounded-xs shadow-none flex-1 max-w-[480px] min-w-[340px] flex items-center justify-center">
        <h1 className="text-xl font-black tracking-widest text-center text-black whitespace-nowrap">
          {yearMonthStr} フォーデイズ予定表
        </h1>
      </div>

      {/* 2. Middle Banners: 1. Order Dial, 2. Customer Dial */}
      <div className="flex items-center gap-3 shrink-0">
        {/* 1. Order Dial (Mauve) */}
        <div className="border border-[#9f577b] rounded overflow-hidden bg-white text-center w-[190px] shrink-0">
          <div className="bg-[#9f577b] text-white px-2 py-0.5 text-[8.5px] leading-tight font-bold whitespace-nowrap">
            製品のご注文・ご予約・お問合せ<br />
            「ご注文専用ダイヤル」
          </div>
          <div className="py-1 px-1 bg-white">
            <div className="text-[14px] font-black text-[#b91c1c] leading-tight tracking-wider whitespace-nowrap">
              0120-371-119
            </div>
            <div className="text-[8px] text-gray-800 font-bold leading-tight whitespace-nowrap mt-0.5">
              受付 平日9:45〜18:00 土曜9:45〜13:00
            </div>
          </div>
        </div>

        {/* 2. Customer Dial (Navy) */}
        <div className="border border-[#0f172a] rounded overflow-hidden bg-white text-center w-[190px] shrink-0">
          <div className="bg-[#0f172a] text-white px-2 py-0.5 text-[8.5px] leading-tight font-bold whitespace-nowrap">
            各種変更・お問合せは<br />
            「お客さまダイヤル」
          </div>
          <div className="py-1 px-1 bg-white">
            <div className="text-[14px] font-black text-black leading-tight tracking-wider whitespace-nowrap">
              0120-950-888
            </div>
            <div className="text-[8px] text-gray-800 font-bold leading-tight whitespace-nowrap mt-0.5">
              受付時間 平日9:45〜17:30 他
            </div>
          </div>
        </div>
      </div>

      {/* 3. Update Date Box: Shows Today's Date */}
      <div className="border border-black px-3 py-1.5 text-center shrink-0">
        <span className="text-xs font-bold text-black tracking-wider whitespace-nowrap">
          {displayUpdateDate}
        </span>
      </div>
    </div>
  );
};
