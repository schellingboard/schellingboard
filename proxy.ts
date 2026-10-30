import { NextRequest, NextResponse } from "next/server";
import { problemResponse, type Problem } from "./server/http/problem";
import {
  adminApiRefusal,
  isTrustedOrigin,
  isAuthenticated,
  isPasswordProtectionEnabled,
  requireAuth,
} from "./utils/auth";
import { requireMediaAuth } from "./utils/media-auth";

function refuseApiV1(problem: Problem): NextResponse {
  const res = problemResponse(problem);
  return new NextResponse(res.body, {
    status: res.status,
    headers: res.headers,
  });
}

// Any other path is a page of the SPA, which forwards it to /legacy when it
// does not own it. The shell is the same for everyone, but who may open the
// app is still decided here, as it is for the legacy pages. The site password
// screen, `/login`, is how a visitor gets past that. The admin pages get the
// shell too: the admin API they call holds the gate.
async function serveShell(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (!underRoot(pathname, "/admin") && pathname !== "/login") {
    const refusal = await requireAuth(request);
    if (refusal) return refusal;
  }
  const target = request.nextUrl.clone();
  target.pathname = "/api/spa/shell";
  return NextResponse.rewrite(target);
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

  // Allow access to the health check and the site logout
  if (pathname === "/api/health" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // The versioned API refuses as problem details: its clients read a status
  // and a code, never a login page. The admin API is independent of the site
  // password; a script signs in as a site admin.
  if (pathname === "/api/v1/admin" || pathname.startsWith("/api/v1/admin/")) {
    const refusal = adminApiRefusal(request);
    return refusal ? refuseApiV1(refusal) : NextResponse.next();
  }
  if (pathname === "/api/v1" || pathname.startsWith("/api/v1/")) {
    if (pathname.startsWith("/api/v1/auth/") && !isTrustedOrigin(request)) {
      return refuseApiV1({ status: 403, code: "request.crossSite" });
    }
    // Visitors need the site password's own route and the build's version
    // (the login screen's footer) before they have the cookie.
    const open =
      !isLegacy &&
      (pathname === "/api/v1/auth/site" || pathname === "/api/v1/health");
    if (
      !open &&
      isPasswordProtectionEnabled() &&
      !(await isAuthenticated(request))
    ) {
      return refuseApiV1({ status: 401, code: "site.unauthenticated" });
    }
    return NextResponse.next();
  }

  // The route handlers apply the same rule again.
  if (pathname.startsWith("/media/")) {
    const mediaResponse = await requireMediaAuth(request);
    return mediaResponse ?? NextResponse.next();
  }

  // Check authentication for all other routes
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  return NextResponse.next();
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
     *   renders before the site password may have been entered (uploads
     *   live under /media)
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
