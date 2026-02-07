// ABOUTME: Manager task status dashboard - operational view of daily/weekly tasks
// ABOUTME: Top: day picker with shift breakdown. Bottom: filtered weekly table.

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { UI_STRINGS, type Language } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import ShiftBadge from "@/components/ShiftBadge";
import { Skeleton, Table, Thead, Tbody, Tr, Th, Td, FilterChip } from "@/components/ui";

interface AssignmentRow {
  id: number;
  worker_id: number;
  worker_name: string;
  protocol_slug: string;
  protocol_title: string;
  date: string;
  shift: "morning" | "afternoon" | "night";
  notes: string | null;
  completed: boolean;
  completed_at: string | null;
}

interface WorkerInfo {
  id: number;
  name: string;
  role: string;
}

interface StatusResponse {
  week: string;
  assignments: AssignmentRow[];
  workers: WorkerInfo[];
}

type Shift = "morning" | "afternoon" | "night";
const SHIFTS: Shift[] = ["morning", "afternoon", "night"];

const SHIFT_COLORS: Record<Shift, { bg: string; border: string; header: string }> = {
  morning: { bg: "bg-amber-50", border: "border-amber-200", header: "bg-amber-100 text-amber-800" },
  afternoon: { bg: "bg-orange-50", border: "border-orange-200", header: "bg-orange-100 text-orange-800" },
  night: { bg: "bg-indigo-50", border: "border-indigo-200", header: "bg-indigo-100 text-indigo-800" },
};

const DAY_NAMES_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getTodayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
}

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

function getWeekDatesClient(sundayStr: string): string[] {
  const dates: string[] = [];
  const d = new Date(sundayStr + "T12:00:00Z");
  for (let i = 0; i < 7; i++) {
    dates.push(d.toISOString().split("T")[0]);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return dates;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

function getDayName(dateStr: string, lang: Language): string {
  const d = new Date(dateStr + "T12:00:00Z");
  const dayIndex = d.getUTCDay();
  return lang === "he" ? DAY_NAMES_HE[dayIndex] : DAY_NAMES_EN[dayIndex];
}

function formatTime(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitialStatusFilter(): "all" | "completed" | "pending" {
  if (typeof window === "undefined") return "all";
  const params = new URLSearchParams(window.location.search);
  const s = params.get("status");
  if (s === "completed" || s === "pending") return s;
  return "all";
}

export default function TaskStatusPage() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [week, setWeek] = useState(getSundayOfWeek);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedWorker, setSelectedWorker] = useState<string>("all");
  const [selectedProtocol, setSelectedProtocol] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">(getInitialStatusFilter);
  const [sortKey, setSortKey] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [lang] = useState<Language>("he");

  const ui = UI_STRINGS[lang];
  const today = getTodayISO();
  const weekDates = useMemo(() => getWeekDatesClient(week), [week]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setIsManager(d.isManager))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/task-status?week=${week}&lang=${lang}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, [week, lang]);

  useEffect(() => {
    if (isManager) fetchData();
  }, [isManager, fetchData]);

  // Count tasks per day (for day picker badges)
  const taskCountByDay = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {};
    if (!data) return counts;
    for (const a of data.assignments) {
      if (!counts[a.date]) counts[a.date] = { total: 0, completed: 0 };
      counts[a.date].total++;
      if (a.completed) counts[a.date].completed++;
    }
    return counts;
  }, [data]);

  // Auto-select best day: today if it has tasks, otherwise first day with tasks
  useEffect(() => {
    if (!data || selectedDay) return;
    if (taskCountByDay[today]?.total > 0) {
      setSelectedDay(today);
    } else {
      const dayWithTasks = weekDates.find((d) => taskCountByDay[d]?.total > 0);
      setSelectedDay(dayWithTasks || today);
    }
  }, [data, today, weekDates, taskCountByDay, selectedDay]);

  // Reset selected day when week changes
  useEffect(() => {
    setSelectedDay("");
  }, [week]);

  // Tasks for the selected day, by shift
  const dayTasks = useMemo(() => {
    const byShift: Record<Shift, AssignmentRow[]> = { morning: [], afternoon: [], night: [] };
    if (!data || !selectedDay) return byShift;
    for (const a of data.assignments) {
      if (a.date === selectedDay && byShift[a.shift]) {
        byShift[a.shift].push(a);
      }
    }
    return byShift;
  }, [data, selectedDay]);

  const dayTotal = SHIFTS.reduce((sum, s) => sum + dayTasks[s].length, 0);
  const dayCompleted = SHIFTS.reduce((sum, s) => sum + dayTasks[s].filter((a) => a.completed).length, 0);

  // Protocol options for filter
  const protocolOptions = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, string>();
    for (const a of data.assignments) {
      map.set(a.protocol_slug, a.protocol_title);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], "he"));
  }, [data]);

  // Filtered weekly list (affected by all filters)
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.assignments.filter((a) => {
      if (selectedWorker !== "all" && String(a.worker_id) !== selectedWorker) return false;
      if (selectedProtocol !== "all" && a.protocol_slug !== selectedProtocol) return false;
      if (statusFilter === "completed" && !a.completed) return false;
      if (statusFilter === "pending" && a.completed) return false;
      return true;
    });
  }, [data, selectedWorker, selectedProtocol, statusFilter]);

  // Sorted filtered list
  const sorted = useMemo(() => {
    const list = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      switch (sortKey) {
        case "worker": return a.worker_name.localeCompare(b.worker_name, "he") * dir;
        case "protocol": return a.protocol_title.localeCompare(b.protocol_title, "he") * dir;
        case "date": return a.date.localeCompare(b.date) * dir;
        case "status": return (Number(a.completed) - Number(b.completed)) * dir;
        default: return 0;
      }
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (!isManager) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <p className="text-gray-500">גישה למנהלים בלבד</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50" dir="rtl">
      <MobileNav lang={lang} userName="מנהל" currentPage="taskStatus" isManager={true} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setWeek(shiftWeek(week, -7))}
            className="px-3 py-1.5 text-sm text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            {ui.prevWeek}
          </button>
          <h1 className="text-sm font-medium text-gray-700">
            {ui.taskStatus}
            <span className="text-gray-400 mr-2">
              {" "}{formatDateShort(weekDates[0])} - {formatDateShort(weekDates[6])}
            </span>
          </h1>
          <button
            onClick={() => setWeek(shiftWeek(week, 7))}
            className="px-3 py-1.5 text-sm text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            {ui.nextWeek}
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="flex-1 h-16 rounded-lg" />
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ── DAY PICKER ── */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
              {weekDates.map((date) => {
                const isToday = date === today;
                const isSelected = date === selectedDay;
                const count = taskCountByDay[date];
                const hasTasks = count && count.total > 0;

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDay(date)}
                    className={`flex-1 min-w-[80px] px-2 py-2 rounded-lg text-center border transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : hasTasks
                          ? "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                          : "bg-gray-50 border-gray-100 text-gray-400"
                    }`}
                  >
                    <div className={`text-xs font-medium ${isSelected ? "text-white" : ""}`}>
                      {getDayName(date, lang)}
                    </div>
                    <div className={`text-[10px] ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                      {formatDateShort(date)}
                      {isToday && !isSelected && " *"}
                    </div>
                    {hasTasks && (
                      <div className={`text-[10px] mt-0.5 font-medium ${
                        isSelected
                          ? "text-blue-100"
                          : count.completed === count.total
                            ? "text-green-600"
                            : "text-gray-500"
                      }`}>
                        {count.completed}/{count.total}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── SELECTED DAY: TASKS BY SHIFT ── */}
            {selectedDay && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm font-semibold text-gray-700">
                    {getDayName(selectedDay, lang)} {formatDateShort(selectedDay)}
                    {selectedDay === today && (
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full mr-2">
                        {ui.today}
                      </span>
                    )}
                  </h2>
                  {dayTotal > 0 && (
                    <span className="text-xs text-gray-400">
                      {dayCompleted}/{dayTotal}
                    </span>
                  )}
                </div>

                {dayTotal === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                    <p className="text-sm text-gray-400">{ui.noTasksThisShift}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {SHIFTS.map((shift) => {
                      const tasks = dayTasks[shift];
                      if (tasks.length === 0) return null;
                      const done = tasks.filter((t) => t.completed).length;
                      const colors = SHIFT_COLORS[shift];

                      return (
                        <div
                          key={shift}
                          className={`rounded-xl border ${colors.border} overflow-hidden`}
                        >
                          <div className={`px-4 py-2 ${colors.header} flex items-center justify-between`}>
                            <span className="text-sm font-medium">{ui[shift]}</span>
                            <span className="text-xs opacity-75">{done}/{tasks.length}</span>
                          </div>

                          <div className={`${colors.bg} p-3 space-y-2`}>
                            {tasks.map((a) => (
                              <div
                                key={a.id}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                                  a.completed
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-gray-200"
                                }`}
                              >
                                {a.completed ? (
                                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                )}

                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-gray-800">{a.worker_name}</span>
                                  <span className="text-gray-400 mx-1">—</span>
                                  <span className={a.completed ? "text-gray-400 line-through" : "text-gray-600"}>
                                    {a.protocol_title}
                                  </span>
                                </div>

                                {a.completed_at && (
                                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                                    {formatTime(a.completed_at)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── WEEKLY TABLE WITH FILTERS ── */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                {ui.weeklyDetails}
              </h2>

              <div className="flex flex-wrap gap-3 mb-4">
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg"
                >
                  <option value="all">{ui.allWorkers}</option>
                  {data?.workers.map((w) => (
                    <option key={w.id} value={String(w.id)}>{w.name}</option>
                  ))}
                </select>
                <select
                  value={selectedProtocol}
                  onChange={(e) => setSelectedProtocol(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg"
                >
                  <option value="all">{ui.allProtocols}</option>
                  {protocolOptions.map(([slug, title]) => (
                    <option key={slug} value={slug}>{title}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "completed" | "pending")}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg"
                >
                  <option value="all">{ui.allStatuses}</option>
                  <option value="completed">{ui.completed}</option>
                  <option value="pending">{ui.pending}</option>
                </select>
              </div>

              {/* Active filter chips */}
              {(selectedWorker !== "all" || selectedProtocol !== "all" || statusFilter !== "all") && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedWorker !== "all" && (
                    <FilterChip
                      label={data?.workers.find((w) => String(w.id) === selectedWorker)?.name || selectedWorker}
                      onRemove={() => setSelectedWorker("all")}
                    />
                  )}
                  {selectedProtocol !== "all" && (
                    <FilterChip
                      label={protocolOptions.find(([slug]) => slug === selectedProtocol)?.[1] || selectedProtocol}
                      onRemove={() => setSelectedProtocol("all")}
                    />
                  )}
                  {statusFilter !== "all" && (
                    <FilterChip
                      label={statusFilter === "completed" ? ui.completed : ui.pending}
                      onRemove={() => setStatusFilter("all")}
                    />
                  )}
                  <button
                    onClick={() => {
                      setSelectedWorker("all");
                      setSelectedProtocol("all");
                      setStatusFilter("all");
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                  >
                    {ui.clearFilters}
                  </button>
                </div>
              )}

              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <Thead>
                    <Tr>
                      <Th sortKey="worker" currentSort={sortKey} sortDir={sortDir} onSort={handleSort}>{ui.worker}</Th>
                      <Th sortKey="protocol" currentSort={sortKey} sortDir={sortDir} onSort={handleSort}>{ui.protocol}</Th>
                      <Th sortKey="date" currentSort={sortKey} sortDir={sortDir} onSort={handleSort}>{ui.date}</Th>
                      <Th>{ui.shift}</Th>
                      <Th sortKey="status" currentSort={sortKey} sortDir={sortDir} onSort={handleSort}>{ui.status}</Th>
                      <Th>{ui.notes}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sorted.map((a) => (
                      <Tr key={a.id}>
                        <Td className="text-gray-800">{a.worker_name}</Td>
                        <Td>
                          <Link
                            href={`/${a.protocol_slug}?lang=${lang}`}
                            className="text-blue-600 hover:underline"
                          >
                            {a.protocol_title}
                          </Link>
                        </Td>
                        <Td className="text-gray-600">
                          {getDayName(a.date, lang)} {formatDateShort(a.date)}
                        </Td>
                        <Td>
                          <ShiftBadge shift={a.shift} lang={lang} />
                        </Td>
                        <Td>
                          {a.completed ? (
                            <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              {ui.completed}
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium">
                              {ui.pending}
                            </span>
                          )}
                          {a.completed_at && (
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              {formatTime(a.completed_at)}
                            </div>
                          )}
                        </Td>
                        <Td className="text-gray-500 text-xs max-w-[150px] truncate">
                          {a.notes || "—"}
                        </Td>
                      </Tr>
                    ))}
                    {sorted.length === 0 && (
                      <Tr>
                        <Td colSpan={6} className="text-center text-gray-400 py-8">
                          {ui.noAssignments}
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-2">
                {sorted.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                    {ui.noAssignments}
                  </div>
                ) : (
                  sorted.map((a) => (
                    <div
                      key={a.id}
                      className={`bg-white rounded-lg border p-3 ${
                        a.completed ? "border-green-200" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-sm text-gray-800">{a.worker_name}</span>
                        {a.completed ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {ui.completed}
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium">
                            {ui.pending}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/${a.protocol_slug}?lang=${lang}`}
                        className="text-sm text-blue-600 hover:underline block mb-1.5"
                      >
                        {a.protocol_title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{getDayName(a.date, lang)} {formatDateShort(a.date)}</span>
                        <ShiftBadge shift={a.shift} lang={lang} />
                        {a.completed_at && (
                          <span className="text-gray-400">{formatTime(a.completed_at)}</span>
                        )}
                      </div>
                      {a.notes && (
                        <div className="text-xs text-gray-400 mt-1">{a.notes}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
