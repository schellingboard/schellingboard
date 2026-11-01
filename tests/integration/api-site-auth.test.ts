// @module-tag 002-US1
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/tests/helpers/v1-route";
import { AUTH_COOKIE_NAME, isAuthCookieValid } from "@/utils/auth";
import { LOGIN_LIMITS, resetRateLimits } from "@/server/kernel/rate-limit";

const enter = (password: unknown) =>
  POST(
    new NextRequest("http://test/api/v1/auth/site", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    })
  );

const cookieValue = (res: Response) =>
  new RegExp(`${AUTH_COOKIE_NAME}=([^;]*)`).exec(
    res.headers.get("set-cookie") ?? ""
  )?.[1];

beforeEach(() => {
  resetRateLimits();
  vi.stubEnv("SITE_PASSWORD", "site-pw");
  vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/v1/auth/site", () => {
  it("answers 204 and sets the site cookie for the right password", async () => {
    const res = await enter("site-pw");

    expect(res.status).toBe(204);
    expect(await isAuthCookieValid(cookieValue(res))).toBe(true);
    expect(res.headers.get("set-cookie")).toMatch(/HttpOnly/i);
  });

  it("answers 403 site.passwordWrong and sets no cookie for a wrong one", async () => {
    const res = await enter("nope");

    expect(res.status).toBe(403);
    expect(((await res.json()) as { code: string }).code).toBe(
      "site.passwordWrong"
    );
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("throttles repeated failures, even with the right password", async () => {
    for (let i = 0; i < LOGIN_LIMITS.perClient.capacity; i++)
      expect((await enter("wrong")).status).toBe(403);

    const res = await enter("site-pw");

    expect(res.status).toBe(429);
    expect(Number(res.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("lets anyone in when no site password is set", async () => {
    vi.stubEnv("SITE_PASSWORD", "");

    const res = await enter("anything");

    expect(res.status).toBe(204);
  });
});
