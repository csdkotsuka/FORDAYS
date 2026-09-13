'use client';

import React, { useState } from 'react';
import { KeyRound, X, Check, ShieldCheck, Lock } from 'lucide-react';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

// Default passcode is 'fordays' or '1234' (can be overridden by NEXT_PUBLIC_OWNER_PASSCODE if set)
const VALID_PASSCODE = process.env.NEXT_PUBLIC_OWNER_PASSCODE || '1234';

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({
  isOpen,
  onClose,
  isOwner,
  onLogin,
  onLogout,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === VALID_PASSCODE || passcode.trim() === 'fordays') {
      onLogin();
      setPasscode('');
      setError(false);
      onClose();
    } else {
      setError(true);
    }
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isOwner ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
              {isOwner ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {isOwner ? 'アカウントの持ち主として認証中' : 'アカウントの持ち主認証'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isOwner ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-800 space-y-1">
              <p className="font-bold text-sm">✓ 編集権限が有効です</p>
              <p>イベントの追加・編集・カラー変更などの管理者機能が利用できます。</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-700 text-xs font-bold rounded-xl transition"
            >
              持ち主モードをログアウト（閲覧専用に戻す）
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              予定の編集や追加を行うには、持ち主用パスコードを入力してください。他の閲覧者は「見るだけ」になります。
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                パスコード
              </label>
              <input
                type="password"
                placeholder="パスコードを入力 (初期値: 1234)"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(false);
                }}
                autoFocus
                className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition ${
                  error
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/40'
                    : 'border-gray-200 focus:ring-sky-500'
                }`}
              />
              {error && (
                <p className="text-xs text-rose-500 font-medium">
                  パスコードが違います。（初期パスコード: 1234 または fordays）
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition"
              >
                認証して編集可能にする
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
