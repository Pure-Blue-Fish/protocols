// ABOUTME: Authentication middleware with role-based route protection
// ABOUTME: Supports both legacy password auth and new phone+PIN auth

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight token verification for Edge runtime (no Node crypto import)
async function verifyTokenEdge(
  token: string,
  secret: string
): Promise<{ workerId: number; isManager: boolean } | null> {
  const parts = token.split(":");
  if (parts.length !== 4) return null;

  const [workerIdStr, isManagerStr, timestampStr, signature] = parts;
  const data = `${workerIdStr}:${isManagerStr}:${timestampStr}`;

  // HMAC-SHA256 using Web Crypto API (available in Edge)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);

  if (signature !== expectedSig) return null;

  // Check expiry (7 days)
  const timestamp = parseInt(timestampStr, 10);
  if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) return null;

  return {
    workerId: parseInt(workerIdStr, 10),
    isManager: isManagerStr === "true",
  };
}

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/auth/worker"];
const MANAGER_PATHS = ["/schedule", "/api/schedule", "/api/schedule-chat", "/api/workers"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Try new auth token first
  const authToken = request.cookies.get("auth_token")?.value;
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";

  if (authToken) {
    const auth = await verifyTokenEdge(authToken, secret);
    if (auth) {
      // Check manager-only routes
      if (MANAGER_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        if (!auth.isManager) {
          return NextResponse.redirect(new URL("/my-tasks", request.url));
        }
      }
      // Pass auth info to downstream routes via headers
      const response = NextResponse.next();
      response.headers.set("x-worker-id", String(auth.workerId));
      response.headers.set("x-is-manager", String(auth.isManager));
      return response;
    }
  }

  // Fall back to legacy auth cookie
  const legacyAuth = request.cookies.get("auth")?.value;
  if (legacyAuth === "true") {
    // Legacy auth is treated as manager (backward compat)
    // But block worker-specific routes that need a worker ID
    if (pathname === "/my-tasks" || pathname.startsWith("/api/my-tasks")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const response = NextResponse.next();
    response.headers.set("x-worker-id", "0");
    response.headers.set("x-is-manager", "true");
    return response;
  }

  // Not authenticated
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};
