// ABOUTME: Root layout with dynamic RTL/LTR support based on language
// ABOUTME: Main layout for protocol viewer with i18n

import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Protocols - Pure Blue Fish",
  description: "Farm worker checklists",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as "he" | "en") || "he";
  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir}>
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
