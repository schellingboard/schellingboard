// @module-tag 002-US1
// @module-tag 003-US2
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { DELETE, GET, POST } from "@/tests/helpers/v1-route";
import { AUTH_COOKIE_NAME, isAuthCookieValid } from "@/utils/auth";
import {
  AUTH_API_LIMIT,
  LOGIN_LIMITS,
  resetRateLimits,
} from "@/server/kernel/rate-limit";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import { GUEST_COOKIE_NAME, sessionGuestValue } from "../helpers/guest-cookie";

const enter = (password: unknown, headers: Record<string, string> = {}) =>
  POST(
    new Request("http://test/api/v1/auth/site", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify({ password }),
    })
  );

const cookieValue = (res: Response) =>
  new RegExp(`${AUTH_COOKIE_NAME}=([^;]*)`).exec(
    res.headers.get("set-cookie") ?? ""
  )?.[1];

beforeAll(setupTestDb);
beforeEach(() => {
  resetTestDb();
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

describe("DELETE /api/v1/auth/site", () => {
  it(
    "clears the site and guest cookies and ends the login session",
    { tags: ["003-US2"] },
    async () => {
      const guest = await createGuest();
      const cookie = `${GUEST_COOKIE_NAME}=${await sessionGuestValue(guest.id, "verified")}`;

      const res = await DELETE(
        new Request("http://test/api/v1/auth/site", {
          method: "DELETE",
          headers: { cookie },
        })
      );

      expect(res.status).toBe(204);
      const cookies = res.headers.getSetCookie();
      expect(cookies.some((c) => c.startsWith(`${AUTH_COOKIE_NAME}=;`))).toBe(
        true
      );
      expect(cookies.some((c) => c.startsWith(`${GUEST_COOKIE_NAME}=;`))).toBe(
        true
      );
      expect(
        await (
          await GET(
            new Request("http://test/api/v1/me/identity", {
              headers: { cookie },
            })
          )
        ).json()
      ).toEqual({ guestId: null });
    }
  );

  it(
    "is harmless when nobody is signed in",
    { tags: ["003-US2"] },
    async () => {
      const res = await DELETE(
        new Request("http://test/api/v1/auth/site", { method: "DELETE" })
      );

      expect(res.status).toBe(204);
    }
  );

  it(
    "is not held back by the sign-in rate limit",
    { tags: ["003-US2"] },
    async () => {
      vi.stubEnv("SB_TRUSTED_PROXIES", "1");
      const headers = { "x-forwarded-for": "203.0.113.9" };
      for (let i = 0; i <= AUTH_API_LIMIT.capacity; i++)
        await enter("wrong", headers);
      expect((await enter("wrong", headers)).status).toBe(429);

      const res = await DELETE(
        new Request("http://test/api/v1/auth/site", {
          method: "DELETE",
          headers,
        })
      );

      expect(res.status).toBe(204);
    }
  );
});
