'use client';

import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PhoneCall } from 'lucide-react';

interface OfficialBannerProps {
  currentDate?: Date;
  updateDateText?: string;
}

/**
 * Browser-persistent Phone Advertisement Banners (Green & Navy)
 * Optimized for smartphones (side-by-side touch-friendly cards with tel: links) and desktop.
 */
export const OfficialPhoneBanners: React.FC = () => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-2xl mx-auto">
        {/* Consumer Consultation Dial (Green) */}
        <a
          href="tel:0120033007"
          className="group block border-2 border-[#004d25] rounded-xl overflow-hidden bg-white shadow-xs hover:shadow-md transition active:scale-[0.98]"
          title="消費者相談ダイヤルに発信: 0120-033-007"
        >
          {/* Header Bar */}
          <div className="bg-[#004d25] text-white px-1.5 py-1 text-center">
            <p className="text-[9px] sm:text-[10px] leading-tight font-medium opacity-90 truncate">
              気になることはお気軽に
            </p>
            <p className="text-[10px] sm:text-xs font-black tracking-wide">
              「消費者相談ダイヤル」
            </p>
          </div>

          {/* Number & Hours */}
          <div className="p-1 sm:p-2 text-center bg-white group-hover:bg-emerald-50/40 transition">
            <div className="flex items-center justify-center gap-0.5 text-xs sm:text-base font-black text-gray-900 tracking-tight leading-snug">
              <PhoneCall className="w-3 h-3 text-[#004d25] shrink-0 sm:hidden" />
              <span>0120-033-</span>
              <span className="text-[#dc2626] font-black">007</span>
            </div>
            <p className="text-[8px] sm:text-[10px] text-gray-600 font-semibold mt-0.5 truncate">
              受付時間 平日10:00〜17:00
            </p>
          </div>
        </a>

        {/* Customer Dial (Navy) */}
        <a
          href="tel:0120950888"
          className="group block border-2 border-[#0f172a] rounded-xl overflow-hidden bg-white shadow-xs hover:shadow-md transition active:scale-[0.98]"
          title="お客さまダイヤルに発信: 0120-950-888"
        >
          {/* Header Bar */}
          <div className="bg-[#0f172a] text-white px-1.5 py-1 text-center">
            <p className="text-[9px] sm:text-[10px] leading-tight font-medium opacity-90 truncate">
              ご注文、各種変更、お問合せ
            </p>
            <p className="text-[10px] sm:text-xs font-black tracking-wide">
              「お客さまダイヤル」
            </p>
          </div>

          {/* Number & Hours */}
          <div className="p-1 sm:p-2 text-center bg-white group-hover:bg-sky-50/40 transition">
            <div className="flex items-center justify-center gap-0.5 text-xs sm:text-base font-black text-gray-900 tracking-tight leading-snug">
              <PhoneCall className="w-3 h-3 text-[#0f172a] shrink-0 sm:hidden" />
              <span>0120-950-888</span>
            </div>
            <p className="text-[8px] sm:text-[10px] text-gray-600 font-semibold mt-0.5 truncate">
              受付時間 平日9:45〜17:30 他
            </p>
          </div>
        </a>
      </div>
    </div>
  );
};

/**
 * Official FORDAYS Calendar Header for A4 Print / PDF output.
 * Replicates the uploaded image:
 * [Gold title banner: 2026年 11月 フォーデイズ予定表] [Green Consumer Dial] [Navy Customer Dial] [Update date box]
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

      {/* 2. Middle Banners: Consumer Consultation Dial & Customer Dial */}
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

        {/* Customer Dial */}
        <div className="border border-[#0f172a] rounded overflow-hidden bg-white text-center w-[215px] shrink-0">
          <div className="bg-[#0f172a] text-white px-1.5 py-0.5 text-[8.5px] leading-tight font-bold whitespace-nowrap">
            ご注文、各種変更、お問合せは<br />
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
