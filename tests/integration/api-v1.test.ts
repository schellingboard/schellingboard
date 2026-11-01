import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { NextRequest } from "next/server";
import { z } from "zod";
import { createRoute } from "@hono/zod-openapi";
import { GET } from "@/tests/helpers/v1-route";
import { createApp } from "@/server/http/create-app";
import { actorMiddleware } from "@/server/http/actor";
import { openApiDocument } from "@/server/http/openapi";
import { createAuthCookie } from "@/utils/auth";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import { createAdminAuthCookie } from "../helpers/admin-cookie";
import { throughWeb } from "../helpers/through-web";
import {
  GUEST_COOKIE_NAME,
  openGuestValue,
  verifiedGuestValue,
} from "../helpers/guest-cookie";

const VALID_SECRET = "0123456789abcdef0123456789abcdef"; // 32 chars

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("SITE_PASSWORD", "site-pw");
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
});
afterEach(() => vi.unstubAllEnvs());

describe("GET /api/v1/health", () => {
  it(
    "answers ok through the mounted route",
    { tags: ["019-US1"] },
    async () => {
      const site = await createAuthCookie();
      const res = await throughWeb("/api/v1/health", {}, [site]);
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ status: "ok" });
    }
  );

  it(
    "names the version and the build, for a client to notice a new deployment",
    { tags: ["019-US1"] },
    async () => {
      vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "v9.9.9");
      const res = await GET(new NextRequest("http://test/api/v1/health"));
      const body = (await res.json()) as { version: string; buildId: string };
      expect(body.version).toBe("v9.9.9");
      expect(body.buildId).toEqual(expect.any(String));
      expect(body.buildId).not.toBe("");
    }
  );

  it(
    "tells the SPA whether the dev tools are on",
    { tags: ["019-US1"] },
    async () => {
      const read = async () =>
        (
          (await (
            await GET(new NextRequest("http://test/api/v1/health"))
          ).json()) as { devTools: boolean }
        ).devTools;

      vi.stubEnv("SB_ENABLE_DEV_TOOLS", "");
      expect(await read()).toBe(false);
      vi.stubEnv("SB_ENABLE_DEV_TOOLS", "1");
      expect(await read()).toBe(true);
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

  it("resolves the admin from a verified site admin's session", async () => {
    const admin = await createAdminAuthCookie();
    const res = await actorApp().request("/me", {
      headers: { cookie: `${admin.name}=${admin.value}` },
    });
    expect(await res.json()).toMatchObject({ admin: true });
  });

  it("resolves the guest and level the guest cookie names", async () => {
    const g1 = (await createGuest()).id;
    const g2 = (await createGuest()).id;
    const open = await actorApp().request("/me", {
      headers: { cookie: `${GUEST_COOKIE_NAME}=${openGuestValue(g1)}` },
    });
    expect(await open.json()).toEqual({
      admin: false,
      guest: {
        id: g1,
        level: "claimed",
        sessionId: expect.any(String) as string,
        siteAdmin: false,
      },
    });

    const verified = await actorApp().request("/me", {
      headers: {
        cookie: `${GUEST_COOKIE_NAME}=${await verifiedGuestValue(g2)}`,
      },
    });
    expect(await verified.json()).toEqual({
      admin: false,
      guest: {
        id: g2,
        level: "verified",
        sessionId: expect.any(String) as string,
        siteAdmin: false,
      },
    });
  });
});

describe("web gates: /api/v1", () => {
  it("refuses a request without the site cookie with a problem-details 401", async () => {
    const res = await throughWeb("/api/v1/events", {}, []);
    expect(res.status).toBe(401);
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("content-type")).toBe("application/problem+json");
    expect(await res.json()).toMatchObject({
      status: 401,
      code: "site.unauthenticated",
    });
  });

  it.each([
    ["a foreign Origin", { origin: "https://evil.example" }],
    ["Sec-Fetch-Site: cross-site", { "sec-fetch-site": "cross-site" }],
  ])("refuses a sign-in request with %s", async (_, headers) => {
    const res = await throughWeb(
      "/api/v1/auth/login",
      { method: "POST", headers },
      [await createAuthCookie()]
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "request.crossSite" });
  });

  it("refuses an admin request with only the site cookie as problem details", async () => {
    const res = await throughWeb("/api/v1/admin/events", {}, [
      await createAuthCookie(),
    ]);
    expect(res.status).toBe(401);
    expect(res.headers.get("content-type")).toBe("application/problem+json");
    expect(await res.json()).toMatchObject({
      status: 401,
      code: "admin.unauthenticated",
    });
  });

  it("refuses a cross-site admin request", async () => {
    const res = await throughWeb(
      "/api/v1/admin/events",
      { headers: { "sec-fetch-site": "cross-site" } },
      [{ name: GUEST_COOKIE_NAME, value: "token" }]
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "request.crossSite" });
  });

  it("leaves a signed-in guest's admin request to the API, without asking for the site password", async () => {
    const res = await throughWeb("/api/v1/admin/events", {}, [
      { name: GUEST_COOKIE_NAME, value: "token" },
    ]);
    const body = (await res.json()) as { code: string };
    expect(body.code).not.toBe("admin.unauthenticated");
    expect(body.code).not.toBe("site.unauthenticated");
    expect(body.code).not.toBe("request.crossSite");
  });
});
