// @module-tag 019-US6
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/v1/[[...route]]/route";
import { openApiDocument } from "@/server/http/openapi";
import { createAuthCookie } from "@/utils/auth";
import { throughProxy } from "../helpers/through-proxy";

beforeEach(() => {
  vi.stubEnv("SITE_PASSWORD", "site-pw");
  vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
  vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
});
afterEach(() => vi.unstubAllEnvs());

async function getAsAttendee(path: string) {
  const result = await throughProxy(path, {}, [await createAuthCookie()]);
  if (!result.ok) throw new Error("expected proxy to forward the request");
  return GET(new NextRequest(result.request));
}

describe("API docs", () => {
  it("serves the OpenAPI document of the running version", async () => {
    const res = await getAsAttendee("/api/v1/openapi.json");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(openApiDocument());
  });

  it("serves the API reference with its script from the site itself", async () => {
    const page = await getAsAttendee("/api/v1/docs");
    expect(page.status).toBe(200);
    expect(page.headers.get("content-type")).toMatch(/^text\/html/);
    const html = await page.text();
    expect(html).toContain('src="/api/v1/docs/scalar.js"');
    expect(html).toContain("/api/v1/openapi.json");
    expect(html).not.toMatch(/https?:\/\//);

    const script = await getAsAttendee("/api/v1/docs/scalar.js");
    expect(script.status).toBe(200);
    expect(script.headers.get("content-type")).toMatch(/^text\/javascript/);
    expect((await script.text()).length).toBeGreaterThan(100_000);
  });

  it.each(["false", "0"])(
    "serves none of it with API_DOCS=%s",
    async (value) => {
      vi.stubEnv("API_DOCS", value);
      for (const path of [
        "/api/v1/openapi.json",
        "/api/v1/docs",
        "/api/v1/docs/scalar.js",
      ]) {
        const res = await getAsAttendee(path);
        expect(res.status).toBe(404);
        expect(await res.json()).toMatchObject({ code: "route.notFound" });
      }
    }
  );
});
