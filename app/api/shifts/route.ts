// ABOUTME: Shift definitions API - list and create shift types
// ABOUTME: Manager-only endpoint

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getShiftDefinitions, createShiftDefinition } from "@/lib/shifts";

export async function GET() {
  const headerStore = await headers();
  if (headerStore.get("x-is-manager") !== "true") {
    return NextResponse.json({ error: "Manager access required" }, { status: 403 });
  }

  const shifts = await getShiftDefinitions();
  return NextResponse.json({ shifts });
}

export async function POST(request: Request) {
  const headerStore = await headers();
  if (headerStore.get("x-is-manager") !== "true") {
    return NextResponse.json({ error: "Manager access required" }, { status: 403 });
  }

  const body = await request.json();
  const { key, display_name_he, display_name_en, start_time, end_time, sort_order } = body;

  if (!key || !display_name_he || !display_name_en || !start_time || !end_time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const shift = await createShiftDefinition({
      key,
      display_name_he,
      display_name_en,
      start_time,
      end_time,
      sort_order,
    });
    return NextResponse.json({ shift }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Shift key already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
