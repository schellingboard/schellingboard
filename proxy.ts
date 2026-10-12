import { NextRequest, NextResponse } from "next/server";
import { problemResponse, type Problem } from "./server/http/problem";
import {
  adminApiRefusal,
  ADMIN_DISABLED_MESSAGE,
  ADMIN_VERIFIED_HEADER,
  forwardAsVerifiedAdmin,
  isAdminAuthenticated,
  isAdminEnabled,
  isAuthenticated,
  isPasswordProtectionEnabled,
  requireAdminAuth,
  requireAdminAuthApi,
  requireAuth,
} from "./utils/auth";
import { requireMediaAuth } from "./utils/media-auth";

// Only the admin API branches (via forwardAsVerifiedAdmin) may grant
// ADMIN_VERIFIED_HEADER (and only ever set it to "1"); every other forwarded
// request must have any client-supplied copy of it removed so a route added
// outside the admin prefixes can never be tricked into trusting a forged value.
function withoutAdminHeader(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  headers.delete(ADMIN_VERIFIED_HEADER);
  return headers;
}

function forwardWithoutAdminHeader(request: NextRequest): NextResponse {
  return NextResponse.next({
    request: { headers: withoutAdminHeader(request) },
  });
}

function refuseApiV1(problem: Problem): NextResponse {
  const res = problemResponse(problem);
  return new NextResponse(res.body, {
    status: res.status,
    headers: res.headers,
  });
}

// Any other path is a page of the SPA, which forwards it to /legacy when it
// does not own it. The shell is the same for everyone, but who may open the
// app is still decided here, as it is for the legacy pages. The admin pages
// are independent of the site password, so their paths get the shell and the
// forwarded /legacy/admin request meets the admin gate.
async function serveShell(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (!underRoot(pathname, "/admin")) {
    const refusal = await requireAuth(request);
    if (refusal) return refusal;
  }
  const target = request.nextUrl.clone();
  target.pathname = "/api/spa/shell";
  return NextResponse.rewrite(target, {
    request: { headers: withoutAdminHeader(request) },
  });
}

// Roots that are not pages: the API and uploaded media keep their URLs.
const NATIVE_ROOTS = ["/api", "/media"];

const underRoot = (pathname: string, root: string) =>
  pathname === root || pathname.startsWith(`${root}/`);

export async function proxy(request: NextRequest) {
  const { pathname: requested } = request.nextUrl;

  const isLegacy = underRoot(requested, "/legacy");
  if (!isLegacy && !NATIVE_ROOTS.some((r) => underRoot(requested, r))) {
    return serveShell(request);
  }
  const pathname = isLegacy
    ? requested.slice("/legacy".length) || "/"
    : requested;

  // Allow access to login page, health check, and auth API routes
  if (
    pathname === "/login" ||
    pathname === "/api/health" ||
    pathname.startsWith("/api/auth/")
  ) {
    return forwardWithoutAdminHeader(request);
  }

  // Admin UI routes are independent of site auth: they require only admin
  // authentication (and return 404 when the admin UI is disabled)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!isAdminEnabled()) {
      return new NextResponse(ADMIN_DISABLED_MESSAGE, { status: 404 });
    }
    if (pathname !== "/admin/login") {
      const adminResponse = await requireAdminAuth(request);
      if (adminResponse) {
        return adminResponse;
      }
    }
    return forwardWithoutAdminHeader(request);
  }

  // Admin API routes are likewise independent of site auth: they require
  // only the admin cookie, checked here (route handlers trust the resulting
  // ADMIN_VERIFIED_HEADER instead of re-checking the cookie themselves, but
  // do require its presence — see requireProxyVerifiedAdmin).
  if (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) {
    return requireAdminAuthApi(request);
  }

  // The versioned API gates like the legacy routes, but refuses as problem
  // details: its clients read a status and a code, never a login page.
  if (pathname === "/api/v1/admin" || pathname.startsWith("/api/v1/admin/")) {
    const refusal = await adminApiRefusal(request);
    return refusal
      ? refuseApiV1({ status: refusal.status, code: refusal.code })
      : forwardAsVerifiedAdmin(request);
  }
  // An admin script then needs one cookie for the whole API, not two.
  if (pathname === "/api/v1" || pathname.startsWith("/api/v1/")) {
    if (
      isPasswordProtectionEnabled() &&
      !(await isAuthenticated(request)) &&
      !(await isAdminAuthenticated(request))
    ) {
      return refuseApiV1({ status: 401, code: "site.unauthenticated" });
    }
    return forwardWithoutAdminHeader(request);
  }

  // Uploaded images are shown to attendees and previewed in the admin UI, so
  // either cookie opens them; the route handlers apply the same rule again.
  if (pathname.startsWith("/media/")) {
    const mediaResponse = await requireMediaAuth(request);
    return mediaResponse ?? forwardWithoutAdminHeader(request);
  }

  // Check authentication for all other routes
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  return forwardWithoutAdminHeader(request);
}

export const config = {
  matcher: [
    /*
     * Everything except an explicit list of what must stay public:
     * - _next/static — build output, no user data
     * - _next/image  — dead under the custom loader (it 404s, see
     *                  next.config.js), and build assets either way
     * - the three icons app/layout.tsx loads, which the login page needs
     *   before anyone has a cookie
     * - locations/  — the seeded room photos in public/, which the admin UI
     *   renders with the admin cookie alone (uploads live under /media)
     * - the manifest and its icons — installing has to work before anyone
     *   has logged in, and Safari fetches the manifest without our cookie
     *   either way. Both are build assets naming the instance, which the
     *   login page shows already
     * - one-on-one.webp — the 1-on-1 column's picture, requested by its root
     *   path (the image is unoptimized)
     * - _spa/ — the SPA's hashed assets, build output like _next/static; the
     *   shell that loads them is gated
     * - sw.js — the service worker push notifications are delivered to. The
     *   browser fetches it without our cookie, and a login page in its place
     *   takes notifications with it
     *
     * This deliberately does NOT exempt paths by file extension. It used to,
     * and since media filenames are `<id>.<jpg|png|webp>` that exempted every
     * uploaded avatar, location image and site map from auth entirely — see
     * matcher's own test at tests/unit/proxy-matcher.test.ts.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|apple-touch-icon\\.png|manifest\\.webmanifest|icon-192\\.png|icon-512\\.png|icon-maskable-512\\.png|sw\\.js|one-on-one\\.webp|_spa/|locations/).*)",
  ],
};
