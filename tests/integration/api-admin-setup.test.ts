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
import { GET, POST, PUT, DELETE } from "@/app/api/v1/[[...route]]/route";
import { getRepositories } from "@/db/container";
import { createAdminAuthCookie } from "@/utils/auth";
import { isoDay } from "../helpers/dates";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createLocation } from "../helpers/factories";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";
const DAY = isoDay(30);
const at = (time: string) => `${DAY}T${time}:00.000Z`;

const HANDLERS = { GET, POST, PUT, DELETE } as const;

let admin = "";

function call(
  method: keyof typeof HANDLERS,
  path: string,
  {
    body,
    cookie = admin,
    key,
  }: { body?: unknown; cookie?: string; key?: string } = {}
) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  if (key) headers["idempotency-key"] = key;
  return HANDLERS[method](
    new NextRequest(`http://test/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );
}

const settings = {
  name: "Unconference",
  maxSessionDuration: 120,
  breakMinutes: 10,
  slotIncrementMinutes: 30,
};
const dayBody = {
  start: at("08:00"),
  end: at("18:00"),
  startBookings: at("09:00"),
  endBookings: at("17:00"),
};

beforeAll(() => setupTestDb());
beforeEach(async () => {
  resetTestDb();
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
  vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
  const c = await createAdminAuthCookie();
  admin = `${c.name}=${c.value}`;
});
afterEach(() => vi.unstubAllEnvs());

describe("/api/v1/admin events and days", () => {
  it(
    "refuses a caller without the admin cookie",
    { tags: ["015-US2", "019-US3"] },
    async () => {
      const event = await createEvent();
      for (const [method, path, body] of [
        ["GET", "/admin/events", undefined],
        ["GET", `/admin/events/${event.id}`, undefined],
        ["POST", "/admin/events", settings],
        ["DELETE", `/admin/events/${event.id}`, undefined],
        ["GET", "/admin/locations", undefined],
        ["GET", `/admin/events/${event.id}/location-unavailability`, undefined],
      ] as const) {
        const res = await call(method, path, { body, cookie: "" });
        expect(res.status).toBe(403);
        expect(await res.json()).toMatchObject({ code: "admin.required" });
      }
      expect(await getRepositories().events.findById(event.id)).toBeDefined();
    }
  );

  it(
    "creates an event once per key, adds a day and reads them back",
    { tags: ["015-US2", "015-US4", "019-US2", "019-US3"] },
    async () => {
      const create = () =>
        call("POST", "/admin/events", { body: settings, key: "event-1" });
      const first = await create();
      expect(first.status).toBe(201);
      const event = (await first.json()) as { id: string };
      expect(event).toMatchObject({
        slug: "Unconference",
        timezone: "UTC",
        icon: null,
        proposalPhaseStart: null,
      });
      const replay = await create();
      expect(replay.status).toBe(201);
      expect(await replay.json()).toEqual(event);
      expect(await getRepositories().events.list()).toHaveLength(1);

      const day = await call("POST", `/admin/events/${event.id}/days`, {
        body: dayBody,
      });
      expect(day.status).toBe(201);
      const { id: dayId } = (await day.json()) as { id: string };

      const detail = await call("GET", `/admin/events/${event.id}`);
      expect(await detail.json()).toEqual({
        event: {
          ...event,
          firstDayStart: at("08:00"),
          lastDayStart: at("08:00"),
        },
        days: [{ id: dayId, eventId: event.id, ...dayBody }],
      });
      const list = await call("GET", "/admin/events");
      expect(
        ((await list.json()) as { events: unknown[] }).events
      ).toHaveLength(1);

      const overlap = await call("POST", `/admin/events/${event.id}/days`, {
        body: dayBody,
      });
      expect(overlap.status).toBe(409);
      expect(await overlap.json()).toMatchObject({ code: "day.overlap" });

      const moved = await call("PUT", `/admin/days/${dayId}`, {
        body: { ...dayBody, end: at("19:00") },
      });
      expect(await moved.json()).toMatchObject({ end: at("19:00") });
      expect((await call("DELETE", `/admin/days/${dayId}`)).status).toBe(204);
    }
  );

  it(
    "updates settings and phases, then deletes the event",
    { tags: ["015-US2", "015-US3"] },
    async () => {
      const event = await createEvent();
      const updated = await call("PUT", `/admin/events/${event.id}`, {
        body: { ...settings, icon: "StarIcon", timezone: "Europe/Berlin" },
      });
      expect(updated.status).toBe(200);
      expect(await updated.json()).toMatchObject({
        name: "Unconference",
        icon: "StarIcon",
        timezone: "Europe/Berlin",
      });

      const phases = {
        proposalPhaseStart: at("08:00"),
        proposalPhaseEnd: null,
        votingPhaseStart: at("07:00"),
        votingPhaseEnd: null,
        schedulingPhaseStart: null,
        schedulingPhaseEnd: null,
      };
      const outOfOrder = await call("PUT", `/admin/events/${event.id}/phases`, {
        body: phases,
      });
      expect(outOfOrder.status).toBe(400);
      expect(await outOfOrder.json()).toMatchObject({
        code: "event.phasesOutOfOrder",
      });
      const set = await call("PUT", `/admin/events/${event.id}/phases`, {
        body: { ...phases, votingPhaseStart: at("12:00") },
      });
      expect(await set.json()).toMatchObject({
        proposalPhaseStart: at("08:00"),
        votingPhaseStart: at("12:00"),
        schedulingPhaseStart: null,
      });

      const notAnInstant = await call(
        "PUT",
        `/admin/events/${event.id}/phases`,
        {
          body: { ...phases, proposalPhaseStart: "2026-10-01T10:00" },
        }
      );
      expect(notAnInstant.status).toBe(400);
      expect(await notAnInstant.json()).toMatchObject({
        code: "request.invalid",
      });

      expect((await call("DELETE", `/admin/events/${event.id}`)).status).toBe(
        204
      );
      const gone = await call("GET", `/admin/events/${event.id}`);
      expect(gone.status).toBe(404);
      expect(await gone.json()).toMatchObject({ code: "event.notFound" });
    }
  );
});

describe("/api/v1/admin locations", () => {
  it(
    "creates, lists, assigns and deletes locations",
    { tags: ["017-US1", "017-US3", "019-US3"] },
    async () => {
      const event = await createEvent();
      const created = await call("POST", "/admin/locations", {
        body: { name: "Store", capacity: 0, bookable: false },
      });
      expect(created.status).toBe(201);
      const store = (await created.json()) as { id: string };
      expect(store).toMatchObject({
        name: "Store",
        bookable: false,
        color: "slate",
        areaDescription: null,
        eventIds: [],
      });

      const assigned = await call(
        "POST",
        `/admin/events/${event.id}/locations/assign`,
        { body: { locationIds: [store.id] } }
      );
      expect(assigned.status).toBe(204);
      const listed = await call("GET", `/admin/locations?eventId=${event.id}`);
      expect(await listed.json()).toEqual({
        locations: [{ ...store, eventIds: [event.id] }],
      });

      const unknown = await call(
        "POST",
        `/admin/events/${event.id}/locations/assign`,
        { body: { locationIds: ["nope"] } }
      );
      expect(unknown.status).toBe(404);
      expect(await unknown.json()).toMatchObject({ code: "location.notFound" });

      const renamed = await call("PUT", `/admin/locations/${store.id}`, {
        body: { name: "Storage", capacity: 4, eventIds: [] },
      });
      expect(await renamed.json()).toMatchObject({
        name: "Storage",
        eventIds: [],
      });
      expect(
        (await call("DELETE", `/admin/locations/${store.id}`)).status
      ).toBe(204);
    }
  );

  it(
    "names each invalid field of a location",
    { tags: ["017-US1"] },
    async () => {
      const res = await call("POST", "/admin/locations", {
        body: { name: "Hall", capacity: 10, eventIds: ["no-such-event"] },
      });
      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({
        code: "location.invalid",
        errors: [{ path: "eventIds", message: "Unknown event" }],
      });
    }
  );

  it("reorders locations", { tags: ["017-US1"] }, async () => {
    const first = await createLocation({ name: "A", sortIndex: 0 });
    const second = await createLocation({ name: "B", sortIndex: 1 });
    const moved = await call("POST", `/admin/locations/${second.id}/move`, {
      body: { direction: "up" },
    });
    expect(moved.status).toBe(204);
    const { locations } = (await (
      await call("GET", "/admin/locations")
    ).json()) as { locations: { id: string }[] };
    expect(locations.map((l) => l.id)).toEqual([second.id, first.id]);

    const unknown = await call("POST", "/admin/locations/no-such-id/move", {
      body: { direction: "up" },
    });
    expect(await unknown.json()).toMatchObject({
      status: 404,
      code: "location.notFound",
    });
  });

  it(
    "refuses an unknown event's locations and room unavailability",
    { tags: ["017-US4", "019-US3"] },
    async () => {
      const room = await createLocation();
      const path = "/admin/events/no-such-event/location-unavailability";
      const responses = [
        await call("GET", "/admin/locations?eventId=no-such-event"),
        await call("GET", path),
        await call("POST", path, {
          body: {
            locationIds: [room.id],
            start: at("10:00"),
            end: at("12:00"),
          },
        }),
      ];
      for (const res of responses) {
        expect(await res.json()).toMatchObject({
          status: 404,
          code: "event.notFound",
        });
      }
    }
  );

  it(
    "marks a room unavailable and lifts it",
    { tags: ["017-US4", "019-US3"] },
    async () => {
      const event = await createEvent();
      const room = await createLocation({ eventId: event.id });
      const path = `/admin/events/${event.id}/location-unavailability`;
      const added = await call("POST", path, {
        body: { locationIds: [room.id], start: at("10:00"), end: at("12:00") },
      });
      expect(added.status).toBe(204);
      const { periods } = (await (await call("GET", path)).json()) as {
        periods: { id: string }[];
      };
      expect(periods).toEqual([
        {
          id: expect.any(String) as string,
          eventId: event.id,
          locationId: room.id,
          start: at("10:00"),
          end: at("12:00"),
        },
      ]);

      const backwards = await call("POST", path, {
        body: { locationIds: [room.id], start: at("12:00"), end: at("10:00") },
      });
      expect(await backwards.json()).toMatchObject({
        status: 400,
        code: "unavailability.endBeforeStart",
      });
      const deleted = await call(
        "DELETE",
        `/admin/location-unavailability/${periods[0].id}`
      );
      expect(deleted.status).toBe(204);
      const again = await call(
        "DELETE",
        `/admin/location-unavailability/${periods[0].id}`
      );
      expect(await again.json()).toMatchObject({
        status: 404,
        code: "unavailability.notFound",
      });
    }
  );
});
