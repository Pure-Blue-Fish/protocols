// ABOUTME: Logout API - clears both auth cookies
// ABOUTME: Redirects to login page after clearing

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("auth_token");
  response.cookies.delete("auth");
  return response;
}
