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

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
}));

import { GET, POST, PUT, DELETE } from "@/app/api/v1/[[...route]]/route";
import { openApiDocument } from "@/server/http/openapi";
import { createAdminAuthCookie } from "@/utils/auth";
import { getRepositories } from "@/db/container";
import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createDay,
  createEvent,
  createGuest,
  createLocation,
  createSession,
  slotStart,
} from "../helpers/factories";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";
import type { Day } from "@schellingboard/domain/event";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

function request(
  method: string,
  path: string,
  { body, cookie, key }: { body?: unknown; cookie?: string; key?: string } = {}
) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  if (key) headers["idempotency-key"] = key;
  return new NextRequest(`http://test/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const asGuest = (id: string) => `${GUEST_COOKIE_NAME}=${openGuestValue(id)}`;

async function asAdmin() {
  const admin = await createAdminAuthCookie();
  return `${admin.name}=${admin.value}`;
}

function booking(day: Day, hostId: string, locationId: string) {
  return {
    dayId: day.id,
    title: "Talk",
    description: "",
    closed: false,
    hostIds: [hostId],
    locationId,
    startTime: slotStart(day, 60),
    durationMinutes: 60,
  };
}

async function scheduledWorld() {
  const event = await createEvent({ phase: "scheduling" });
  const host = await createGuest({ eventId: event.id });
  const location = await createLocation({ eventId: event.id });
  const day = await createDay(event.id);
  return { event, host, location, day };
}

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
});
afterEach(() => vi.unstubAllEnvs());

describe("GET /api/v1/sessions", () => {
  it(
    "reads one session and an event's sessions",
    { tags: ["007-US5"] },
    async () => {
      const { event, host, location, day } = await scheduledWorld();
      const session = await createSession(event.id, {
        title: "Keynote",
        hostIds: [host.id],
        locationIds: [location.id],
        startTime: new Date(slotStart(day, 0)),
        endTime: new Date(slotStart(day, 60)),
      });

      const one = await GET(request("GET", `/sessions/${session.id}`));
      const list = await GET(request("GET", `/sessions?eventId=${event.id}`));

      expect(one.status).toBe(200);
      expect(await one.json()).toMatchObject({
        id: session.id,
        title: "Keynote",
        eventId: event.id,
        hosts: [{ id: host.id, name: host.name }],
        locations: [{ id: location.id }],
        startTime: session.startTime!.toISOString(),
      });
      expect(list.status).toBe(200);
      expect(await list.json()).toMatchObject({
        sessions: [{ id: session.id }],
      });
    }
  );

  it("answers an unknown session with a problem-details 404", async () => {
    const res = await GET(request("GET", "/sessions/nope"));
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toBe("application/problem+json");
    expect(await res.json()).toMatchObject({ code: "session.notFound" });
  });
});

describe("guest session mutations", () => {
  it(
    "creates a session as the acting guest",
    { tags: ["008-US1"] },
    async () => {
      const { event, host, location, day } = await scheduledWorld();

      const res = await POST(
        request("POST", "/sessions", {
          body: booking(day, host.id, location.id),
          cookie: asGuest(host.id),
        })
      );

      expect(res.status).toBe(201);
      const body = (await res.json()) as { id: string; title: string };
      expect(body.title).toBe("Talk");
      expect(
        (await getRepositories().sessions.listByEvent(event.id)).map(
          (s) => s.id
        )
      ).toEqual([body.id]);
    }
  );

  it("refuses a request without a guest with guest.unselected", async () => {
    const { host, location, day } = await scheduledWorld();
    const res = await POST(
      request("POST", "/sessions", { body: booking(day, host.id, location.id) })
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "guest.unselected" });
  });

  it(
    "updates and deletes a session its host booked",
    { tags: ["008-US2", "008-US3"] },
    async () => {
      const { host, location, day } = await scheduledWorld();
      const created = await POST(
        request("POST", "/sessions", {
          body: booking(day, host.id, location.id),
          cookie: asGuest(host.id),
        })
      );
      const { id } = (await created.json()) as { id: string };
      const { locationId, ...fields } = booking(day, host.id, location.id);

      const updated = await PUT(
        request("PUT", `/sessions/${id}`, {
          body: { ...fields, title: "Renamed", locationIds: [locationId] },
          cookie: asGuest(host.id),
        })
      );
      const deleted = await DELETE(
        request("DELETE", `/sessions/${id}`, { cookie: asGuest(host.id) })
      );

      expect(updated.status).toBe(200);
      expect(await updated.json()).toMatchObject({ title: "Renamed" });
      expect(deleted.status).toBe(204);
      expect(await getRepositories().sessions.findById(id)).toBe(undefined);
    }
  );

  it("refuses an edit by a guest who does not host the session", async () => {
    const { event, host, location } = await scheduledWorld();
    const stranger = await createGuest({ eventId: event.id });
    const session = await createSession(event.id, {
      hostIds: [host.id],
      locationIds: [location.id],
    });
    const res = await DELETE(
      request("DELETE", `/sessions/${session.id}`, {
        cookie: asGuest(stranger.id),
      })
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "session.notHost" });
  });
});

describe("Idempotency-Key on the mounted API", () => {
  it(
    "answers a retried create with the first response and books once",
    { tags: ["019-US2"] },
    async () => {
      const { event, host, location, day } = await scheduledWorld();
      const send = () =>
        POST(
          request("POST", "/sessions", {
            body: booking(day, host.id, location.id),
            cookie: asGuest(host.id),
            key: "retry-1",
          })
        );

      const first = await send();
      const retry = await send();

      expect(retry.status).toBe(first.status);
      expect(await retry.json()).toEqual(await first.json());
      expect(
        await getRepositories().sessions.listByEvent(event.id)
      ).toHaveLength(1);
    }
  );

  it("is declared on every mutating route in the OpenAPI document", () => {
    const paths = openApiDocument().paths ?? {};
    const mutations = Object.entries(paths).flatMap(([path, item]) =>
      (["post", "put", "patch", "delete"] as const).flatMap((method) =>
        item?.[method] ? [{ path, method, op: item[method] }] : []
      )
    );
    expect(mutations.length).toBeGreaterThan(0);
    for (const { path, method, op } of mutations) {
      const names = (op.parameters ?? []).map((p) =>
        "name" in p ? p.name : undefined
      );
      expect(names, `${method} ${path}`).toContain("idempotency-key");
    }
  });
});

describe("/api/v1/admin/sessions", () => {
  const fields = {
    title: "Lunch",
    description: "",
    startTime: "2030-01-01T12:00:00.000Z",
    endTime: "2030-01-01T13:00:00.000Z",
    capacity: 0,
    adminManaged: true,
    blocker: false,
    closed: false,
    hostIds: [],
    locationIds: [],
  };

  it(
    "lets the organizer create, update and delete a session",
    { tags: ["018-US2"] },
    async () => {
      const event = await createEvent();
      const cookie = await asAdmin();

      const created = await POST(
        request("POST", "/admin/sessions", {
          body: { ...fields, eventId: event.id },
          cookie,
        })
      );
      const { id } = (await created.json()) as { id: string };
      const updated = await PUT(
        request("PUT", `/admin/sessions/${id}`, {
          body: { ...fields, title: "Dinner" },
          cookie,
        })
      );
      const deleted = await DELETE(
        request("DELETE", `/admin/sessions/${id}`, { cookie })
      );

      expect(created.status).toBe(201);
      expect(await updated.json()).toMatchObject({ title: "Dinner" });
      expect(deleted.status).toBe(204);
    }
  );

  it("refuses an update that leaves out a field rather than clearing it", async () => {
    const event = await createEvent();
    const cookie = await asAdmin();
    const created = await POST(
      request("POST", "/admin/sessions", {
        body: { ...fields, capacity: 12, eventId: event.id },
        cookie,
      })
    );
    const { id } = (await created.json()) as { id: string };
    const withoutCapacity: Partial<typeof fields> = { ...fields };
    delete withoutCapacity.capacity;

    const res = await PUT(
      request("PUT", `/admin/sessions/${id}`, {
        body: withoutCapacity,
        cookie,
      })
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      code: "request.invalid",
      errors: [expect.objectContaining({ path: "capacity" })],
    });
    expect(await getRepositories().sessions.findById(id)).toMatchObject({
      capacity: 12,
    });
  });

  it("refuses a guest with admin.required", async () => {
    const event = await createEvent();
    const guest = await createGuest();
    const res = await POST(
      request("POST", "/admin/sessions", {
        body: { ...fields, eventId: event.id },
        cookie: asGuest(guest.id),
      })
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "admin.required" });
  });
});
