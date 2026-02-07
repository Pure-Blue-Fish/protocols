// ABOUTME: Get tasks for the authenticated worker
// ABOUTME: Supports single date or full week view

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getWorkerTasksForDate, getTodayISO, getSundayOfWeek, getWeekDates } from "@/lib/schedule";
import { getWorkerById } from "@/lib/db";
import type { Language } from "@/lib/protocols";

export async function GET(request: Request) {
  const headerStore = await headers();
  const workerId = parseInt(headerStore.get("x-worker-id") || "0", 10);
  if (!workerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(request.url);
  const lang = (url.searchParams.get("lang") || "he") as Language;
  const week = url.searchParams.get("week");

  const worker = await getWorkerById(workerId);
  if (!worker) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }

  // Week mode: return tasks for all 7 days
  if (week) {
    const sunday = getSundayOfWeek(week);
    const dates = getWeekDates(sunday);
    const weekTasks: Record<string, Awaited<ReturnType<typeof getWorkerTasksForDate>>> = {};

    for (const date of dates) {
      const tasks = await getWorkerTasksForDate(workerId, date, lang);
      weekTasks[date] = tasks;
    }

    return NextResponse.json({
      week: sunday,
      today: getTodayISO(),
      worker: { id: worker.id, name: worker.name, role: worker.role },
      tasks: weekTasks,
    });
  }

  // Single date mode (default: today)
  const date = url.searchParams.get("date") || getTodayISO();
  const tasks = await getWorkerTasksForDate(workerId, date, lang);

  return NextResponse.json({
    date,
    worker: { id: worker.id, name: worker.name, role: worker.role },
    tasks,
  });
}
