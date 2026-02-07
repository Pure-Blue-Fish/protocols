// ABOUTME: Shared responsive navigation component for all pages
// ABOUTME: Desktop: inline nav links. Mobile: hamburger with full-screen overlay.

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UI_STRINGS, type Language } from "@/lib/i18n";
import LogoutButton from "./LogoutButton";

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
      color: "text-gray-500 bg-gray-100 hover:bg-gray-200",
      activeColor: "text-blue-700 bg-blue-100",
    },
    {
      key: "myTasks",
      href: `/my-tasks?lang=${lang}`,
      label: ui.myTasks,
      color: "text-green-600 bg-green-50 hover:bg-green-100",
      activeColor: "text-green-700 bg-green-100",
      workerOnly: true,
    },
    {
      key: "schedule",
      href: `/schedule?lang=${lang}`,
      label: ui.schedule,
      color: "text-purple-600 bg-purple-50 hover:bg-purple-100",
      activeColor: "text-purple-700 bg-purple-100",
    },
    {
      key: "taskStatus",
      href: `/task-status?lang=${lang}`,
      label: ui.taskStatus,
      color: "text-orange-600 bg-orange-50 hover:bg-orange-100",
      activeColor: "text-orange-700 bg-orange-100",
      managerOnly: true,
    },
    {
      key: "employees",
      href: `/employees?lang=${lang}`,
      label: ui.employees,
      color: "text-teal-600 bg-teal-50 hover:bg-teal-100",
      activeColor: "text-teal-700 bg-teal-100",
      managerOnly: true,
    },
    {
      key: "shifts",
      href: `/shifts?lang=${lang}`,
      label: ui.shifts,
      color: "text-pink-600 bg-pink-50 hover:bg-pink-100",
      activeColor: "text-pink-700 bg-pink-100",
      managerOnly: true,
    },
    {
      key: "edit",
      href: `/admin?lang=${lang}`,
      label: ui.edit,
      color: "text-gray-500 bg-gray-100 hover:bg-gray-200",
      activeColor: "text-gray-700 bg-gray-200",
      managerOnly: true,
    },
  ];

  const visibleItems = navItems.filter((item) => {
    if (item.managerOnly && !isManager) return false;
    if (item.workerOnly && (!workerId || workerId === "0")) return false;
    return true;
  });

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Left: logo + name */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={`/?lang=${lang}`}>
              <Image
                src="/logo.png"
                alt="Pure Blue Fish"
                width={100}
                height={40}
                className="h-8 sm:h-10 w-auto"
              />
            </Link>
            {userName && (
              <span className="text-xs text-gray-500">{userName}</span>
            )}
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {visibleItems.map((item) =>
              item.key === currentPage ? (
                <span
                  key={item.key}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium ${item.activeColor}`}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-3 py-1.5 text-xs rounded-lg ${item.color}`}
                >
                  {item.label}
                </Link>
              )
            )}
            <LogoutButton label={ui.logout} />
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
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
        <div className="md:hidden fixed inset-0 top-[57px] bg-white z-30 overflow-y-auto">
          <nav className="px-4 py-4 space-y-2">
            {visibleItems.map((item) =>
              item.key === currentPage ? (
                <span
                  key={item.key}
                  className={`block px-4 py-3 text-sm rounded-lg font-medium ${item.activeColor}`}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 text-sm rounded-lg ${item.color}`}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="pt-4 border-t border-gray-100">
              <LogoutButton label={ui.logout} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
