import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SCOPE,
  COOKIE_MAX_AGE_SEC,
  GUEST_COOKIE_NAME,
  isAdminCookieValid,
  isAdminEnabled,
  isAuthCookieValid,
  isPasswordProtectionEnabled,
  signCookieValue,
  verifiedScope,
  type GuestAuthLevel,
} from "@/utils/auth-cookies";

export {
  ADMIN_COOKIE_NAME,
  GUEST_COOKIE_NAME,
  isAdminCookieValid,
  isAdminEnabled,
  isAuthCookieValid,
  isPasswordProtectionEnabled,
  readGuestCookie,
  type GuestAuthLevel,
} from "@/utils/auth-cookies";

export const AUTH_COOKIE_NAME = "site-auth";
export const ADMIN_DISABLED_MESSAGE =
  "Admin UI is disabled: set the ADMIN_PASSWORD environment variable on the server to enable it. See the project documentation.";
// Set by the proxy on requests it has verified carry a valid admin cookie,
// and only then — route handlers trust its presence instead of
// re-validating the cookie themselves. Safe because the proxy always runs
// ahead of the route for real traffic and strips any client-supplied copy of
// this header from every forwarded request before checking auth.
export const ADMIN_VERIFIED_HEADER = "x-admin-verified";
const ADMIN_VERIFIED_VALUE = "1";
// Without an explicit no-store, browsers heuristically cache admin API
// responses; some carry sensitive data (e.g. user emails) and must never be
// served stale or from cache.
export const NO_STORE = { headers: { "cache-control": "no-store" } };

/**
 * Returns a safe same-origin redirect path, or `fallback` if `value` could
 * navigate off-site.
 *
 * Attack vector: the post-login redirect target is attacker-controllable via a
 * crafted link (e.g. `/login?redirect=//evil.com`). Without validation a user
 * who logs in is then bounced to an external site — a phishing aid. Browsers
 * also treat `\` and stripped tabs/newlines as `/`, so `/%5Cevil.com` becomes
 * `//evil.com`, etc.
 *
 * We parse the value with the WHATWG URL parser (the `URL` constructor) against
 * a dummy origin, and accept it only if it stays on that origin and the
 * normalized path is not itself protocol-relative.
 *
 * Best effort only: the browser re-parses the eventual `Location` header with
 * its own WHATWG implementation, which may differ from ours on edge cases, so
 * we cannot guarantee every case is covered.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback: string
): string {
  if (!value) {
    return fallback;
  }
  try {
    const url = new URL(value, "http://x");
    if (url.origin !== "http://x" || url.pathname.startsWith("//")) {
      return fallback;
    }
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}

const encoder = new TextEncoder();

// Constant-time string comparison for the shared site/admin passwords. This
// file must stay free of node:crypto (see utils/user-credentials.ts), so no
// timingSafeEqual: instead XOR every byte and fold the result, always walking
// the longer input so timing reveals nothing beyond the secret's length.
function timingSafeEqualString(a: string, b: string): boolean {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  let diff = aBytes.length ^ bBytes.length;
  const len = Math.max(aBytes.length, bBytes.length);
  for (let i = 0; i < len; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

export function verifyPassword(inputPassword: string): boolean {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return true; // No protection if password not set
  }
  return timingSafeEqualString(inputPassword, sitePassword);
}

export function verifyAdminPassword(inputPassword: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return false; // Admin access disabled entirely when no password is set
  }
  return timingSafeEqualString(inputPassword, adminPassword);
}

export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return isAuthCookieValid(cookie);
}

function cookieOptions(maxAge: number) {
  return {
    maxAge,
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

// Cookie attributes are spread flat onto the returned object — NOT nested under
// an `options` key. Next's `cookies().set(obj)` reads cookie attributes
// (maxAge, httpOnly, secure, sameSite, path) from the top level of `obj`; a
// nested `options` key is silently ignored, which downgrades the cookie to a
// session cookie with no HttpOnly/Secure. See tests/unit/auth.test.ts
// ("emitted Set-Cookie header").
export async function createAuthCookie() {
  return {
    name: AUTH_COOKIE_NAME,
    value: await signCookieValue(),
    ...cookieOptions(COOKIE_MAX_AGE_SEC),
  };
}

export function createLogoutCookie() {
  return {
    name: AUTH_COOKIE_NAME,
    value: "",
    ...cookieOptions(0),
  };
}

// Signing (the "verified" path) needs AUTH_SECRET; the "open" path never does,
// so a passwordless site with no protected guests still runs without a secret.
export async function createGuestCookie(
  guestId: string,
  level: GuestAuthLevel
) {
  return {
    name: GUEST_COOKIE_NAME,
    value:
      level === "verified"
        ? await signCookieValue(verifiedScope(guestId))
        : `open.${guestId}`,
    ...cookieOptions(COOKIE_MAX_AGE_SEC),
  };
}

export function createGuestLogoutCookie() {
  return {
    name: GUEST_COOKIE_NAME,
    value: "",
    ...cookieOptions(0),
  };
}

export async function createAdminAuthCookie() {
  return {
    name: ADMIN_COOKIE_NAME,
    value: await signCookieValue(ADMIN_SCOPE),
    ...cookieOptions(COOKIE_MAX_AGE_SEC),
  };
}

export function createAdminLogoutCookie() {
  return {
    name: ADMIN_COOKIE_NAME,
    value: "",
    ...cookieOptions(0),
  };
}

export async function requireAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  if (!isPasswordProtectionEnabled()) {
    return null;
  }
  if (await isAuthenticated(request)) {
    return null;
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "redirect",
    request.nextUrl.pathname + request.nextUrl.search
  );
  return NextResponse.redirect(loginUrl);
}

export async function isAdminAuthenticated(
  request: NextRequest
): Promise<boolean> {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return isAdminCookieValid(cookie);
}

export async function requireAdminAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  if (!isAdminEnabled()) {
    return new NextResponse(ADMIN_DISABLED_MESSAGE, { status: 404 });
  }
  if (await isAdminAuthenticated(request)) {
    return null;
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set(
    "redirect",
    request.nextUrl.pathname + request.nextUrl.search
  );
  return NextResponse.redirect(loginUrl);
}

// CSRF defense for the cookie-authenticated admin API: `SameSite=Lax` alone
// doesn't cover cross-site top-level GET navigations (e.g. a link or
// auto-submitting <form method=get>), which still carry the cookie without an
// `Origin` header. `Sec-Fetch-Site` is sent by all modern browsers for those
// requests too, so checking both closes the gap Origin alone leaves open.
// Non-browser clients (curl, scripts) send neither header, so they fall
// through to "trusted" — matching this API's intended audience.
//
// `request.nextUrl.origin` is derived from the Host/X-Forwarded-* headers
// Next.js sees, so this comparison is only correct if a fronting reverse
// proxy forwards `X-Forwarded-Proto`/`Host` accurately; a misconfigured proxy
// that drops `X-Forwarded-Proto` could make this reject legitimate
// same-origin browser requests (e.g. nextUrl resolves to http:// while the
// browser's real Origin is https://).
function isTrustedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return false;
  }
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") {
    return false;
  }
  return true;
}

export type AdminApiRefusal = {
  status: 401 | 403 | 404;
  code: "admin.disabled" | "request.crossSite" | "admin.unauthenticated";
  message: string;
};

export async function adminApiRefusal(
  request: NextRequest
): Promise<AdminApiRefusal | null> {
  if (!isAdminEnabled()) {
    return {
      status: 404,
      code: "admin.disabled",
      message: "Admin API is disabled",
    };
  }
  if (!isTrustedOrigin(request)) {
    return {
      status: 403,
      code: "request.crossSite",
      message: "Cross-site request rejected",
    };
  }
  if (!(await isAdminAuthenticated(request))) {
    return {
      status: 401,
      code: "admin.unauthenticated",
      message: "Unauthorized",
    };
  }
  return null;
}

export function forwardAsVerifiedAdmin(request: NextRequest): NextResponse {
  const headers = new Headers(request.headers);
  headers.set(ADMIN_VERIFIED_HEADER, ADMIN_VERIFIED_VALUE);
  return NextResponse.next({ request: { headers } });
}

/**
 * Admin-API counterpart of {@link requireAdminAuth}: same admin-cookie check,
 * plus a CSRF check the UI branch doesn't need (see {@link isTrustedOrigin}
 * — the UI relies on Next's built-in server-action Origin check instead). On
 * failure this returns JSON (matching the API's contract) instead of a
 * redirect to the admin login page; on success it forwards the request with
 * {@link ADMIN_VERIFIED_HEADER} set so the route handler doesn't need to
 * re-check the cookie — it only checks that header, via
 * {@link requireProxyVerifiedAdmin}.
 *
 * Deliberate contract change from the routes' previous per-route checks:
 * those always returned 401 regardless of why auth failed, whereas this
 * returns 404 when the admin API is disabled (mirroring the /admin UI
 * branch), 403 for a cross-site request, and 401 only for a missing/invalid
 * admin cookie. External clients that only branched on 401 need to handle
 * 404 and 403 too.
 */
export async function requireAdminAuthApi(
  request: NextRequest
): Promise<NextResponse> {
  const refusal = await adminApiRefusal(request);
  if (refusal) {
    return NextResponse.json(
      { error: refusal.message },
      { ...NO_STORE, status: refusal.status }
    );
  }
  return forwardAsVerifiedAdmin(request);
}

/**
 * Route-handler half of the {@link requireAdminAuthApi} contract: returns a
 * 401 response unless the request carries the header the proxy sets after a
 * successful admin-cookie check, or `null` to proceed.
 *
 * This is not a second authentication — the proxy already decided that, and
 * a client can't reach a route with this header set because the proxy strips
 * any client-supplied copy from every forwarded request. It exists so the
 * routes fail *closed* rather than open if the proxy ever doesn't run ahead
 * of them (a matcher edit, a route moved outside `/api/admin/`, a
 * middleware-bypass bug in Next). Without it these seeding endpoints have no
 * auth of their own at all.
 */
export function requireProxyVerifiedAdmin(
  request: Request
): NextResponse | null {
  if (request.headers.get(ADMIN_VERIFIED_HEADER) === ADMIN_VERIFIED_VALUE) {
    return null;
  }
  return NextResponse.json(
    { error: "Unauthorized" },
    { ...NO_STORE, status: 401 }
  );
}
