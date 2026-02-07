// ABOUTME: Employees API - list all workers (including inactive) and create new ones
// ABOUTME: Manager-only endpoint for the employee management page

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAllEmployees, createEmployee } from "@/lib/employees";

export async function GET() {
  const headerStore = await headers();
  if (headerStore.get("x-is-manager") !== "true") {
    return NextResponse.json({ error: "Manager access required" }, { status: 403 });
  }

  const employees = await getAllEmployees();
  return NextResponse.json({ employees });
}

export async function POST(request: Request) {
  const headerStore = await headers();
  if (headerStore.get("x-is-manager") !== "true") {
    return NextResponse.json({ error: "Manager access required" }, { status: 403 });
  }

  const body = await request.json();
  const { name, role, phone, pin, default_shift, is_manager } = body;

  if (!name || !role || !phone || !pin || !default_shift) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const employee = await createEmployee({
      name,
      role,
      phone: phone.replace(/\D/g, ""),
      pin,
      default_shift,
      is_manager: is_manager ?? false,
    });
    return NextResponse.json({ employee }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Phone number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
