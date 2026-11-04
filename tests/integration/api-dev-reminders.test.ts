// @module-tag 001-US2b
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { api } from "@/server/http/app";
import { openApiDocumentOf } from "@/server/http/docs";
import { createAuthCookie } from "@/utils/auth";
import { throughWeb } from "@/tests/helpers/through-web";
import { setupTestDb, resetTestDb } from "../helpers/db";

const dispatch = async () =>
  throughWeb("/api/dev/reminders", { method: "POST" }, [
    await createAuthCookie(),
  ]);

describe("POST /api/dev/reminders", () => {
  beforeAll(setupTestDb);
  beforeEach(() => {
    resetTestDb();
    vi.stubEnv("SITE_PASSWORD", "site-pw");
    vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("runs one reminder tick when the dev tools are on", async () => {
    vi.stubEnv("SB_ENABLE_DEV_TOOLS", "1");
    const res = await dispatch();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ sent: 0 });
  });

  it("is not there when the dev tools are off", async () => {
    vi.stubEnv("SB_ENABLE_DEV_TOOLS", "");
    const res = await dispatch();
    expect(res.status).toBe(404);
  });

  it("needs the site password when one is set", async () => {
    vi.stubEnv("SB_ENABLE_DEV_TOOLS", "1");
    const res = await throughWeb("/api/dev/reminders", { method: "POST" });
    expect(res.status).toBe(401);
    expect(((await res.json()) as { code: string }).code).toBe(
      "site.unauthenticated"
    );
  });

  it("refuses a cross-site request", async () => {
    vi.stubEnv("SB_ENABLE_DEV_TOOLS", "1");
    const res = await throughWeb(
      "/api/dev/reminders",
      { method: "POST", headers: { origin: "http://evil.example" } },
      [await createAuthCookie()]
    );
    expect(res.status).toBe(403);
    expect(((await res.json()) as { code: string }).code).toBe(
      "request.crossSite"
    );
  });

  it("is not part of the published API", () => {
    expect(Object.keys(openApiDocumentOf(api).paths ?? {})).not.toContain(
      "/api/v1/dev/reminders"
    );
  });
});
