// ABOUTME: Schedule view - weekly calendar for all users, AI chat for managers only
// ABOUTME: Desktop: side panel chat. Mobile: FAB opens chat overlay above calendar.

"use client";

import { useState, useCallback, useEffect } from "react";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import ScheduleChat from "@/components/ScheduleChat";
import MobileNav from "@/components/MobileNav";
import BottomNav from "@/components/BottomNav";
import { type Language } from "@/lib/i18n";

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
  const [isManager, setIsManager] = useState(false);
  const [userName, setUserName] = useState("");
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setIsManager(data.isManager);
        setUserName(data.name || "");
        setWorkerId(data.workerId ? String(data.workerId) : null);
      })
      .catch(() => {});
  }, []);

  const handleScheduleChange = useCallback(() => {
    setRefreshTrigger((n) => n + 1);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50" dir="rtl">
      <div className="flex-shrink-0">
        <MobileNav lang={lang} userName={userName} currentPage="schedule" isManager={isManager} workerId={workerId} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop: side panel chat */}
        {isManager && !isMobile && (
          <div className="w-80 border-l border-gray-200 bg-white flex flex-col flex-shrink-0">
            <ScheduleChat
              lang={lang}
              week={week}
              onScheduleChange={handleScheduleChange}
            />
          </div>
        )}

        {/* Calendar — always full width on mobile */}
        <div className="flex-1 overflow-hidden">
          <WeeklyCalendar
            lang={lang}
            week={week}
            onWeekChange={setWeek}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Mobile: chat overlay */}
        {isManager && isMobile && showChat && (
          <div className="absolute inset-x-3 top-3 bottom-3 z-30 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <span className="text-sm font-medium text-gray-700">
                {lang === "he" ? "עוזר לוח עבודה" : "Schedule Assistant"}
              </span>
              <button
                onClick={() => setShowChat(false)}
                className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScheduleChat
                lang={lang}
                week={week}
                onScheduleChange={handleScheduleChange}
              />
            </div>
          </div>
        )}

        {/* Mobile: FAB to open chat */}
        {isManager && isMobile && !showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="absolute bottom-4 right-4 z-20 w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 active:scale-95 transition-transform"
            aria-label={lang === "he" ? "עוזר לוח עבודה" : "Schedule Assistant"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        )}
      </div>

      {!isManager && <BottomNav lang={lang} currentPage="schedule" />}
    </div>
  );
}
