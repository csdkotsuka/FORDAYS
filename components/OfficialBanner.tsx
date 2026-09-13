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
  // Common dial card JSX for reuse
  const orderDial = (
    <a
      href="tel:0120371119"
      className="group block border-2 border-[#9f577b] rounded-xl overflow-hidden bg-white shadow-xs hover:shadow-md transition active:scale-[0.98] h-full"
      title="ご注文専用ダイヤルに発信: 0120-371-119"
    >
      <div className="bg-[#9f577b] text-white px-1.5 py-1 text-center">
        <p className="text-[8px] sm:text-[9.5px] leading-tight font-medium opacity-90 truncate">
          製品のご注文・ご予約・問合せ
        </p>
        <p className="text-[9.5px] sm:text-xs font-black tracking-wide truncate">
          「ご注文専用ダイヤル」
        </p>
      </div>
      <div className="p-1 sm:p-2 text-center bg-white group-hover:bg-rose-50/40 transition">
        <div className="flex items-center justify-center gap-0.5 text-xs sm:text-sm md:text-base font-black text-[#b91c1c] tracking-tight leading-snug">
          <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#9f577b] shrink-0" />
          <span className="truncate">0120-371-119</span>
        </div>
        <p className="text-[7.5px] sm:text-[9.5px] text-gray-600 font-semibold mt-0.5 truncate">
          受付 平日9:45〜18:00 土〜13:00
        </p>
      </div>
    </a>
  );

  const customerDial = (
    <a
      href="tel:0120950888"
      className="group block border-2 border-[#0f172a] rounded-xl overflow-hidden bg-white shadow-xs hover:shadow-md transition active:scale-[0.98] h-full"
      title="お客さまダイヤルに発信: 0120-950-888"
    >
      <div className="bg-[#0f172a] text-white px-1.5 py-1 text-center">
        <p className="text-[8px] sm:text-[9.5px] leading-tight font-medium opacity-90 truncate">
          各種変更・お問合せ
        </p>
        <p className="text-[9.5px] sm:text-xs font-black tracking-wide truncate">
          「お客さまダイヤル」
        </p>
      </div>
      <div className="p-1 sm:p-2 text-center bg-white group-hover:bg-sky-50/40 transition">
        <div className="flex items-center justify-center gap-0.5 text-xs sm:text-sm md:text-base font-black text-gray-900 tracking-tight leading-snug">
          <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#0f172a] shrink-0" />
          <span className="truncate">0120-950-888</span>
        </div>
        <p className="text-[7.5px] sm:text-[9.5px] text-gray-600 font-semibold mt-0.5 truncate">
          受付 平日9:45〜17:30 他
        </p>
      </div>
    </a>
  );

  const consumerDial = (
    <a
      href="tel:0120033007"
      className="group block border-2 border-[#004d25] rounded-xl overflow-hidden bg-white shadow-xs hover:shadow-md transition active:scale-[0.98] h-full"
      title="消費者相談ダイヤルに発信: 0120-033-007"
    >
      <div className="bg-[#004d25] text-white px-1.5 py-1 text-center">
        <p className="text-[8px] sm:text-[9.5px] leading-tight font-medium opacity-90 truncate">
          気になることはお気軽に
        </p>
        <p className="text-[9.5px] sm:text-xs font-black tracking-wide truncate">
          「消費者相談」
        </p>
      </div>
      <div className="p-1 sm:p-2 text-center bg-white group-hover:bg-emerald-50/40 transition">
        <div className="flex items-center justify-center gap-0.5 text-xs sm:text-sm md:text-base font-black text-gray-900 tracking-tight leading-snug">
          <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#004d25] shrink-0" />
          <span className="truncate">0120-033-</span>
          <span className="text-[#dc2626] font-black">007</span>
        </div>
        <p className="text-[7.5px] sm:text-[9.5px] text-gray-600 font-semibold mt-0.5 truncate">
          受付 平日10:00〜17:00
        </p>
      </div>
    </a>
  );

  const syncButton = (
    <button
      type="button"
      onClick={onSyncClick}
      className="group flex flex-col items-center justify-center p-1.5 bg-white hover:bg-sky-50/60 border border-slate-300 hover:border-sky-400 rounded-xl transition shadow-2xs hover:shadow-xs active:scale-95 text-center cursor-pointer h-full shrink-0 w-16 sm:w-20 md:w-22"
      title="このカレンダー全体をスマホに同期・一括登録"
    >
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-100 group-hover:text-sky-700 flex items-center justify-center transition shadow-2xs mb-0.5 shrink-0">
        <CalendarSync className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
      </div>
      <span className="text-[9.5px] sm:text-[10.5px] font-black text-slate-700 group-hover:text-sky-700 leading-tight block">
        カレンダー<br />同期
      </span>
    </button>
  );

  return (
    <div className="w-full">
      {/* Desktop / Tablet Layout (md and up): 3 Phone Banners in 1-2-3 order + Compact Sync Button with large icon */}
      <div className="hidden md:flex items-stretch gap-2.5 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-2.5 flex-1">
          {/* 1. ご注文専用ダイヤル */}
          {orderDial}
          {/* 2. お客さまダイヤル */}
          {customerDial}
          {/* 3. 消費者相談 */}
          {consumerDial}
        </div>

        {/* Compact Sync Button (Large icon, small footprint) */}
        {syncButton}
      </div>

      {/* Mobile Layout (< md): 
          Row 1: [1. ご注文専用ダイヤル] [2. お客さまダイヤル] (Large & Prominent)
          Row 2: [3. 消費者相談 (flex-1)] [カレンダー同期 (compact)]
      */}
      <div className="md:hidden space-y-1.5 max-w-lg mx-auto">
        {/* Row 1: Order & Customer Dials */}
        <div className="grid grid-cols-2 gap-1.5">
          {orderDial}
          {customerDial}
        </div>

        {/* Row 2: Consumer Consultation + Sync Button */}
        <div className="flex items-stretch gap-1.5">
          <div className="flex-1">
            {consumerDial}
          </div>
          {syncButton}
        </div>
      </div>
    </div>
  );
};

/**
 * Official FORDAYS Calendar Header for A4 Print / PDF output.
 * Replicates the uploaded image:
 * [Gold title banner: 2026年 11月 フォーデイズ予定表] [Order Dial] [Customer Dial] [Consumer Dial] [Update date box]
 */
export const OfficialPrintHeader: React.FC<OfficialBannerProps> = ({
  currentDate = new Date(),
  updateDateText,
}) => {
  const yearMonthStr = format(currentDate, 'yyyy年 M月', { locale: ja });
  const displayUpdateDate = updateDateText || format(new Date(), 'M月d日更新', { locale: ja });

  return (
    <div className="hidden print:flex items-center justify-between gap-3 w-full border-b-2 border-black pb-2 mb-2">
      {/* 1. Gold Title Banner: Prominent width (~2x) with large bold text */}
      <div className="bg-[#e59b00] text-black px-4 py-2 rounded-xs shadow-none flex-1 max-w-[420px] min-w-[300px] flex items-center justify-center">
        <h1 className="text-lg font-black tracking-widest text-center text-black whitespace-nowrap">
          {yearMonthStr} フォーデイズ予定表
        </h1>
      </div>

      {/* 2. Middle Banners: 1. Order Dial, 2. Customer Dial, 3. Consumer Consultation Dial */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 1. Order Dial (Mauve) */}
        <div className="border border-[#9f577b] rounded overflow-hidden bg-white text-center w-[165px] shrink-0">
          <div className="bg-[#9f577b] text-white px-1 py-0.5 text-[8px] leading-tight font-bold whitespace-nowrap">
            製品のご注文・ご予約・お問合せ<br />
            「ご注文専用ダイヤル」
          </div>
          <div className="py-0.5 px-1 bg-white">
            <div className="text-[13px] font-black text-[#b91c1c] leading-tight tracking-wider whitespace-nowrap">
              0120-371-119
            </div>
            <div className="text-[7.5px] text-gray-800 font-bold leading-tight whitespace-nowrap mt-0.5">
              受付 平日9:45〜18:00 土曜9:45〜13:00
            </div>
          </div>
        </div>

        {/* 2. Customer Dial (Navy) */}
        <div className="border border-[#0f172a] rounded overflow-hidden bg-white text-center w-[165px] shrink-0">
          <div className="bg-[#0f172a] text-white px-1 py-0.5 text-[8px] leading-tight font-bold whitespace-nowrap">
            各種変更・お問合せは<br />
            「お客さまダイヤル」
          </div>
          <div className="py-0.5 px-1 bg-white">
            <div className="text-[13px] font-black text-black leading-tight tracking-wider whitespace-nowrap">
              0120-950-888
            </div>
            <div className="text-[7.5px] text-gray-800 font-bold leading-tight whitespace-nowrap mt-0.5">
              受付時間 平日9:45〜17:30 他
            </div>
          </div>
        </div>

        {/* 3. Consumer Consultation Dial (Green) */}
        <div className="border border-[#004d25] rounded overflow-hidden bg-white text-center w-[165px] shrink-0">
          <div className="bg-[#004d25] text-white px-1 py-0.5 text-[8px] leading-tight font-bold whitespace-nowrap">
            気になることはお気軽にご相談ください<br />
            「消費者相談ダイヤル」
          </div>
          <div className="py-0.5 px-1 bg-white">
            <div className="text-[13px] font-black text-black leading-tight tracking-wider whitespace-nowrap">
              0120-033-<span className="text-[#dc2626]">007</span>
            </div>
            <div className="text-[7.5px] text-gray-800 font-bold leading-tight whitespace-nowrap mt-0.5">
              受付時間 平日10:00〜17:00
            </div>
          </div>
        </div>
      </div>

      {/* 3. Update Date Box: Shows Today's Date */}
      <div className="border border-black px-2.5 py-1 text-center shrink-0">
        <span className="text-[11px] font-bold text-black tracking-wider whitespace-nowrap">
          {displayUpdateDate}
        </span>
      </div>
    </div>
  );
};
