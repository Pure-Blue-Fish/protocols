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

  const mobileTab = showChat ? "chat" : "calendar";

  return (
    <div className="h-dvh flex flex-col bg-gray-50" dir="rtl">
      <div className="flex-shrink-0">
        <MobileNav lang={lang} userName={userName} currentPage="schedule" isManager={isManager} workerId={workerId} />
      </div>

      {/* Mobile: tab switcher for managers */}
      {isManager && isMobile && (
        <div className="flex-shrink-0 flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setShowChat(false)}
            className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
              mobileTab === "calendar"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {lang === "he" ? "לוח עבודה" : "Schedule"}
            </span>
          </button>
          <button
            onClick={() => setShowChat(true)}
            className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
              mobileTab === "chat"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {lang === "he" ? "עוזר AI" : "AI Assistant"}
            </span>
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
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

        {/* Calendar */}
        <div className={`flex-1 overflow-hidden ${isMobile && isManager && mobileTab === "chat" ? "hidden" : ""}`}>
          <WeeklyCalendar
            lang={lang}
            week={week}
            onWeekChange={setWeek}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Mobile: inline chat tab */}
        {isManager && isMobile && mobileTab === "chat" && (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <ScheduleChat
              lang={lang}
              week={week}
              onScheduleChange={handleScheduleChange}
            />
          </div>
        )}
      </div>

      {!isManager && <BottomNav lang={lang} currentPage="schedule" />}
    </div>
  );
}
