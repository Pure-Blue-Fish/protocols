// ABOUTME: Language toggle component for switching between Hebrew and English
// ABOUTME: Uses URL-based language switching with cookie persistence

"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface LanguageToggleProps {
  currentLang: "he" | "en";
}

export default function LanguageToggle({ currentLang }: LanguageToggleProps) {
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

  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1 gap-0.5 sm:gap-1">
      <button
        onClick={() => switchLanguage("he")}
        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
          currentLang === "he"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <span className="sm:hidden">עב</span>
        <span className="hidden sm:inline">עברית</span>
      </button>
      <button
        onClick={() => switchLanguage("en")}
        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
          currentLang === "en"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <span className="sm:hidden">EN</span>
        <span className="hidden sm:inline">English</span>
      </button>
    </div>
  );
}
