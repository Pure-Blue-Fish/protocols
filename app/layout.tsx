// ABOUTME: Root layout with RTL Hebrew support
// ABOUTME: Main layout for protocol viewer

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "פרוטוקולים - Pure Blue Fish",
  description: "צ'קליסטים לעובדי החווה",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
