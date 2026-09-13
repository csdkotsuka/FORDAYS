'use client';

import React from 'react';
import { X, ExternalLink, Key, CheckCircle, HelpCircle } from 'lucide-react';

interface ConfigHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMockData: boolean;
}

export const ConfigHelpModal: React.FC<ConfigHelpModalProps> = ({
  isOpen,
  onClose,
  isMockData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-5 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Googleカレンダー連携手順
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-sky-900">
            {isMockData ? (
              <p className="font-semibold">
                💡 現在はサンプル（デモ）データを表示中です。以下の手順でGoogleカレンダーのURLを設定すると、実際のFORDAYSカレンダーの予定が自動で読み込まれます。
              </p>
            ) : (
              <p className="font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Googleカレンダー連携済みです。最新の予定が自動同期されています。
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
              手順1. GoogleカレンダーでiCal URLを取得
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 text-xs sm:text-sm">
              <li>
                パソコンのブラウザで{' '}
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 underline font-medium inline-flex items-center gap-0.5"
                >
                  Googleカレンダー <ExternalLink className="w-3 h-3" />
                </a>{' '}
                を開きます。
              </li>
              <li>
                左側の「マイカレンダー」から「FORDAYS」の右側にある縦3点リーダーをクリックし、<strong>「設定と共有」</strong>を選択します。
              </li>
              <li>
                下部にある「カレンダーの統合」セクションまでスクロールします。
              </li>
              <li>
                <strong>「iCal 形式の非公開 URL」</strong>（または「iCal 形式の公開 URL」）をコピーします。
              </li>
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
              手順2. Vercelの環境変数に設定
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 text-xs sm:text-sm">
              <li>Vercelのプロジェクト設定ダッシュボードを開きます。</li>
              <li><strong>Settings</strong> &gt; <strong>Environment Variables</strong> を選択します。</li>
              <li>
                Keyに <code className="bg-gray-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-xs">GOOGLE_CALENDAR_ICAL_URL</code>、ValueにコピーしたiCal URLを貼り付けて <strong>Save</strong> します。
              </li>
              <li>Redeploy（再デプロイ）すると、本番環境で自動的に予定が読み込まれます！</li>
            </ol>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold">⚠️ 予定のタイトルが「詳細非公開」や「Busy」になる場合：</p>
            <p className="leading-relaxed">
              Googleカレンダーのアクセス権限が「予定の時間枠のみ（詳細を非表示）」になっている可能性があります。
              カレンダー設定の「アクセス権限」で「すべての予定の詳細を表示」にするか、「カレンダーの統合」にある<strong>「iCal 形式の非公開 URL」</strong>を使用してください。
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
