// ABOUTME: Worker weekly task view - shows the worker's own assignments
// ABOUTME: Weekly view with today highlighted, completion toggles, protocol links

"use client";

import { useState, useEffect, useCallback } from "react";
import TaskCard from "@/components/TaskCard";
import MobileNav from "@/components/MobileNav";
import BottomNav from "@/components/BottomNav";
import { Skeleton, EmptyState } from "@/components/ui";
import { UI_STRINGS, type Language } from "@/lib/i18n";

interface TaskData {
  id: number;
  protocol_slug: string;
  protocol_title: string;
  shift: "morning" | "afternoon" | "night";
  notes: string | null;
  completed: boolean;
}

interface WeekResponse {
  week: string;
  today: string;
  worker: { id: number; name: string; role: string };
  tasks: Record<string, TaskData[]>;
}

const DAY_NAMES: Record<Language, string[]> = {
  he: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

function getSundayOfWeek(): string {
  const now = new Date();
  const israelDate = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })
  );
  const day = israelDate.getDay();
  israelDate.setDate(israelDate.getDate() - day);
  return israelDate.toISOString().split("T")[0];
}

function shiftWeek(sundayStr: string, days: number): string {
  const d = new Date(sundayStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

export default function MyTasksPage() {
  const [data, setData] = useState<WeekResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState(getSundayOfWeek);
  const [lang] = useState<Language>("he");

  const ui = UI_STRINGS[lang];
  const dayNames = DAY_NAMES[lang];

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/my-tasks?week=${week}&lang=${lang}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // Silent fail
    }
    setLoading(false);
  }, [week, lang]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const dates = data ? Object.keys(data.tasks).sort() : [];
  const today = data?.today || "";

  // Count totals
  const allTasks = dates.flatMap((d) => data?.tasks[d] || []);
  const totalCount = allTasks.length;
  const completedCount = allTasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-surface-page" dir="rtl">
      <MobileNav
        lang={lang}
        userName={data?.worker.name || ""}
        currentPage="myTasks"
        isManager={false}
        workerId={data ? String(data.worker.id) : null}
      />

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setWeek(shiftWeek(week, -7))}
            className="px-3 py-1.5 text-sm text-text-secondary bg-surface-card rounded-lg border border-border-default hover:bg-surface-subtle transition-colors"
          >
            {ui.prevWeek}
          </button>
          <h1 className="text-sm font-medium text-text-primary font-heading">
            {ui.myTasks}
            {dates.length > 0 && (
              <span className="text-text-muted mr-2">
                {" "}{formatDateShort(dates[0])} - {formatDateShort(dates[dates.length - 1])}
              </span>
            )}
          </h1>
          <button
            onClick={() => setWeek(shiftWeek(week, 7))}
            className="px-3 py-1.5 text-sm text-text-secondary bg-surface-card rounded-lg border border-border-default hover:bg-surface-subtle transition-colors"
          >
            {ui.nextWeek}
          </button>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="mb-6 bg-surface-card rounded-lg p-3 border border-border-subtle">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>{completedCount} / {totalCount}</span>
              <span>{Math.round((completedCount / totalCount) * 100)}%</span>
            </div>
            <div className="w-full bg-surface-subtle rounded-full h-2">
              <div
                className="bg-brand-success h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border-subtle bg-surface-card p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : totalCount === 0 ? (
          <EmptyState
            icon={<svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            title={ui.noTasks}
          />
        ) : (
          <div className="space-y-4">
            {dates.map((date, i) => {
              const tasks = data?.tasks[date] || [];
              if (tasks.length === 0) return null;

              const isToday = date === today;

              return (
                <div
                  key={date}
                  className={`rounded-xl border ${isToday ? "border-brand-primary/30 bg-brand-primary-light/50" : "border-border-subtle bg-surface-card"}`}
                >
                  {/* Day header */}
                  <div className={`px-4 py-2 border-b ${isToday ? "border-brand-primary/20" : "border-border-subtle"} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isToday ? "text-brand-primary" : "text-text-primary"}`}>
                        {dayNames[i]}
                      </span>
                      <span className="text-xs text-text-muted">{formatDateShort(date)}</span>
                      {isToday && (
                        <span className="text-[10px] bg-brand-primary text-white px-1.5 py-0.5 rounded-full">
                          {ui.today}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted">
                      {tasks.filter((t) => t.completed).length}/{tasks.length}
                    </span>
                  </div>

                  {/* Tasks */}
                  <div className="p-2 space-y-2">
                    {tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        assignmentId={task.id}
                        protocolSlug={task.protocol_slug}
                        protocolTitle={task.protocol_title}
                        shift={task.shift}
                        notes={task.notes}
                        completed={task.completed}
                        lang={lang}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav lang={lang} currentPage="myTasks" />
    </div>
  );
}
