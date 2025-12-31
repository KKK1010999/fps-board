import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FPS募集掲示板 | 完全匿名・登録不要で即募集！",
  description: "Apex、Valorant、OW2の募集掲示板です。ログイン不要、誰でも1秒で書き込める！DiscordIDの交換やランク募集に最適。完全匿名・無料です。",
  // 👇 ここにGoogleの合言葉を入れます！
  verification: {
    google: "baRaDgm8AK-OEm5V2", 
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