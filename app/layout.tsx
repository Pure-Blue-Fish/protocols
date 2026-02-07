// ABOUTME: Root layout with dynamic RTL/LTR support based on language
// ABOUTME: Main layout for protocol viewer with i18n

import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { UI_STRINGS, type Language } from "@/lib/protocols";
import ChatWidget from "@/components/ChatWidget";
import { ToastProvider } from "@/components/ui/Toast";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

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
  const lang = (cookieStore.get("lang")?.value as Language) || "he";
  const dir = lang === "he" ? "rtl" : "ltr";
  const ui = UI_STRINGS[lang];

  return (
    <html lang={lang} dir={dir}>
      <body className="antialiased bg-gray-50 text-gray-900">
        <ToastProvider>
          {children}
        </ToastProvider>
        <ChatWidget
          lang={lang}
          title={ui.chatTitle}
          placeholder={ui.chatPlaceholder}
        />
      </body>
    </html>
  );
}
