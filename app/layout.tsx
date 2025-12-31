import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 👇 ここがGoogle検索に表示される「看板」になります！
export const metadata: Metadata = {
  title: "FPS募集掲示板 | 完全匿名・登録不要で即募集！",
  description: "Apex、Valorant、OW2の募集掲示板です。ログイン不要、誰でも1秒で書き込める！DiscordIDの交換やランク募集に最適。完全匿名・無料です。",
  keywords: ["Apex募集", "Valorant募集", "OW2募集", "FPS掲示板", "ごく", "フレンド募集"],
  openGraph: {
    title: "FPS募集掲示板 | 完全匿名・登録不要",
    description: "ログインなしで今すぐ募集！Apex/Valo/OW2対応。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}