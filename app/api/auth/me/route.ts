// ABOUTME: Returns current user's auth info including name
// ABOUTME: Used by client components to check role and display user info

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getWorkerById } from "@/lib/db";

export async function GET() {
  const headerStore = await headers();
  const workerId = Number(headerStore.get("x-worker-id")) || 0;
  const isManager = headerStore.get("x-is-manager") === "true";

  let name = "";
  if (workerId > 0) {
    const worker = await getWorkerById(workerId);
    if (worker) {
      name = worker.name;
    }
  }

  // For legacy manager login (no workerId), show "מנהל"
  if (isManager && !name) {
    name = "מנהל";
  }

  return NextResponse.json({ workerId, isManager, name });
}
