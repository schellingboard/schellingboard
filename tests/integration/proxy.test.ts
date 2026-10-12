import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  ADMIN_VERIFIED_HEADER,
  createAdminAuthCookie,
  createAuthCookie,
} from "@/utils/auth";
import { throughProxy } from "../helpers/through-proxy";

const VALID_SECRET = "0123456789abcdef0123456789abcdef"; // 32 chars

describe("proxy: /api/admin/* auth", () => {
  beforeEach(() => {
    vi.stubEnv("SITE_PASSWORD", "site-pw");
    vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("allows a request carrying only the admin cookie (no site cookie) and forwards a trusted header", async () => {
    const admin = await createAdminAuthCookie();
    const result = await throughProxy("/api/admin/create-guest", {}, [admin]);
    if (!result.ok) throw new Error("expected proxy to forward the request");
    expect(result.request.headers.get(ADMIN_VERIFIED_HEADER)).toBe("1");
  });

  it("returns a no-store JSON 401 (not an HTML redirect) when the admin cookie is missing", async () => {
    const result = await throughProxy("/api/admin/create-guest", {}, []);
    if (result.ok) throw new Error("expected proxy to reject the request");
    expect(result.response.status).toBe(401);
    expect(result.response.headers.get("location")).toBeNull();
    expect(result.response.headers.get("cache-control")).toBe("no-store");
    expect(await result.response.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns a no-store 404 when the admin feature is disabled, without touching site auth", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    const result = await throughProxy("/api/admin/create-guest", {}, []);
    if (result.ok) throw new Error("expected proxy to reject the request");
    expect(result.response.status).toBe(404);
    expect(result.response.headers.get("cache-control")).toBe("no-store");
  });

  it("also gates the exact /api/admin path (no trailing segment)", async () => {
    const result = await throughProxy("/api/admin", {}, []);
    if (result.ok) throw new Error("expected proxy to reject the request");
    expect(result.response.status).toBe(401);
  });

  it("still requires site auth for non-admin API routes", async () => {
    const admin = await createAdminAuthCookie();
    const result = await throughProxy("/api/votes", {}, [admin]);
    if (result.ok) throw new Error("expected proxy to redirect the request");
    expect(result.response.headers.get("location")).toMatch(/\/login/);
  });

  it("strips a client-forged admin-verified header from every forwarded request", async () => {
    const result = await throughProxy("/api/health", {
      headers: { [ADMIN_VERIFIED_HEADER]: "1" },
    });
    if (!result.ok) throw new Error("expected proxy to forward the request");
    expect(result.request.headers.get(ADMIN_VERIFIED_HEADER)).toBeNull();
  });

  it("rejects a request whose Origin header doesn't match the request's own origin (CSRF)", async () => {
    const admin = await createAdminAuthCookie();
    const result = await throughProxy(
      "/api/admin/create-guest",
      { headers: { origin: "https://evil.example" } },
      [admin]
    );
    if (result.ok) throw new Error("expected proxy to reject the request");
    expect(result.response.status).toBe(403);
    expect(result.response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects a cross-site request flagged by Sec-Fetch-Site even without an Origin header", async () => {
    const admin = await createAdminAuthCookie();
    const result = await throughProxy(
      "/api/admin/create-guest",
      { headers: { "sec-fetch-site": "cross-site" } },
      [admin]
    );
    if (result.ok) throw new Error("expected proxy to reject the request");
    expect(result.response.status).toBe(403);
  });

  it("allows a request with a matching Origin header", async () => {
    const admin = await createAdminAuthCookie();
    const result = await throughProxy(
      "/api/admin/create-guest",
      { headers: { origin: "http://test" } },
      [admin]
    );
    if (!result.ok) throw new Error("expected proxy to forward the request");
  });

  it("allows a script request with neither Origin nor Sec-Fetch-Site header", async () => {
    const admin = await createAdminAuthCookie();
    const result = await throughProxy("/api/admin/create-guest", {}, [admin]);
    if (!result.ok) throw new Error("expected proxy to forward the request");
  });
});

// Uploaded images are shown to attendees, who hold the site cookie, and
// previewed in the admin UI, which is independent of site auth — so either
// cookie opens them. The route handlers apply the same rule (see
// utils/media-auth.ts and tests/integration/media-routes.test.ts).
describe("proxy: /media auth", () => {
  beforeEach(() => {
    vi.stubEnv("SITE_PASSWORD", "site-pw");
    vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("forwards a request carrying the site cookie", async () => {
    const site = await createAuthCookie();
    const result = await throughProxy("/media/avatars/abc.webp", {}, [site]);
    if (!result.ok) throw new Error("expected proxy to forward the request");
  });

  it("forwards a request carrying only the admin cookie", async () => {
    const admin = await createAdminAuthCookie();
    const result = await throughProxy("/media/locations/abc.webp", {}, [admin]);
    if (!result.ok) throw new Error("expected proxy to forward the request");
  });

  it("answers 401 rather than redirecting an unauthenticated image request", async () => {
    const result = await throughProxy("/media/site/map.webp", {}, []);
    if (result.ok) throw new Error("expected proxy to reject the request");
    expect(result.response.status).toBe(401);
    expect(result.response.headers.get("location")).toBeNull();
  });
});

const rewriteTarget = (response: Response) => {
  const header = response.headers.get("x-middleware-rewrite");
  return header === null ? null : new URL(header);
};

describe("proxy: pages live under /legacy", () => {
  beforeEach(() => {
    vi.stubEnv("SITE_PASSWORD", "site-pw");
    vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("serves the SPA shell for a root page path, keeping the query, once logged in", async () => {
    const cookie = await createAuthCookie();
    for (const path of ["/", "/conf/proposals?viewProposal=p1"]) {
      const result = await throughProxy(path, {}, [cookie]);
      if (result.ok) throw new Error(`expected a rewrite for ${path}`);
      const target = rewriteTarget(result.response);
      expect(target?.pathname, path).toBe("/api/spa/shell");
      expect(result.response.headers.get("location"), path).toBeNull();
    }
  });

  it("asks for the site password before the shell, and returns to the same page", async () => {
    const result = await throughProxy("/conf?x=1", {}, []);
    if (result.ok) throw new Error("expected a redirect");
    expect(rewriteTarget(result.response)).toBeNull();
    const location = new URL(result.response.headers.get("location")!);
    expect(location.pathname).toBe("/legacy/login");
    expect(location.searchParams.get("redirect")).toBe("/conf?x=1");
  });

  it("serves the shell for the admin paths without the site password, as their gate lives at /legacy/admin", async () => {
    const result = await throughProxy("/admin/events", {}, []);
    if (result.ok) throw new Error("expected a rewrite");
    expect(rewriteTarget(result.response)?.pathname).toBe("/api/spa/shell");
  });

  it("gates /legacy pages with the site password and returns to the same page", async () => {
    const result = await throughProxy("/legacy/conf", {}, []);
    if (result.ok) throw new Error("expected a redirect");
    const location = new URL(result.response.headers.get("location")!);
    expect(location.pathname).toBe("/legacy/login");
    expect(location.searchParams.get("redirect")).toBe("/legacy/conf");
  });

  it("lets the login page through and gates /legacy/admin with the admin cookie", async () => {
    expect((await throughProxy("/legacy/login", {}, [])).ok).toBe(true);
    const gated = await throughProxy("/legacy/admin/events", {}, []);
    if (gated.ok) throw new Error("expected a redirect");
    expect(new URL(gated.response.headers.get("location")!).pathname).toBe(
      "/legacy/admin/login"
    );
  });

  it("leaves /api and /media at the root", async () => {
    expect((await throughProxy("/api/health", {}, [])).ok).toBe(true);
    const media = await throughProxy("/media/avatars/x.webp", {}, []);
    if (media.ok) throw new Error("expected a refusal");
    expect(media.response.status).toBe(401);
    expect(media.response.headers.get("location")).toBeNull();
  });

  it("never redirects a /legacy path to itself", async () => {
    const cookie = await createAuthCookie();
    for (const path of ["/legacy", "/legacy/conf", "/legacy/guests/x"]) {
      expect((await throughProxy(path, {}, [cookie])).ok, path).toBe(true);
    }
  });

  it("always rewrites to the one shell route, whatever the path", async () => {
    const cookie = await createAuthCookie();
    for (const path of ["//evil.com", "/\\evil.com", "/%2f%2fevil.com"]) {
      const result = await throughProxy(path, {}, [cookie]);
      if (result.ok) throw new Error(`expected a rewrite for ${path}`);
      const target = rewriteTarget(result.response)!;
      expect(target.origin, path).toBe("http://test");
      expect(target.pathname, path).toBe("/api/spa/shell");
    }
  });

  it("keeps unauthenticated crafted paths on this origin", async () => {
    for (const path of ["//evil.com", "/\\evil.com", "/%2f%2fevil.com"]) {
      const result = await throughProxy(path, {}, []);
      if (result.ok) throw new Error(`expected a redirect for ${path}`);
      const location = new URL(
        result.response.headers.get("location")!,
        "http://test"
      );
      expect(location.origin, path).toBe("http://test");
      expect(location.pathname, path).toBe("/legacy/login");
    }
  });

  it("gates /legacy/api and /legacy/media like the root ones, which hold no routes", async () => {
    const api = await throughProxy("/legacy/api/v1/health", {}, []);
    if (api.ok) throw new Error("expected a refusal");
    expect(api.response.status).toBe(401);
    const media = await throughProxy("/legacy/media/x.webp", {}, []);
    if (media.ok) throw new Error("expected a refusal");
    expect(media.response.status).toBe(401);
  });
});
