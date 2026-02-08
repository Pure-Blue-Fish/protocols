// ABOUTME: Shared responsive navigation component for all pages
// ABOUTME: Desktop: inline nav links. Mobile: hamburger with full-screen overlay.

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UI_STRINGS, type Language } from "@/lib/i18n";
import LogoutButton from "./LogoutButton";
import LanguageToggle from "./LanguageToggle";

type PageKey =
  | "protocols"
  | "myTasks"
  | "schedule"
  | "taskStatus"
  | "employees"
  | "shifts"
  | "edit";

interface NavItem {
  key: PageKey;
  href: string;
  label: string;
  color: string;
  activeColor: string;
  managerOnly?: boolean;
  workerOnly?: boolean;
}

interface MobileNavProps {
  lang: Language;
  userName: string;
  currentPage: PageKey;
  isManager: boolean;
  workerId?: string | null;
}

export default function MobileNav({
  lang,
  userName,
  currentPage,
  isManager,
  workerId,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const ui = UI_STRINGS[lang];

  const navItems: NavItem[] = [
    {
      key: "protocols",
      href: `/?lang=${lang}`,
      label: ui.protocols,
      color: "text-white/70 hover:text-white hover:bg-white/10",
      activeColor: "text-white bg-white/15 font-medium",
    },
    {
      key: "myTasks",
      href: `/my-tasks?lang=${lang}`,
      label: ui.myTasks,
      color: "text-white/70 hover:text-white hover:bg-white/10",
      activeColor: "text-white bg-white/15 font-medium",
      workerOnly: true,
    },
    {
      key: "schedule",
      href: `/schedule?lang=${lang}`,
      label: ui.schedule,
      color: "text-white/70 hover:text-white hover:bg-white/10",
      activeColor: "text-white bg-white/15 font-medium",
    },
    {
      key: "taskStatus",
      href: `/task-status?lang=${lang}`,
      label: ui.taskStatus,
      color: "text-white/70 hover:text-white hover:bg-white/10",
      activeColor: "text-white bg-white/15 font-medium",
      managerOnly: true,
    },
    {
      key: "employees",
      href: `/employees?lang=${lang}`,
      label: ui.employees,
      color: "text-white/70 hover:text-white hover:bg-white/10",
      activeColor: "text-white bg-white/15 font-medium",
      managerOnly: true,
    },
    {
      key: "shifts",
      href: `/shifts?lang=${lang}`,
      label: ui.shifts,
      color: "text-white/70 hover:text-white hover:bg-white/10",
      activeColor: "text-white bg-white/15 font-medium",
      managerOnly: true,
    },
    {
      key: "edit",
      href: `/admin?lang=${lang}`,
      label: ui.edit,
      color: "text-white/70 hover:text-white hover:bg-white/10",
      activeColor: "text-white bg-white/15 font-medium",
      managerOnly: true,
    },
  ];

  const visibleItems = navItems.filter((item) => {
    if (item.managerOnly && !isManager) return false;
    if (item.workerOnly && (!workerId || workerId === "0")) return false;
    return true;
  });

  return (
    <header className="bg-gradient-to-r from-header-from to-header-to shadow-elevated sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Left: logo + name */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={`/?lang=${lang}`} className="bg-white/95 rounded-lg p-1.5">
              <Image
                src="/logo.png"
                alt="Pure Blue Fish"
                width={100}
                height={40}
                className="h-6 sm:h-8 w-auto"
              />
            </Link>
            {userName && (
              <span className="text-xs text-white/70">{userName}</span>
            )}
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5">
            {visibleItems.map((item) =>
              item.key === currentPage ? (
                <span
                  key={item.key}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${item.activeColor}`}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${item.color}`}
                >
                  {item.label}
                </Link>
              )
            )}
            <LanguageToggle currentLang={lang} dark />
            <LogoutButton label={ui.logout} dark />
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-white/80 hover:bg-white/10 rounded-lg"
            aria-label={ui.menu}
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-surface-card z-30 overflow-y-auto">
          <nav className="px-4 py-4 space-y-2">
            {visibleItems.map((item) =>
              item.key === currentPage ? (
                <span
                  key={item.key}
                  className="block px-4 py-3 text-sm rounded-lg font-medium text-brand-primary bg-brand-primary-light"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm rounded-lg text-text-secondary hover:bg-surface-subtle"
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
              <LanguageToggle currentLang={lang} />
              <LogoutButton label={ui.logout} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
