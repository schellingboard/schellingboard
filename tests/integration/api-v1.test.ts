import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { z } from "zod";
import { createRoute } from "@hono/zod-openapi";
import { GET } from "@/app/api/v1/[[...route]]/route";
import { createApp } from "@/server/http/create-app";
import { actorMiddleware } from "@/server/http/actor";
import { openApiDocument } from "@/server/http/openapi";
import {
  ADMIN_VERIFIED_HEADER,
  createAdminAuthCookie,
  createAuthCookie,
} from "@/utils/auth";
import { throughProxy } from "../helpers/through-proxy";
import {
  GUEST_COOKIE_NAME,
  openGuestValue,
  verifiedGuestValue,
} from "../helpers/guest-cookie";

const VALID_SECRET = "0123456789abcdef0123456789abcdef"; // 32 chars

beforeEach(() => {
  vi.stubEnv("SITE_PASSWORD", "site-pw");
  vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
});
afterEach(() => vi.unstubAllEnvs());

describe("GET /api/v1/health", () => {
  it(
    "answers ok through the mounted route",
    { tags: ["019-US1"] },
    async () => {
      const site = await createAuthCookie();
      const result = await throughProxy("/api/v1/health", {}, [site]);
      if (!result.ok) throw new Error("expected proxy to forward the request");
      const res = await GET(new NextRequest(result.request));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ status: "ok" });
    }
  );

  it("tells browsers not to cache it", { tags: ["019-US1"] }, async () => {
    const res = await GET(new NextRequest("http://test/api/v1/health"));
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("is declared in the OpenAPI document with its response contract", () => {
    const doc = openApiDocument();
    expect(doc.openapi).toBe("3.1.0");
    const health = doc.paths?.["/api/v1/health"]?.get;
    expect(health?.responses?.["200"]).toMatchObject({
      content: { "application/json": { schema: { type: "object" } } },
    });
  });
});

describe("/api/v1 errors", () => {
  it("answers an unknown path with a problem-details 404", async () => {
    const res = await GET(new NextRequest("http://test/api/v1/no-such-thing"));
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toBe("application/problem+json");
    expect(await res.json()).toEqual({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      code: "route.notFound",
    });
  });

  it("answers a request that fails its contract with 400 request.invalid", async () => {
    const app = createApp();
    app.openapi(
      createRoute({
        method: "post",
        path: "/things",
        request: {
          body: {
            content: {
              "application/json": { schema: z.object({ name: z.string() }) },
            },
          },
        },
        responses: { 204: { description: "Created" } },
      }),
      (c) => c.body(null, 204)
    );
    const res = await app.request("/things", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: 3 }),
    });
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toBe("application/problem+json");
    const body = (await res.json()) as {
      code: string;
      errors: { path: string; message: string }[];
    };
    expect(body.code).toBe("request.invalid");
    expect(body.errors).toEqual([
      { path: "name", message: expect.any(String) as string },
    ]);
  });

  it("answers an unexpected failure with a problem-details 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const app = createApp();
    app.get("/boom", () => {
      throw new Error("boom");
    });
    const res = await app.request("/boom");
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ code: "server.error" });
  });
});

describe("actor middleware", () => {
  function actorApp() {
    const app = createApp();
    app.use("*", actorMiddleware);
    app.get("/me", (c) => c.json(c.var.actor));
    return app;
  }

  it("resolves no one from a request without cookies", async () => {
    const res = await actorApp().request("/me");
    expect(await res.json()).toEqual({ admin: false, guest: null });
  });

  it("resolves the admin from a valid admin cookie", async () => {
    const admin = await createAdminAuthCookie();
    const res = await actorApp().request("/me", {
      headers: { cookie: `${admin.name}=${admin.value}` },
    });
    expect(await res.json()).toEqual({ admin: true, guest: null });
  });

  it("resolves the guest and level the guest cookie names", async () => {
    const open = await actorApp().request("/me", {
      headers: { cookie: `${GUEST_COOKIE_NAME}=${openGuestValue("g1")}` },
    });
    expect(await open.json()).toEqual({
      admin: false,
      guest: { id: "g1", level: "open" },
    });

    const verified = await actorApp().request("/me", {
      headers: {
        cookie: `${GUEST_COOKIE_NAME}=${await verifiedGuestValue("g2")}`,
      },
    });
    expect(await verified.json()).toEqual({
      admin: false,
      guest: { id: "g2", level: "verified" },
    });
  });
});

describe("proxy: /api/v1", () => {
  it("refuses a request without the site cookie with a problem-details 401", async () => {
    const result = await throughProxy("/api/v1/health", {}, []);
    if (result.ok) throw new Error("expected proxy to reject the request");
    expect(result.response.status).toBe(401);
    expect(result.response.headers.get("location")).toBeNull();
    expect(result.response.headers.get("content-type")).toBe(
      "application/problem+json"
    );
    expect(await result.response.json()).toMatchObject({
      status: 401,
      code: "site.unauthenticated",
    });
  });

  it("lets the admin cookie stand in for the site cookie", async () => {
    const admin = await createAdminAuthCookie();
    const result = await throughProxy("/api/v1/sessions", {}, [admin]);
    if (!result.ok) throw new Error("expected proxy to forward the request");
    expect(result.request.headers.get(ADMIN_VERIFIED_HEADER)).toBeNull();
  });

  it("gates /api/v1/admin/* by the admin cookie alone", async () => {
    const admin = await createAdminAuthCookie();
    const result = await throughProxy("/api/v1/admin/events", {}, [admin]);
    if (!result.ok) throw new Error("expected proxy to forward the request");
    expect(result.request.headers.get(ADMIN_VERIFIED_HEADER)).toBe("1");
  });

  it("strips a forged admin-verified header outside /api/v1/admin", async () => {
    const site = await createAuthCookie();
    const result = await throughProxy(
      "/api/v1/health",
      { headers: { [ADMIN_VERIFIED_HEADER]: "1" } },
      [site]
    );
    if (!result.ok) throw new Error("expected proxy to forward the request");
    expect(result.request.headers.get(ADMIN_VERIFIED_HEADER)).toBeNull();
  });

  it.each([
    [
      "only the site cookie",
      createAuthCookie,
      {},
      401,
      "admin.unauthenticated",
    ],
    [
      "a cross-site request",
      createAdminAuthCookie,
      { headers: { "sec-fetch-site": "cross-site" } },
      403,
      "request.crossSite",
    ],
  ] as const)(
    "refuses an admin request with %s as problem details",
    async (_, createCookie, init, status, code) => {
      const result = await throughProxy("/api/v1/admin/events", init, [
        await createCookie(),
      ]);
      if (result.ok) throw new Error("expected proxy to reject the request");
      expect(result.response.status).toBe(status);
      expect(result.response.headers.get("content-type")).toBe(
        "application/problem+json"
      );
      expect(await result.response.json()).toMatchObject({ status, code });
    }
  );

  it("answers 404 admin.disabled when the admin feature is off", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    const result = await throughProxy("/api/v1/admin/events", {}, []);
    if (result.ok) throw new Error("expected proxy to reject the request");
    expect(result.response.status).toBe(404);
    expect(await result.response.json()).toMatchObject({
      code: "admin.disabled",
    });
  });
});
