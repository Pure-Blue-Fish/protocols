// ABOUTME: Weekly calendar grid showing schedule assignments
// ABOUTME: Desktop: 7×3 grid. Mobile: day picker + stacked shift cards.

"use client";

import { useState, useEffect, useCallback } from "react";
import AssignmentCard from "./AssignmentCard";
import { UI_STRINGS, type Language } from "@/lib/i18n";

interface AssignmentData {
  id: number;
  worker_id: number;
  worker_name: string;
  protocol_slug: string;
  protocol_title: string;
  shift: string;
  notes: string | null;
  completed: boolean;
}

type WeekSchedule = Record<string, Record<string, AssignmentData[]>>;

interface WeeklyCalendarProps {
  lang: Language;
  week: string;
  onWeekChange: (newWeek: string) => void;
  refreshTrigger: number;
}

const SHIFTS = ["morning", "afternoon", "night"] as const;

const DAY_KEYS = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
] as const;

const SHIFT_COLORS: Record<string, { bg: string; header: string; border: string }> = {
  morning: { bg: "bg-amber-50", header: "bg-amber-100 text-amber-800", border: "border-amber-200" },
  afternoon: { bg: "bg-orange-50", header: "bg-orange-100 text-orange-800", border: "border-orange-200" },
  night: { bg: "bg-indigo-50", header: "bg-indigo-100 text-indigo-800", border: "border-indigo-200" },
};

function shiftWeek(sundayStr: string, days: number): string {
  const d = new Date(sundayStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

function getTodayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
}

export default function WeeklyCalendar({
  lang,
  week,
  onWeekChange,
  refreshTrigger,
}: WeeklyCalendarProps) {
  const [schedule, setSchedule] = useState<WeekSchedule>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const ui = UI_STRINGS[lang];
  const today = getTodayISO();

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedule?week=${week}&lang=${lang}`);
      if (res.ok) {
        const data = await res.json();
        setSchedule(data.schedule);
      }
    } catch {
      // Silent fail
    }
    setLoading(false);
  }, [week, lang]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule, refreshTrigger]);

  const dates = Object.keys(schedule).sort();

  // Auto-select today or first day with assignments on mobile
  useEffect(() => {
    if (dates.length === 0) return;
    if (selectedDay && dates.includes(selectedDay)) return;
    const todayHasTasks = dates.includes(today) &&
      SHIFTS.some((s) => (schedule[today]?.[s]?.length || 0) > 0);
    if (todayHasTasks) {
      setSelectedDay(today);
    } else {
      const dayWithTasks = dates.find((d) =>
        SHIFTS.some((s) => (schedule[d]?.[s]?.length || 0) > 0)
      );
      setSelectedDay(dayWithTasks || dates[0]);
    }
  }, [dates.join(","), today, schedule]);

  // Reset selection when week changes
  useEffect(() => {
    setSelectedDay("");
  }, [week]);

  return (
    <div className="h-full flex flex-col">
      {/* Week navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={() => onWeekChange(shiftWeek(week, -7))}
          className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          {ui.prevWeek}
        </button>
        <h2 className="text-sm font-medium text-gray-700">
          {dates.length > 0
            ? `${formatDateShort(dates[0])} - ${formatDateShort(dates[dates.length - 1])}`
            : ui.thisWeek}
        </h2>
        <button
          onClick={() => onWeekChange(shiftWeek(week, 7))}
          className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          {ui.nextWeek}
        </button>
      </div>

      {/* Calendar content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop: 7-column grid (unchanged) */}
            <div className="hidden md:block min-w-[700px]">
              {/* Header row */}
              <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 sticky top-0">
                {dates.map((date, i) => (
                  <div key={date} className="px-2 py-2 text-center border-l border-gray-200 first:border-l-0">
                    <div className="text-xs font-medium text-gray-600">
                      {ui[DAY_KEYS[i]] || DAY_KEYS[i]}
                    </div>
                    <div className="text-xs text-gray-400">{formatDateShort(date)}</div>
                  </div>
                ))}
              </div>

              {/* Shift rows */}
              {SHIFTS.map((shift) => (
                <div key={shift}>
                  <div className={`px-3 py-1.5 text-xs font-medium border-b border-gray-100 ${
                    shift === "morning" ? "bg-amber-50 text-amber-700" :
                    shift === "afternoon" ? "bg-orange-50 text-orange-700" :
                    "bg-indigo-50 text-indigo-700"
                  }`}>
                    {ui[shift]}
                  </div>
                  <div className="grid grid-cols-7 border-b border-gray-200">
                    {dates.map((date) => {
                      const assignments = schedule[date]?.[shift] || [];
                      return (
                        <div
                          key={`${date}-${shift}`}
                          className="border-l border-gray-200 first:border-l-0 p-1.5 min-h-[60px] space-y-1"
                        >
                          {assignments.map((a) => (
                            <AssignmentCard
                              key={a.id}
                              workerName={a.worker_name}
                              protocolTitle={a.protocol_title}
                              completed={a.completed}
                              notes={a.notes}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: day picker + stacked shifts */}
            <div className="md:hidden p-3">
              {/* Day picker */}
              <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                {dates.map((date, i) => {
                  const isToday = date === today;
                  const isSelected = date === selectedDay;
                  const hasAssignments = SHIFTS.some(
                    (s) => (schedule[date]?.[s]?.length || 0) > 0
                  );

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDay(date)}
                      className={`flex-1 min-w-[48px] px-1.5 py-2 rounded-lg text-center border transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : hasAssignments
                            ? "bg-white border-gray-200 hover:border-blue-300"
                            : "bg-gray-50 border-gray-100 text-gray-400"
                      }`}
                    >
                      <div className={`text-xs font-medium ${isSelected ? "text-white" : ""}`}>
                        {(ui[DAY_KEYS[i]] || DAY_KEYS[i]).slice(0, 3)}
                      </div>
                      <div className={`text-[10px] ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                        {formatDateShort(date)}
                        {isToday && !isSelected && " *"}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Shift cards for selected day */}
              {selectedDay && (
                <div className="space-y-3">
                  {SHIFTS.map((shift) => {
                    const assignments = schedule[selectedDay]?.[shift] || [];
                    if (assignments.length === 0) return null;
                    const colors = SHIFT_COLORS[shift];

                    return (
                      <div key={shift} className={`rounded-xl border ${colors.border} overflow-hidden`}>
                        <div className={`px-4 py-2 ${colors.header} text-sm font-medium`}>
                          {ui[shift]}
                          <span className="opacity-60 mr-2">({assignments.length})</span>
                        </div>
                        <div className={`${colors.bg} p-2 space-y-1.5`}>
                          {assignments.map((a) => (
                            <AssignmentCard
                              key={a.id}
                              workerName={a.worker_name}
                              protocolTitle={a.protocol_title}
                              completed={a.completed}
                              notes={a.notes}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {SHIFTS.every((s) => (schedule[selectedDay]?.[s]?.length || 0) === 0) && (
                    <div className="text-center py-8 text-sm text-gray-400">
                      {ui.noTasksThisShift}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
