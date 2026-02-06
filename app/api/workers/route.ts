// ABOUTME: Workers API - list all active workers
// ABOUTME: Manager-only endpoint

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getWorkers } from "@/lib/db";

export async function GET() {
  const headerStore = await headers();
  if (headerStore.get("x-is-manager") !== "true") {
    return NextResponse.json({ error: "Manager access required" }, { status: 403 });
  }

  const workers = await getWorkers();
  return NextResponse.json({ workers });
}
