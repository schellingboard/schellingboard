import { createHash, randomBytes } from "node:crypto";

import { COOKIE_MAX_AGE_SEC } from "./auth-cookies";

export const SESSION_LIFETIME_MS = COOKIE_MAX_AGE_SEC * 1000;

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
