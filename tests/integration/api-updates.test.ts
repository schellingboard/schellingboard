// @module-tag 014-US6
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
import { GET } from "@/tests/helpers/v1-route";
import { createAdminAuthCookie } from "../helpers/admin-cookie";
import { setupTestDb, resetTestDb } from "../helpers/db";

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("SB_UPDATE_CHECK", "");
  vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
  vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "v4.0.0");
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(
        Response.json({
          tag_name: "v4.1.0",
          published_at: "2026-10-12T08:00:00Z",
        })
      )
    )
  );
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /api/v1/updates", () => {
  it(
    "tells the admin which release is out and that theirs is behind",
    { tags: ["014-US6"] },
    async () => {
      const admin = await createAdminAuthCookie();
      const ask = () =>
        GET(
          new NextRequest("http://test/api/v1/updates", {
            headers: { cookie: `${admin.name}=${admin.value}` },
          })
        );
      await ask();
      await new Promise((resolve) => setTimeout(resolve, 0));
      const res = await ask();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        current: { version: "v4.0.0", date: "2026-10-04" },
        latest: { version: "v4.1.0", date: "2026-10-12" },
        updateAvailable: true,
      });
    }
  );

  it(
    "tells anyone else nothing, and never asks GitHub for them",
    { tags: ["014-US6"] },
    async () => {
      const res = await GET(new NextRequest("http://test/api/v1/updates"));

      expect(res.status).toBe(200);
      expect(await res.json()).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    }
  );
});
