// ABOUTME: Authentication helpers for phone+PIN login
// ABOUTME: Cookie signing/verification and PIN hashing

import crypto from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";

export interface AuthPayload {
  workerId: number;
  isManager: boolean;
  timestamp: number;
}

export function hashPin(pin: string, phone: string): string {
  return crypto
    .createHmac("sha256", phone)
    .update(pin)
    .digest("hex");
}

export function verifyPin(pin: string, phone: string, hash: string): boolean {
  return hashPin(pin, phone) === hash;
}

export function createAuthToken(payload: AuthPayload): string {
  const data = `${payload.workerId}:${payload.isManager}:${payload.timestamp}`;
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(data)
    .digest("hex")
    .slice(0, 16);
  return `${data}:${signature}`;
}

export function verifyAuthToken(token: string): AuthPayload | null {
  const parts = token.split(":");
  if (parts.length !== 4) return null;

  const [workerIdStr, isManagerStr, timestampStr, signature] = parts;
  const data = `${workerIdStr}:${isManagerStr}:${timestampStr}`;

  const expectedSig = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(data)
    .digest("hex")
    .slice(0, 16);

  if (signature !== expectedSig) return null;

  const timestamp = parseInt(timestampStr, 10);
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > sevenDaysMs) return null;

  return {
    workerId: parseInt(workerIdStr, 10),
    isManager: isManagerStr === "true",
    timestamp,
  };
}

export function getAuthFromCookieValue(cookieValue: string | undefined): AuthPayload | null {
  if (!cookieValue) return null;
  return verifyAuthToken(cookieValue);
}
