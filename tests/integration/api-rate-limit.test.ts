// @module-tag 019-US10
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
import { GET } from "@/app/api/v1/[[...route]]/route";
import { API_LIMIT } from "@/server/kernel/rate-limit";
import { createAdminAuthCookie } from "@/utils/auth";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";

const get = (path: string, cookie = "") =>
  GET(
    new NextRequest(`http://test/api/v1${path}`, {
      headers: cookie ? { cookie } : {},
    })
  );

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
  vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
  vi.stubEnv("SB_API_RATE_BURST", "");
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("/api/v1 rate limit", () => {
  it("refuses an actor's requests past the limit and says when to retry", async () => {
    const c = await createAdminAuthCookie();
    const admin = `${c.name}=${c.value}`;
    const guest = await createGuest();
    const asGuest = `${GUEST_COOKIE_NAME}=${openGuestValue(guest.id)}`;

    for (let i = 0; i < API_LIMIT.capacity; i++)
      expect((await get("/events", admin)).status).toBe(200);
    const limited = await get("/events", admin);
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("1");
    expect(await limited.json()).toMatchObject({ code: "rate.limited" });

    expect((await get("/events", asGuest)).status).toBe(200);
    expect((await get("/events")).status).toBe(200);
  });

  it("does not give each unproven name a bucket of its own", async () => {
    for (let i = 0; i < API_LIMIT.capacity; i++) {
      const guest = await createGuest();
      await get("/events", `${GUEST_COOKIE_NAME}=${openGuestValue(guest.id)}`);
    }
    const fresh = await createGuest();
    const limited = await get(
      "/events",
      `${GUEST_COOKIE_NAME}=${openGuestValue(fresh.id)}`
    );
    expect(limited.status).toBe(429);
  });

  it("limits visitors without a name by address, behind a trusted proxy", async () => {
    vi.stubEnv("SB_TRUSTED_PROXIES", "1");
    const from = (ip: string) =>
      GET(
        new NextRequest("http://test/api/v1/events", {
          headers: { "x-forwarded-for": ip },
        })
      );
    for (let i = 0; i < API_LIMIT.capacity; i++) await from("203.0.113.9");
    expect((await from("203.0.113.9")).status).toBe(429);
    expect((await from("198.51.100.7")).status).toBe(200);
  });

  it("takes a larger burst from SB_API_RATE_BURST, for the E2E suite's shared address", async () => {
    vi.stubEnv("SB_API_RATE_BURST", String(API_LIMIT.capacity * 2));
    for (let i = 0; i <= API_LIMIT.capacity; i++)
      expect((await get("/events")).status).toBe(200);
  });

  it("never limits the health check", async () => {
    for (let i = 0; i <= API_LIMIT.capacity; i++)
      expect((await get("/health")).status).toBe(200);
  });
});
