import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FPS募集掲示板 | ランク・条件で即マッチング",
  description: "APEX、VALORANT、OW2の募集掲示板。社会人限定、聞き専OKなど細かい条件で検索可能。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}