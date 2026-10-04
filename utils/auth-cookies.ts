// Cookie verification without Next, so the server kernel can resolve the actor
// from it; utils/auth.ts adds the Next request and response helpers.

export const ADMIN_COOKIE_NAME = "admin-auth";
// The single cookie that names the current guest AND, when applicable, proves
// it. Its value carries a level (issue #370):
//   - "open"     — a mere name selection. Unsigned and forgeable, exactly like
//                  the old plain `user` cookie: unprotected guests are freely
//                  impersonable by design, so an open cookie needs no secret
//                  and grants nothing a protected guest's identity relies on.
//   - "verified" — a signed proof that the guest's password/code was checked.
// Reads go only through readGuestCookie (here) and the acting-guest helpers,
// so no caller ever trusts a raw guest id: a protected guest is honoured only
// with a "verified" cookie (see isVerifiedAsGuest).
export const GUEST_COOKIE_NAME = "guest";
export type GuestAuthLevel = "open" | "verified";

export const ADMIN_SCOPE = "admin";
export const COOKIE_MAX_AGE_SEC = 7 * 24 * 60 * 60;
const COOKIE_MAX_AGE_MS = COOKIE_MAX_AGE_SEC * 1000;

export function isPasswordProtectionEnabled(): boolean {
  return !!process.env.SITE_PASSWORD;
}

export function isAdminEnabled(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

const MIN_AUTH_SECRET_LENGTH = 32;

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET environment variable must be set when SITE_PASSWORD or ADMIN_PASSWORD is set or guests protect their name"
    );
  }
  if (secret.length < MIN_AUTH_SECRET_LENGTH) {
    throw new Error(
      `AUTH_SECRET must be at least ${MIN_AUTH_SECRET_LENGTH} characters; generate one with \`openssl rand -base64 32\``
    );
  }
  return secret;
}

const encoder = new TextEncoder();

async function importHmacKey(usage: "sign" | "verify"): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const padded =
    s.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (s.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// The scope is part of the signed payload so a cookie signed for one scope
// (e.g. site auth) can never validate for another (e.g. admin auth).
export async function signCookieValue(scope = ""): Promise<string> {
  // eslint-disable-next-line no-restricted-syntax -- cookie lifetime is real time: a dev clock jump must not expire live sessions (ADR 0004)
  const issuedAt = Date.now().toString();
  const payload = scope ? `${scope}.${issuedAt}` : issuedAt;
  const key = await importHmacKey("sign");
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${bytesToBase64Url(new Uint8Array(sig))}`;
}

async function isSignedCookieValid(
  value: string | undefined,
  scope: string
): Promise<boolean> {
  if (!value) return false;

  let rest = value;
  if (scope) {
    if (!rest.startsWith(`${scope}.`)) return false;
    rest = rest.slice(scope.length + 1);
  }

  const dot = rest.indexOf(".");
  if (dot < 0) return false;
  const timestamp = rest.slice(0, dot);
  const sig = rest.slice(dot + 1);

  if (!/^\d+$/.test(timestamp)) return false;
  const issuedAt = Number(timestamp);
  if (!Number.isSafeInteger(issuedAt)) return false;
  // eslint-disable-next-line no-restricted-syntax -- elapsed time against the real clock the cookie was stamped with
  const age = Date.now() - issuedAt;
  if (age < 0 || age > COOKIE_MAX_AGE_MS) return false;

  let sigBytes: Uint8Array<ArrayBuffer>;
  try {
    sigBytes = base64UrlToBytes(sig);
  } catch {
    return false;
  }

  const payload = scope ? `${scope}.${timestamp}` : timestamp;
  const key = await importHmacKey("verify");
  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payload));
}

export async function isAuthCookieValid(
  value: string | undefined
): Promise<boolean> {
  if (!isPasswordProtectionEnabled()) return true;
  return isSignedCookieValid(value, "");
}

export async function isAdminCookieValid(
  value: string | undefined
): Promise<boolean> {
  if (!isAdminEnabled()) return false;
  return isSignedCookieValid(value, ADMIN_SCOPE);
}

// Guest ids are nanoids (no dots), so the dot-delimited value stays parseable.
// A "verified" value is `verified.<guestId>.<issuedAt>.<sig>`, signed via the
// scoped signCookieValue so it can't be forged; an "open" value is just
// `open.<guestId>` and isn't. Folding the guest id into the signed scope means
// a proof issued for one guest can never validate for another.
export function verifiedScope(guestId: string): string {
  return `verified.${guestId}`;
}

/**
 * Parses and validates the guest cookie into its guest id and level, or null
 * if absent/malformed. A "verified" value must carry a valid, unexpired
 * signature; an "open" value is accepted as-is (it is only ever honoured for
 * an unprotected guest — see isVerifiedAsGuest). Never trust the returned id
 * for a protected guest without also checking the level is "verified".
 */
export async function readGuestCookie(
  value: string | undefined
): Promise<{ guestId: string; level: GuestAuthLevel } | null> {
  if (!value) return null;
  const firstDot = value.indexOf(".");
  if (firstDot < 0) return null;
  const level = value.slice(0, firstDot);

  if (level === "open") {
    const guestId = value.slice(firstDot + 1);
    if (!guestId || guestId.includes(".")) return null;
    return { guestId, level: "open" };
  }

  if (level === "verified") {
    // `verified.<guestId>.<issuedAt>.<sig>`: exactly four parts, so the guest
    // id can't smuggle an extra dot. Signature and expiry are delegated to the
    // shared scoped verifier.
    const parts = value.split(".");
    if (parts.length !== 4) return null;
    const guestId = parts[1];
    if (!guestId) return null;
    try {
      return (await isSignedCookieValid(value, verifiedScope(guestId)))
        ? { guestId, level: "verified" }
        : null;
    } catch {
      // No AUTH_SECRET configured (or another crypto error): this can't be a
      // genuine proof, so treat it as an invalid cookie rather than throwing.
      // A passwordless site with no protected guests has no secret and must
      // still survive a client that sends a forged `verified` value.
      return null;
    }
  }

  return null;
}
