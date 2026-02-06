// ABOUTME: Weekly calendar grid showing schedule assignments
// ABOUTME: 7 days x 3 shifts with week navigation

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

function shiftWeek(sundayStr: string, days: number): string {
  const d = new Date(sundayStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

export default function WeeklyCalendar({
  lang,
  week,
  onWeekChange,
  refreshTrigger,
}: WeeklyCalendarProps) {
  const [schedule, setSchedule] = useState<WeekSchedule>({});
  const [loading, setLoading] = useState(true);
  const ui = UI_STRINGS[lang];

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

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="min-w-[700px]">
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
                {/* Shift label */}
                <div className={`px-3 py-1.5 text-xs font-medium border-b border-gray-100 ${
                  shift === "morning" ? "bg-amber-50 text-amber-700" :
                  shift === "afternoon" ? "bg-orange-50 text-orange-700" :
                  "bg-indigo-50 text-indigo-700"
                }`}>
                  {ui[shift]}
                </div>

                {/* Day cells for this shift */}
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
        )}
      </div>
    </div>
  );
}
