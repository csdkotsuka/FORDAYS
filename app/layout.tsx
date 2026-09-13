import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORDAYS カレンダー | イベント一覧＆スマホ登録",
  description: "FORDAYSのイベントスケジュール確認とスマホカレンダーへのワンタップ登録アプリ",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0284c7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-sky-100 selection:text-sky-900">
        {children}
      </body>
    </html>
  );
}
