'use client';

import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PhoneCall } from 'lucide-react';

import Image from 'next/image';

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

        {/* Customer Dial (Navy) */}
        <a
          href="tel:0120950888"
          className="group block border-2 border-[#0f172a] rounded-xl overflow-hidden bg-white shadow-xs hover:shadow-md transition active:scale-[0.98]"
          title="お客さまダイヤルに発信: 0120-950-888"
        >
          {/* Header Bar */}
          <div className="bg-[#0f172a] text-white px-1 py-1 text-center">
            <p className="text-[8.5px] sm:text-[10px] leading-tight font-medium opacity-90 truncate">
              ご注文、各種変更、問合せ
            </p>
            <p className="text-[9.5px] sm:text-xs font-black tracking-wide truncate">
              「お客さまダイヤル」
            </p>
          </div>

          {/* Number & Hours */}
          <div className="p-1 sm:p-2 text-center bg-white group-hover:bg-sky-50/40 transition">
            <div className="flex items-center justify-center gap-0.5 text-[11px] sm:text-sm md:text-base font-black text-gray-900 tracking-tight leading-snug">
              <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#0f172a] shrink-0" />
              <span className="truncate">0120-950-888</span>
            </div>
            <p className="text-[7.5px] sm:text-[9.5px] text-gray-600 font-semibold mt-0.5 truncate">
              受付 平日9:45〜17:30
            </p>
          </div>
        </a>

        {/* Calendar Sync Button (Orange/Amber with Grandma Illustration) */}
        <button
          type="button"
          onClick={onSyncClick}
          className="group block text-left border-2 border-[#d97706] hover:border-[#b45309] rounded-xl overflow-hidden bg-white shadow-xs hover:shadow-md transition active:scale-[0.98] cursor-pointer"
          title="このカレンダー全体をスマホに同期・一括登録"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#d97706] via-[#ea580c] to-[#d97706] text-white px-1 py-1 text-center">
            <p className="text-[8.5px] sm:text-[10px] leading-tight font-medium opacity-95 truncate">
              スマホに予定を入れる
            </p>
            <p className="text-[9.5px] sm:text-xs font-black tracking-wide truncate">
              「カレンダー同期」
            </p>
          </div>

          {/* Body with Grandma Image */}
          <div className="p-1 sm:p-2 bg-white group-hover:bg-amber-50/60 transition flex items-center justify-center gap-1 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg overflow-hidden border border-amber-300 shrink-0 shadow-2xs bg-amber-50">
              <Image
                src="/calendar_sync_obachan.jpg"
                alt="おばあちゃんでもわかるカレンダー同期"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left leading-tight min-w-0 flex-1">
              <div className="text-[10.5px] sm:text-xs md:text-sm font-black text-amber-900 group-hover:text-amber-700 transition truncate">
                カレンダー同期
              </div>
              <p className="text-[7.5px] sm:text-[9px] text-amber-700 font-bold truncate">
                スマホに一括登録
              </p>
            </div>
          </div>
        </button>
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
