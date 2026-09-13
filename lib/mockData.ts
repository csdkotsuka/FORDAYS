import { CalendarEvent } from './types';
import { addDays, format, setHours, setMinutes, startOfMonth } from 'date-fns';

export function getMockEvents(): CalendarEvent[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Helper to format ISO
  const createEvent = (
    id: string,
    day: number,
    startH: number,
    startM: number,
    endH: number,
    endM: number,
    title: string,
    description: string,
    location: string,
    allDay = false
  ): CalendarEvent => {
    const startDate = new Date(year, month, day, startH, startM, 0);
    const endDate = new Date(year, month, day, endH, endM, 0);
    return {
      id,
      title,
      description,
      location,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay,
      source: 'mock',
    };
  };

  return [
    createEvent(
      'mock-1',
      5,
      13, 0, 15, 0,
      'FORDAYS 全国定例セミナー',
      '全国のメンバーと繋がる月例オンライン＆オフラインセミナーです。\n最新の製品情報と今後のビジョンについて共有します。',
      '東京本社セミナールーム / オンラインZoom'
    ),
    createEvent(
      'mock-2',
      10,
      10, 30, 12, 0,
      'ナチュラルDNコラーゲン 勉強会',
      '核酸ドリンクの特長や健康・栄養学に関する特別勉強会。\nゲストスピーカーによる特別講義あり。',
      'オンライン配信（URLは参加者へ別途案内）'
    ),
    createEvent(
      'mock-3',
      15,
      14, 0, 16, 30,
      '新製品発表＆体験ミーティング',
      '新商品のお披露目とタッチ＆トライセッションです。\nサンプルの配布も行いますので是非ご参加ください。',
      '大阪支社 イベントホール'
    ),
    createEvent(
      'mock-4',
      20,
      19, 0, 20, 30,
      'FORDAYS ユースリーダーズミーティング',
      '次世代リーダー育成のためのワークショップとディスカッション。',
      'オンラインZoom'
    ),
    createEvent(
      'mock-5',
      25,
      9, 0, 18, 0,
      'FORDAYS フェスタ 2026',
      '年一度のビッグイベント！表彰式および特別ゲストによるキーノートスピーチ。\n事前登録が必要です。',
      'パシフィコ横浜 展示ホールA',
      true
    ),
    createEvent(
      'mock-6',
      28,
      15, 0, 17, 0,
      '月次活動報告＆懇親会',
      '今月の活動振り返りと目標設定、メンバー同士の懇親会。軽食あり。',
      '福岡サロン'
    ),
  ];
}
