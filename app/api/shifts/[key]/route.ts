// ABOUTME: Single shift definition API - update a shift type
// ABOUTME: Manager-only endpoint

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { updateShiftDefinition } from "@/lib/shifts";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const headerStore = await headers();
  if (headerStore.get("x-is-manager") !== "true") {
    return NextResponse.json({ error: "Manager access required" }, { status: 403 });
  }

  const { key } = await params;
  const body = await request.json();

  try {
    const shift = await updateShiftDefinition(key, body);
    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }
    return NextResponse.json({ shift });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
