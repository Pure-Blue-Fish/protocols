// ABOUTME: Schedule API - get week schedule and bulk assign tasks
// ABOUTME: Manager-only endpoints for viewing and modifying the schedule

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getWeekSchedule, getSundayOfWeek, getTodayISO, assignTask } from "@/lib/schedule";
import type { Language } from "@/lib/i18n";
import type { Shift } from "@/lib/db";

export async function GET(request: Request) {
  const headerStore = await headers();
  if (headerStore.get("x-is-manager") !== "true") {
    return NextResponse.json({ error: "Manager access required" }, { status: 403 });
  }

  const url = new URL(request.url);
  const week = url.searchParams.get("week") || getSundayOfWeek(getTodayISO());
  const lang = (url.searchParams.get("lang") || "he") as Language;

  const schedule = await getWeekSchedule(week, lang);

  return NextResponse.json({ week, schedule });
}

export async function POST(request: Request) {
  const headerStore = await headers();
  if (headerStore.get("x-is-manager") !== "true") {
    return NextResponse.json({ error: "Manager access required" }, { status: 403 });
  }

  const { assignments } = (await request.json()) as {
    assignments: {
      workerId: number;
      protocolSlug: string;
      date: string;
      shift: Shift;
      notes?: string;
    }[];
  };

  if (!assignments || !Array.isArray(assignments)) {
    return NextResponse.json({ error: "assignments array required" }, { status: 400 });
  }

  let created = 0;
  for (const a of assignments) {
    await assignTask(a.workerId, a.protocolSlug, a.date, a.shift, a.notes);
    created++;
  }

  return NextResponse.json({ success: true, created });
}
