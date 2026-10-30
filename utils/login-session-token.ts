import { createHash, randomBytes } from "node:crypto";

export const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
