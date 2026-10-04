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
import { POST, PUT } from "@/app/api/v1/[[...route]]/route";
import { createAdminAuthCookie } from "@/utils/auth";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createSession } from "../helpers/factories";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";
const HANDLERS = { POST, PUT } as const;

let admin = "";

function call(
  method: keyof typeof HANDLERS,
  path: string,
  { body, cookie = admin }: { body?: unknown; cookie?: string } = {}
) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  return HANDLERS[method](
    new NextRequest(`http://test/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );
}

beforeAll(() => setupTestDb());
beforeEach(async () => {
  resetTestDb();
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
  vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
  const c = await createAdminAuthCookie();
  admin = `${c.name}=${c.value}`;
});
afterEach(() => vi.unstubAllEnvs());

describe("/api/v1/admin seeding", () => {
  it(
    "creates a proposal for an event and refuses one with an unknown host",
    { tags: ["018-US1", "019-US5"] },
    async () => {
      const event = await createEvent({ phase: "scheduling" });
      const host = await createGuest();
      const body = { eventId: event.id, title: "Seeded", hostIds: [host.id] };

      const refused = await call("POST", "/admin/proposals", {
        body,
        cookie: "",
      });
      expect(refused.status).toBe(403);
      expect(await refused.json()).toMatchObject({ code: "admin.required" });

      const res = await call("POST", "/admin/proposals", { body });
      expect(res.status).toBe(201);
      expect(await res.json()).toMatchObject({
        eventId: event.id,
        title: "Seeded",
        durationMinutes: null,
        hosts: [{ id: host.id }],
      });

      const unknown = await call("POST", "/admin/proposals", {
        body: { ...body, hostIds: ["nobody"] },
      });
      expect(unknown.status).toBe(400);
      expect(await unknown.json()).toMatchObject({
        code: "proposal.hostUnknown",
      });
    }
  );

  it(
    "adds an RSVP once, answering 201 and then 200",
    { tags: ["018-US3", "019-US5"] },
    async () => {
      const event = await createEvent({ phase: "proposal" });
      const session = await createSession(event.id);
      const guest = await createGuest();
      const path = `/admin/sessions/${session.id}/rsvps/${guest.id}`;

      const refused = await call("PUT", path, { cookie: "" });
      expect(refused.status).toBe(403);

      const first = await call("PUT", path);
      expect(first.status).toBe(201);
      const rsvp = (await first.json()) as unknown;
      expect(rsvp).toMatchObject({ sessionId: session.id, guestId: guest.id });

      const again = await call("PUT", path);
      expect(again.status).toBe(200);
      expect(await again.json()).toEqual(rsvp);

      const missing = await call(
        "PUT",
        `/admin/sessions/${session.id}/rsvps/nobody`
      );
      expect(missing.status).toBe(404);
      expect(await missing.json()).toMatchObject({ code: "guest.notFound" });
    }
  );
});
