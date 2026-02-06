// ABOUTME: Manager schedule view - AI chat + weekly calendar
// ABOUTME: Split layout: chat on right (RTL), calendar on left

"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import ScheduleChat from "@/components/ScheduleChat";
import { UI_STRINGS, type Language } from "@/lib/i18n";

function getSundayOfWeek(): string {
  const now = new Date();
  const israelDate = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })
  );
  const day = israelDate.getDay();
  israelDate.setDate(israelDate.getDate() - day);
  return israelDate.toISOString().split("T")[0];
}

export default function SchedulePage() {
  const [lang] = useState<Language>("he");
  const [week, setWeek] = useState(getSundayOfWeek);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const ui = UI_STRINGS[lang];

  const handleScheduleChange = useCallback(() => {
    setRefreshTrigger((n) => n + 1);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Pure Blue Fish" width={80} height={32} className="h-8 w-auto" />
            <h1 className="text-sm font-medium text-gray-700">{ui.schedule}</h1>
          </div>
          <Link
            href={`/?lang=${lang}`}
            className="px-3 py-1.5 text-xs text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {ui.protocols}
          </Link>
        </div>
      </header>

      {/* Main content: chat + calendar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat panel */}
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col flex-shrink-0">
          <ScheduleChat
            lang={lang}
            week={week}
            onScheduleChange={handleScheduleChange}
          />
        </div>

        {/* Calendar */}
        <div className="flex-1 overflow-hidden">
          <WeeklyCalendar
            lang={lang}
            week={week}
            onWeekChange={setWeek}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </div>
  );
}
