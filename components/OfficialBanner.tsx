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
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 max-w-4xl mx-auto">
        {/* Consumer Consultation Dial (Green) */}
        <a
          href="tel:0120033007"
          className="group block border-2 border-[#004d25] rounded-xl overflow-hidden bg-white shadow-xs hover:shadow-md transition active:scale-[0.98]"
          title="消費者相談ダイヤルに発信: 0120-033-007"
        >
          {/* Header Bar */}
          <div className="bg-[#004d25] text-white px-1 py-1 text-center">
            <p className="text-[8.5px] sm:text-[10px] leading-tight font-medium opacity-90 truncate">
              気になることはお気軽に
            </p>
            <p className="text-[9.5px] sm:text-xs font-black tracking-wide truncate">
              「消費者相談」
            </p>
          </div>

          {/* Number & Hours */}
          <div className="p-1 sm:p-2 text-center bg-white group-hover:bg-emerald-50/40 transition">
            <div className="flex items-center justify-center gap-0.5 text-[11px] sm:text-sm md:text-base font-black text-gray-900 tracking-tight leading-snug">
              <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#004d25] shrink-0" />
              <span className="truncate">0120-033-</span>
              <span className="text-[#dc2626] font-black">007</span>
            </div>
            <p className="text-[7.5px] sm:text-[9.5px] text-gray-600 font-semibold mt-0.5 truncate">
              受付 平日10:00〜17:00
            </p>
          </div>
        </a>

        {/* Order Dial (Mauve / Dusty Rose) */}
        <a
          href="tel:0120371119"
          className="group block border-2 border-[#9f577b] rounded-xl overflow-hidden bg-white shadow-xs hover:shadow-md transition active:scale-[0.98]"
          title="ご注文専用ダイヤルに発信: 0120-371-119"
        >
          {/* Header Bar */}
          <div className="bg-[#9f577b] text-white px-1 py-1 text-center">
            <p className="text-[8.5px] sm:text-[10px] leading-tight font-medium opacity-90 truncate">
              ご注文・各種変更・問合せ
            </p>
            <p className="text-[9.5px] sm:text-xs font-black tracking-wide truncate">
              「ご注文専用ダイヤル」
            </p>
          </div>

          {/* Number & Hours */}
          <div className="p-1 sm:p-2 text-center bg-white group-hover:bg-rose-50/40 transition">
            <div className="flex items-center justify-center gap-0.5 text-[11px] sm:text-sm md:text-base font-black text-[#b91c1c] tracking-tight leading-snug">
              <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#9f577b] shrink-0" />
              <span className="truncate">0120-371-119</span>
            </div>
            <p className="text-[7.5px] sm:text-[9.5px] text-gray-600 font-semibold mt-0.5 truncate">
              受付 平日9:45〜18:00 土〜13:00
            </p>
          </div>
        </a>

        {/* Calendar Sync Utility Button (Subdued, distinct utility taste) */}
        <button
          type="button"
          onClick={onSyncClick}
          className="group flex flex-col items-center justify-center p-1.5 sm:p-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-300 hover:border-slate-400 rounded-xl transition shadow-2xs active:scale-[0.98] cursor-pointer text-center"
          title="このカレンダー全体をスマホに同期・一括登録"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:text-slate-900 group-hover:border-slate-400 flex items-center justify-center shadow-2xs transition mb-1 shrink-0">
            <CalendarSync className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-700 group-hover:text-slate-900 leading-tight block">
            カレンダー同期
          </span>
          <span className="text-[7.5px] sm:text-[9px] text-slate-500 font-medium leading-tight block mt-0.5">
            スマホに一括保存
          </span>
        </button>
      </div>
    </div>
  );
};

/**
 * Official FORDAYS Calendar Header for A4 Print / PDF output.
 * Replicates the uploaded image:
 * [Gold title banner: 2026年 11月 フォーデイズ予定表] [Green Consumer Dial] [Mauve Order Dial] [Update date box]
 */
export const OfficialPrintHeader: React.FC<OfficialBannerProps> = ({
  currentDate = new Date(),
  updateDateText,
}) => {
  const yearMonthStr = format(currentDate, 'yyyy年 M月', { locale: ja });
  const displayUpdateDate = updateDateText || format(new Date(), 'M月d日更新', { locale: ja });

  return (
    <div className="hidden print:flex items-center justify-between gap-4 w-full border-b-2 border-black pb-2 mb-2">
      {/* 1. Gold Title Banner: Prominent width (~2x) with large bold text */}
      <div className="bg-[#e59b00] text-black px-6 py-2.5 rounded-xs shadow-none flex-1 max-w-[500px] min-w-[360px] flex items-center justify-center">
        <h1 className="text-xl font-black tracking-widest text-center text-black whitespace-nowrap">
          {yearMonthStr} フォーデイズ予定表
        </h1>
      </div>

      {/* 2. Middle Banners: Consumer Consultation Dial & Order Dial */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Consumer Consultation Dial */}
        <div className="border border-[#004d25] rounded overflow-hidden bg-white text-center w-[215px] shrink-0">
          <div className="bg-[#004d25] text-white px-1.5 py-0.5 text-[8.5px] leading-tight font-bold whitespace-nowrap">
            気になることはお気軽にご相談ください<br />
            「消費者相談ダイヤル」
          </div>
          <div className="py-1 px-1 bg-white">
            <div className="text-[14px] font-black text-black leading-tight tracking-wider whitespace-nowrap">
              0120-033-<span className="text-[#dc2626]">007</span>
            </div>
            <div className="text-[8px] text-gray-800 font-bold leading-tight whitespace-nowrap mt-0.5">
              受付時間 平日10:00〜17:00
            </div>
          </div>
        </div>

        {/* Order Dial (Mauve) */}
        <div className="border border-[#9f577b] rounded overflow-hidden bg-white text-center w-[215px] shrink-0">
          <div className="bg-[#9f577b] text-white px-1.5 py-0.5 text-[8.5px] leading-tight font-bold whitespace-nowrap">
            ご注文、各種変更、お問合せは<br />
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
