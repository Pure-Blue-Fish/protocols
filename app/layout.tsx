// ABOUTME: Root layout with dynamic RTL/LTR support based on language
// ABOUTME: Main layout for protocol viewer with i18n

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import { UI_STRINGS, type Language } from "@/lib/protocols";
import ChatWidget from "@/components/ChatWidget";
import { ToastProvider } from "@/components/ui/Toast";

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600"],
});

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
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased bg-surface-page text-text-primary`}>
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
