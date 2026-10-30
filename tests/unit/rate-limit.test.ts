import { describe, it, expect, afterEach, vi } from "vitest";
import {
  clientIp,
  loginRetryAfter,
  recordLoginFailure,
  takeToken,
  LOGIN_LIMITS,
  MAX_BUCKETS,
} from "@/server/kernel/rate-limit";

const T0 = Date.parse("2026-07-25T12:00:00Z");

describe("takeToken", () => {
  const limit = { capacity: 3, refillEveryMs: 10_000 };

  it("hands out a full bucket, then says how long until the next token", () => {
    for (let i = 0; i < 3; i++) expect(takeToken("k", limit, T0)).toBe(0);
    expect(takeToken("k", limit, T0)).toBe(10);
    expect(takeToken("k", limit, T0 + 2_500)).toBe(8);
  });

  it("refills one token per interval, up to the capacity", () => {
    for (let i = 0; i < 3; i++) takeToken("k", limit, T0);
    expect(takeToken("k", limit, T0 + 10_000)).toBe(0);
    expect(takeToken("k", limit, T0 + 10_000)).toBe(10);

    for (let i = 0; i < 3; i++)
      expect(takeToken("k", limit, T0 + 1_000_000)).toBe(0);
    expect(takeToken("k", limit, T0 + 1_000_000)).toBe(10);
  });

  it("drops the oldest buckets once it holds too many", () => {
    const once = { capacity: 1, refillEveryMs: 60_000 };
    for (let i = 0; i <= MAX_BUCKETS; i++) takeToken(`k${i}`, once, T0);
    expect(takeToken("k0", once, T0)).toBe(0);
    expect(takeToken(`k${MAX_BUCKETS}`, once, T0)).toBe(60);
  });

  it("keeps keys apart", () => {
    for (let i = 0; i < 3; i++) takeToken("a", limit, T0);
    expect(takeToken("b", limit, T0)).toBe(0);
  });
});

describe("login limits", () => {
  const perClient = LOGIN_LIMITS.perClient.capacity;

  it("allows attempts before any failure", () => {
    expect(loginRetryAfter("site", "1.2.3.4", T0)).toBe(0);
  });

  it("blocks a client after too many failures, then allows one more per interval", () => {
    for (let i = 0; i < perClient; i++) {
      expect(loginRetryAfter("site", "1.2.3.4", T0)).toBe(0);
      recordLoginFailure("site", "1.2.3.4", T0);
    }
    expect(loginRetryAfter("site", "1.2.3.4", T0)).toBe(
      LOGIN_LIMITS.perClient.refillEveryMs / 1000
    );
    const later = T0 + LOGIN_LIMITS.perClient.refillEveryMs;
    expect(loginRetryAfter("site", "1.2.3.4", later)).toBe(0);
    recordLoginFailure("site", "1.2.3.4", later);
    expect(loginRetryAfter("site", "1.2.3.4", later)).toBeGreaterThan(0);
  });

  it("keeps other clients and scopes unaffected", () => {
    for (let i = 0; i < perClient; i++)
      recordLoginFailure("site", "1.2.3.4", T0);
    expect(loginRetryAfter("site", "1.2.3.4", T0)).toBeGreaterThan(0);
    expect(loginRetryAfter("site", "5.6.7.8", T0)).toBe(0);
    expect(loginRetryAfter("guest", "1.2.3.4", T0)).toBe(0);
  });

  it("blocks a whole scope when failures spread across many clients", () => {
    for (let i = 0; i < LOGIN_LIMITS.perScope.capacity; i++)
      recordLoginFailure("site", `10.0.${i >> 8}.${i & 255}`, T0);
    expect(loginRetryAfter("site", "never-seen-before", T0)).toBeGreaterThan(0);
  });
});

describe("clientIp", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });
  const forwarded = new Headers({
    "x-forwarded-for": "6.6.6.6, 203.0.113.9, 10.0.0.2",
  });

  it("ignores X-Forwarded-For unless proxies are trusted", () => {
    expect(clientIp(forwarded)).toBe("unknown");
    expect(clientIp(new Headers({ "x-real-ip": "203.0.113.9" }))).toBe(
      "unknown"
    );
  });

  it("warns once when a proxy forwards the address but none is trusted", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    clientIp(forwarded);
    clientIp(forwarded);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/SB_TRUSTED_PROXIES/);
  });

  it("warns about a setting that is not a count", () => {
    vi.stubEnv("SB_TRUSTED_PROXIES", "true");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(clientIp(forwarded)).toBe("unknown");
    expect(warn.mock.calls[0][0]).toMatch(/"true"/);
  });

  it("takes the address the outermost trusted proxy appended", () => {
    vi.stubEnv("SB_TRUSTED_PROXIES", "1");
    expect(clientIp(forwarded)).toBe("10.0.0.2");
    vi.stubEnv("SB_TRUSTED_PROXIES", "2");
    expect(clientIp(forwarded)).toBe("203.0.113.9");
  });

  it("takes the first address when fewer proxies were passed than trusted", () => {
    vi.stubEnv("SB_TRUSTED_PROXIES", "5");
    expect(clientIp(forwarded)).toBe("6.6.6.6");
  });

  it("falls back to a fixed key without the header", () => {
    vi.stubEnv("SB_TRUSTED_PROXIES", "1");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
