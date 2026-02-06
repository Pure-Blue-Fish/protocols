// ABOUTME: Get today's tasks for the authenticated worker
// ABOUTME: Returns assignments with protocol titles and completion status

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getWorkerTasksForDate, getTodayISO } from "@/lib/schedule";
import { getWorkerById } from "@/lib/db";
import type { Language } from "@/lib/protocols";

export async function GET(request: Request) {
  const headerStore = await headers();
  const workerId = parseInt(headerStore.get("x-worker-id") || "0", 10);
  if (!workerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get("date") || getTodayISO();
  const lang = (url.searchParams.get("lang") || "he") as Language;

  const worker = await getWorkerById(workerId);
  if (!worker) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }

  const tasks = await getWorkerTasksForDate(workerId, date, lang);

  return NextResponse.json({
    date,
    worker: { id: worker.id, name: worker.name, role: worker.role },
    tasks,
  });
}
