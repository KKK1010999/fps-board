import type { Metadata } from "next";
import "./globals.css"; 

export const metadata: Metadata = {
  title: "FPS Board",
  description: "FPS募集掲示板",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}