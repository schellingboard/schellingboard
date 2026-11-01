import { parse } from "hono/utils/cookie";
import {
  AUTH_COOKIE_NAME,
  GUEST_COOKIE_NAME,
  isAuthCookieValid,
  isPasswordProtectionEnabled,
} from "@/utils/auth";
import type { Problem } from "./problem";

const cookieOf = (req: Request, name: string) =>
  parse(req.headers.get("cookie") ?? "", name)[name];

export const hasSiteCookie = (req: Request) =>
  isAuthCookieValid(cookieOf(req, AUTH_COOKIE_NAME));

// `SameSite=Lax` alone does not cover a cross-site top-level GET, which still
// carries the cookie without an `Origin` header; `Sec-Fetch-Site` closes that
// gap. Scripts send neither header and count as trusted.
export function isTrustedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) return false;
  return req.headers.get("sec-fetch-site") !== "cross-site";
}

/**
 * Only a cross-site request or one with no guest cookie is turned away here;
 * the use cases check the site-admin role.
 */
export function adminApiRefusal(req: Request): Problem | null {
  if (!isTrustedOrigin(req)) return { status: 403, code: "request.crossSite" };
  if (!cookieOf(req, GUEST_COOKIE_NAME))
    return { status: 401, code: "admin.unauthenticated" };
  return null;
}

// The site password route and the version open before the cookie exists.
export async function siteApiRefusal(req: Request): Promise<Problem | null> {
  const { pathname } = new URL(req.url);
  if (pathname.startsWith("/api/v1/auth/") && !isTrustedOrigin(req))
    return { status: 403, code: "request.crossSite" };
  const open =
    pathname === "/api/v1/auth/site" || pathname === "/api/v1/health";
  if (!open && isPasswordProtectionEnabled() && !(await hasSiteCookie(req)))
    return { status: 401, code: "site.unauthenticated" };
  return null;
}
