// ABOUTME: Toggle task completion status for a worker
// ABOUTME: POST toggles done/undone for an assignment

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { toggleComplete } from "@/lib/schedule";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const headerStore = await headers();
  const workerId = parseInt(headerStore.get("x-worker-id") || "0", 10);
  if (!workerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { assignmentId } = await params;
  const id = parseInt(assignmentId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid assignment ID" }, { status: 400 });
  }

  const completed = await toggleComplete(id, workerId);

  return NextResponse.json({ success: true, completed });
}
