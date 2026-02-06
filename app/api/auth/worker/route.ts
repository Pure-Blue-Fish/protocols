// ABOUTME: Worker phone+PIN login endpoint
// ABOUTME: Verifies credentials and sets signed auth cookie

import { NextResponse } from "next/server";
import { getWorkerByPhone } from "@/lib/db";
import { verifyPin, createAuthToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { phone, pin } = (await request.json()) as {
    phone: string;
    pin: string;
  };

  if (!phone || !pin) {
    return NextResponse.json(
      { success: false, error: "Phone and PIN required" },
      { status: 400 }
    );
  }

  const worker = await getWorkerByPhone(phone);
  if (!worker || !verifyPin(pin, phone, worker.pin)) {
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = createAuthToken({
    workerId: worker.id,
    isManager: worker.is_manager,
    timestamp: Date.now(),
  });

  const response = NextResponse.json({
    success: true,
    worker: {
      id: worker.id,
      name: worker.name,
      role: worker.role,
      isManager: worker.is_manager,
    },
  });

  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
