// ABOUTME: Authentication middleware for all pages
// ABOUTME: Redirects unauthenticated users to login

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth");
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isAuthApi = request.nextUrl.pathname === "/api/auth";

  // Allow auth API and login page
  if (isAuthApi || isLoginPage) {
    return NextResponse.next();
  }

  // Check authentication
  if (!authCookie || authCookie.value !== "true") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
