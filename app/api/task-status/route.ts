// ABOUTME: Task status API - flat list of assignments with completion info
// ABOUTME: Manager-only endpoint for the task status dashboard

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getTaskStatusList, getSundayOfWeek, getTodayISO } from "@/lib/schedule";
import { getWorkers } from "@/lib/db";
import type { Language } from "@/lib/i18n";

export async function GET(request: Request) {
  const headerStore = await headers();
  if (headerStore.get("x-is-manager") !== "true") {
    return NextResponse.json({ error: "Manager access required" }, { status: 403 });
  }

  const url = new URL(request.url);
  const week = url.searchParams.get("week") || getSundayOfWeek(getTodayISO());
  const lang = (url.searchParams.get("lang") || "he") as Language;
  const workerIdParam = url.searchParams.get("worker");
  const workerId = workerIdParam ? parseInt(workerIdParam, 10) : undefined;

  const [assignments, workers] = await Promise.all([
    getTaskStatusList(week, lang, workerId),
    getWorkers(),
  ]);

  return NextResponse.json({ week, assignments, workers });
}
