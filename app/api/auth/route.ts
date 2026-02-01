// ABOUTME: Password authentication API with cookie
// ABOUTME: Sets auth cookie on successful login

import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = "purebluefish2026";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
