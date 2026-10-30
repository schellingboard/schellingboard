import { NextRequest, NextResponse } from "next/server";
import {
  GUEST_COOKIE_NAME,
  COOKIE_MAX_AGE_SEC,
  isAuthCookieValid,
  isPasswordProtectionEnabled,
  signCookieValue,
  cookieOptions,
} from "@/utils/auth-cookies";

export {
  GUEST_COOKIE_NAME,
  isAuthCookieValid,
  isPasswordProtectionEnabled,
  createGuestCookie,
  createGuestLogoutCookie,
} from "@/utils/auth-cookies";

export const AUTH_COOKIE_NAME = "site-auth";
export { safeRedirectPath } from "@schellingboard/domain/safe-redirect";

const encoder = new TextEncoder();

// Constant-time string comparison for the shared site password. This
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

export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return isAuthCookieValid(cookie);
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
export function isTrustedOrigin(request: NextRequest): boolean {
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
  status: 401 | 403;
  code: "request.crossSite" | "admin.unauthenticated";
};

/**
 * The proxy has no database, so it only turns away a cross-site request or one
 * with no guest cookie at all; the use cases check the site-admin role.
 */
export function adminApiRefusal(request: NextRequest): AdminApiRefusal | null {
  if (!isTrustedOrigin(request)) {
    return { status: 403, code: "request.crossSite" };
  }
  if (!request.cookies.has(GUEST_COOKIE_NAME)) {
    return { status: 401, code: "admin.unauthenticated" };
  }
  return null;
}
