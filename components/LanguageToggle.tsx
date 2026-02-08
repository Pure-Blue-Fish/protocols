// ABOUTME: Language toggle component for switching between Hebrew and English
// ABOUTME: Uses URL-based language switching with cookie persistence

"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface LanguageToggleProps {
  currentLang: "he" | "en";
  dark?: boolean;
}

export default function LanguageToggle({ currentLang, dark }: LanguageToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const switchLanguage = useCallback(
    (lang: "he" | "en") => {
      if (lang === currentLang) return;

      // Set cookie for persistence
      document.cookie = `lang=${lang};path=/;max-age=31536000`;

      // Build new URL with lang param
      const params = new URLSearchParams(searchParams.toString());
      params.set("lang", lang);

      router.push(`${pathname}?${params.toString()}`);
      router.refresh();
    },
    [currentLang, pathname, searchParams, router]
  );

  const containerCls = dark
    ? "flex bg-white/10 rounded-lg p-0.5 sm:p-1 gap-0.5 sm:gap-1"
    : "flex bg-surface-subtle rounded-lg p-0.5 sm:p-1 gap-0.5 sm:gap-1";

  const activeCls = dark
    ? "bg-white/20 text-white shadow-sm"
    : "bg-surface-card text-brand-primary shadow-sm";

  const inactiveCls = dark
    ? "text-white/60 hover:text-white"
    : "text-text-secondary hover:text-text-primary";

  return (
    <div className={containerCls}>
      <button
        onClick={() => switchLanguage("he")}
        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
          currentLang === "he" ? activeCls : inactiveCls
        }`}
      >
        <span className="sm:hidden">עב</span>
        <span className="hidden sm:inline">עברית</span>
      </button>
      <button
        onClick={() => switchLanguage("en")}
        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
          currentLang === "en" ? activeCls : inactiveCls
        }`}
      >
        <span className="sm:hidden">EN</span>
        <span className="hidden sm:inline">English</span>
      </button>
    </div>
  );
}
