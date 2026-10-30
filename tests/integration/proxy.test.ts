import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createAuthCookie } from "@/utils/auth";
import { throughProxy } from "../helpers/through-proxy";

const VALID_SECRET = "0123456789abcdef0123456789abcdef"; // 32 chars

// Uploaded images are shown to anyone holding the site cookie. The route
// handlers apply the same rule (see utils/media-auth.ts and
// tests/integration/media-routes.test.ts).
describe("proxy: /media auth", () => {
  beforeEach(() => {
    vi.stubEnv("SITE_PASSWORD", "site-pw");
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("forwards a request carrying the site cookie", async () => {
    const site = await createAuthCookie();
    const result = await throughProxy("/media/avatars/abc.webp", {}, [site]);
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
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("redirect")).toBe("/conf?x=1");
  });

  it("serves the shell for the admin paths without the site password, as the admin API is their gate", async () => {
    const result = await throughProxy("/admin/events", {}, []);
    if (result.ok) throw new Error("expected a rewrite");
    expect(rewriteTarget(result.response)?.pathname).toBe("/api/spa/shell");
  });

  it("gates /legacy pages with the site password and returns to the same page", async () => {
    const result = await throughProxy("/legacy/conf", {}, []);
    if (result.ok) throw new Error("expected a redirect");
    const location = new URL(result.response.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("redirect")).toBe("/legacy/conf");
  });

  it("serves the site password screen's shell without the cookie", async () => {
    const result = await throughProxy("/login?redirect=%2Fconf", {}, []);
    if (result.ok) throw new Error("expected a rewrite");
    expect(rewriteTarget(result.response)?.pathname).toBe("/api/spa/shell");
  });

  it("lets a visitor without the cookie reach the site password route and the health route", async () => {
    for (const path of ["/api/v1/auth/site", "/api/v1/health"])
      expect((await throughProxy(path, {}, [])).ok, path).toBe(true);
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
      expect(location.pathname, path).toBe("/login");
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
