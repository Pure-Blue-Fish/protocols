// ABOUTME: Fixed bottom tab bar for worker mobile navigation
// ABOUTME: 3 tabs: Protocols, Schedule, My Tasks. md:hidden. Safe area padding.

"use client";

import Link from "next/link";
import { UI_STRINGS, type Language } from "@/lib/i18n";

type Page = "protocols" | "schedule" | "myTasks";

interface BottomNavProps {
  lang: Language;
  currentPage: Page;
}

const TABS: { page: Page; href: string; labelKey: keyof typeof UI_STRINGS.he }[] = [
  { page: "protocols", href: "/", labelKey: "protocols" },
  { page: "schedule", href: "/schedule", labelKey: "schedule" },
  { page: "myTasks", href: "/my-tasks", labelKey: "myTasks" },
];

function TabIcon({ page, active }: { page: Page; active: boolean }) {
  const cls = `w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`;

  switch (page) {
    case "protocols":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "schedule":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "myTasks":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
  }
}

export default function BottomNav({ lang, currentPage }: BottomNavProps) {
  const ui = UI_STRINGS[lang];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 md:hidden safe-area-pb no-print">
      <div className="flex items-center justify-around h-14">
        {TABS.map(({ page, href, labelKey }) => {
          const active = page === currentPage;
          return (
            <Link
              key={page}
              href={`${href}?lang=${lang}`}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <TabIcon page={page} active={active} />
              <span className={`text-[10px] mt-0.5 ${active ? "font-medium" : ""}`}>
                {ui[labelKey]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
