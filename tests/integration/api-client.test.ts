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
import { createApiClient } from "@schellingboard/api-client";
import { GET, POST, PUT, PATCH, DELETE } from "@/app/api/v1/[[...route]]/route";
import { createAdminAuthCookie } from "@/utils/auth";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent } from "../helpers/factories";
import { throughProxy } from "../helpers/through-proxy";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";
const handlers = { GET, POST, PUT, PATCH, DELETE };

function clientWithCookies(cookies: { name: string; value: string }[]) {
  return createApiClient({
    baseUrl: "http://test",
    fetch: async (request: Request) => {
      const url = new URL(request.url);
      const result = await throughProxy(
        url.pathname + url.search,
        {
          method: request.method,
          headers: request.headers,
          body: (await request.text()) || undefined,
        },
        cookies
      );
      if (!result.ok) return result.response;
      const handle = handlers[request.method as keyof typeof handlers];
      return handle(new NextRequest(result.request));
    },
  });
}

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("SITE_PASSWORD", "site-pw");
  vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
});
afterEach(() => vi.unstubAllEnvs());

describe("@schellingboard/api-client", () => {
  it(
    "reads the events as an admin, typed by the contract",
    { tags: ["019-US3"] },
    async () => {
      const event = await createEvent({ name: "Unconf" });
      const client = clientWithCookies([await createAdminAuthCookie()]);
      const { data, error } = await client.GET("/api/v1/admin/events");
      expect(error).toBeUndefined();
      expect(data?.events.map(({ id, name }) => ({ id, name }))).toEqual([
        { id: event.id, name: "Unconf" },
      ]);
    }
  );

  it(
    "returns a refusal as a problem with its code",
    { tags: ["019-US3"] },
    async () => {
      const client = clientWithCookies([]);
      const { data, error, response } = await client.GET(
        "/api/v1/admin/events"
      );
      expect(response.status).toBe(401);
      expect(data).toBeUndefined();
      expect(error).toMatchObject({ code: "admin.unauthenticated" });
    }
  );
});
