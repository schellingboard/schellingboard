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
import { createDay, createEvent, createLocation } from "../helpers/factories";

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
        version: 1,
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
        days: [{ id: dayId, eventId: event.id, ...dayBody, version: 1 }],
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
        body: { ...dayBody, end: at("19:00"), expectedVersion: 1 },
      });
      expect(await moved.json()).toMatchObject({
        end: at("19:00"),
        version: 2,
      });
      expect((await call("DELETE", `/admin/days/${dayId}`)).status).toBe(204);
    }
  );

  it(
    "updates settings and phases, then deletes the event",
    { tags: ["015-US2", "015-US3"] },
    async () => {
      const event = await createEvent();
      const updated = await call("PUT", `/admin/events/${event.id}`, {
        body: {
          ...settings,
          icon: "StarIcon",
          timezone: "Europe/Berlin",
          expectedVersion: 1,
        },
      });
      expect(updated.status).toBe(200);
      expect(await updated.json()).toMatchObject({
        name: "Unconference",
        icon: "StarIcon",
        timezone: "Europe/Berlin",
        version: 2,
      });

      const phases = {
        proposalPhaseStart: at("08:00"),
        proposalPhaseEnd: null,
        votingPhaseStart: at("07:00"),
        votingPhaseEnd: null,
        schedulingPhaseStart: null,
        schedulingPhaseEnd: null,
        expectedVersion: 2,
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
        version: 3,
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

  it(
    "refuses an event edit made from an outdated copy, answering with the event as it is",
    { tags: ["015-US2", "015-US3", "012-US1", "019-US3"] },
    async () => {
      const event = await createEvent();
      const rename = (name: string) =>
        call("PUT", `/admin/events/${event.id}`, {
          body: { ...settings, name, expectedVersion: 1 },
        });
      expect(await (await rename("First")).json()).toMatchObject({
        version: 2,
      });

      const stale = await rename("Second");
      const stalePhases = await call(
        "PUT",
        `/admin/events/${event.id}/phases`,
        {
          body: {
            proposalPhaseStart: at("08:00"),
            proposalPhaseEnd: null,
            votingPhaseStart: null,
            votingPhaseEnd: null,
            schedulingPhaseStart: null,
            schedulingPhaseEnd: null,
            expectedVersion: 1,
          },
        }
      );

      const staleMeetings = await call(
        "PUT",
        `/admin/events/${event.id}/meetings`,
        {
          body: {
            meetingsEnabled: true,
            maxOpenMeetingRequests: 3,
            expectedVersion: 1,
          },
        }
      );

      for (const res of [stale, stalePhases, staleMeetings]) {
        expect(res.status).toBe(409);
        expect(await res.json()).toMatchObject({
          code: "event.versionConflict",
          current: { id: event.id, name: "First", version: 2 },
        });
      }
      expect(await getRepositories().events.findById(event.id)).toMatchObject({
        name: "First",
        proposalPhaseStart: event.proposalPhaseStart,
        meetingsEnabled: false,
        version: 2,
      });
    }
  );

  it(
    "keeps one of two concurrent day edits made from the same version",
    { tags: ["015-US4", "019-US3", "019-US7"] },
    async () => {
      const event = await createEvent();
      const created = await call("POST", `/admin/events/${event.id}/days`, {
        body: dayBody,
      });
      const { id, version } = (await created.json()) as {
        id: string;
        version: number;
      };
      const move = (end: string) =>
        call("PUT", `/admin/days/${id}`, {
          body: { ...dayBody, end: at(end), expectedVersion: version },
        });

      const results = await Promise.all([move("18:30"), move("19:00")]);

      expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
      const kept = (await getRepositories().days.findById(id))!;
      expect(kept.version).toBe(version + 1);
      const conflict = results.find((r) => r.status === 409)!;
      expect(await conflict.json()).toMatchObject({
        code: "day.versionConflict",
        current: { id, end: kept.end.toISOString(), version: version + 1 },
      });
    }
  );

  it("refuses event, phase, 1-on-1 and day edits without expectedVersion", async () => {
    const event = await createEvent();
    const day = await createDay(event.id);
    for (const [path, body] of [
      [`/admin/events/${event.id}`, settings],
      [
        `/admin/events/${event.id}/phases`,
        {
          proposalPhaseStart: null,
          proposalPhaseEnd: null,
          votingPhaseStart: null,
          votingPhaseEnd: null,
          schedulingPhaseStart: null,
          schedulingPhaseEnd: null,
        },
      ],
      [`/admin/events/${event.id}/meetings`, { meetingsEnabled: false }],
      [`/admin/days/${day.id}`, dayBody],
    ] as const) {
      const res = await call("PUT", path, { body });
      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({
        code: "request.invalid",
        errors: [expect.objectContaining({ path: "expectedVersion" })],
      });
    }
  });
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
        version: 1,
      });

      const assigned = await call(
        "POST",
        `/admin/events/${event.id}/locations/assign`,
        { body: { locationIds: [store.id] } }
      );
      expect(assigned.status).toBe(204);
      const listed = await call("GET", `/admin/locations?eventId=${event.id}`);
      expect(await listed.json()).toEqual({
        locations: [{ ...store, eventIds: [event.id], version: 2 }],
      });

      const unknown = await call(
        "POST",
        `/admin/events/${event.id}/locations/assign`,
        { body: { locationIds: ["nope"] } }
      );
      expect(unknown.status).toBe(404);
      expect(await unknown.json()).toMatchObject({ code: "location.notFound" });

      const renamed = await call("PUT", `/admin/locations/${store.id}`, {
        body: {
          name: "Storage",
          capacity: 4,
          eventIds: [],
          expectedVersion: 2,
        },
      });
      expect(await renamed.json()).toMatchObject({
        name: "Storage",
        eventIds: [],
        version: 3,
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
      body: { direction: "up", expectedVersion: 1 },
    });
    expect(moved.status).toBe(200);
    const { locations } = (await moved.json()) as {
      locations: { id: string; version: number }[];
    };
    expect(locations).toMatchObject([
      { id: second.id, sortIndex: 0, version: 2 },
      { id: first.id, sortIndex: 1, version: 2 },
    ]);
    expect(await (await call("GET", "/admin/locations")).json()).toEqual({
      locations,
    });

    const unknown = await call("POST", "/admin/locations/no-such-id/move", {
      body: { direction: "up", expectedVersion: 1 },
    });
    expect(await unknown.json()).toMatchObject({
      status: 404,
      code: "location.notFound",
    });
  });

  it(
    "refuses a location edit or move made from an outdated copy, answering with the location as it is",
    { tags: ["017-US1", "019-US3"] },
    async () => {
      const event = await createEvent();
      const room = await createLocation({ name: "Hall", sortIndex: 1 });
      await createLocation({ name: "Lobby", sortIndex: 0 });
      const rename = (name: string) =>
        call("PUT", `/admin/locations/${room.id}`, {
          body: {
            name,
            capacity: 10,
            eventIds: [event.id],
            expectedVersion: 1,
          },
        });
      expect(await (await rename("Main hall")).json()).toMatchObject({
        version: 2,
      });

      const stale = await rename("Great hall");
      const staleMove = await call("POST", `/admin/locations/${room.id}/move`, {
        body: { direction: "up", expectedVersion: 1 },
      });

      for (const res of [stale, staleMove]) {
        expect(res.status).toBe(409);
        expect(await res.json()).toMatchObject({
          code: "location.versionConflict",
          current: {
            id: room.id,
            name: "Main hall",
            sortIndex: 1,
            eventIds: [event.id],
            version: 2,
          },
        });
      }
    }
  );

  it(
    "keeps one of two concurrent location edits made from the same version",
    { tags: ["017-US1", "019-US3", "019-US7"] },
    async () => {
      const room = await createLocation({ name: "Hall" });
      const rename = (name: string) =>
        call("PUT", `/admin/locations/${room.id}`, {
          body: { name, capacity: 10, expectedVersion: room.version },
        });

      const results = await Promise.all([rename("North"), rename("South")]);

      expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
      const kept = (await getRepositories().locations.findById(room.id))!;
      expect(kept.version).toBe(room.version + 1);
      const conflict = results.find((r) => r.status === 409)!;
      expect(await conflict.json()).toMatchObject({
        code: "location.versionConflict",
        current: { id: room.id, name: kept.name, version: kept.version },
      });
    }
  );

  it(
    "raises a location's version when it joins or leaves an event",
    { tags: ["017-US3", "019-US3"] },
    async () => {
      const event = await createEvent();
      const room = await createLocation();
      const version = async () =>
        (await getRepositories().locations.findById(room.id))?.version;
      const send = (action: "assign" | "remove") =>
        call("POST", `/admin/events/${event.id}/locations/${action}`, {
          body: { locationIds: [room.id] },
        });

      await send("assign");
      await send("assign");
      expect(await version()).toBe(2);
      await send("remove");
      await send("remove");
      expect(await version()).toBe(3);
    }
  );

  it(
    "answers a new location with the version an edit must send",
    { tags: ["017-US1", "019-US3"] },
    async () => {
      const event = await createEvent();
      const created = await call("POST", "/admin/locations", {
        body: { name: "Hall", capacity: 10, eventIds: [event.id] },
      });
      const { id, version } = (await created.json()) as {
        id: string;
        version: number;
      };

      const renamed = await call("PUT", `/admin/locations/${id}`, {
        body: {
          name: "Main hall",
          capacity: 10,
          eventIds: [event.id],
          expectedVersion: version,
        },
      });

      expect(renamed.status).toBe(200);
    }
  );

  it(
    "raises the version of an event's locations when the event is deleted",
    { tags: ["017-US3", "019-US3"] },
    async () => {
      const event = await createEvent();
      const room = await createLocation({ eventId: event.id });

      expect((await call("DELETE", `/admin/events/${event.id}`)).status).toBe(
        204
      );

      expect(await getRepositories().locations.findById(room.id)).toMatchObject(
        { version: room.version + 1 }
      );
    }
  );

  it("refuses location edits and moves without expectedVersion", async () => {
    const room = await createLocation();
    for (const [method, path, body] of [
      ["PUT", `/admin/locations/${room.id}`, { name: "Hall", capacity: 1 }],
      ["POST", `/admin/locations/${room.id}/move`, { direction: "up" }],
    ] as const) {
      const res = await call(method, path, { body });
      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({
        code: "request.invalid",
        errors: [expect.objectContaining({ path: "expectedVersion" })],
      });
    }
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
      expect(added.status).toBe(201);
      const { periods } = (await added.json()) as { periods: { id: string }[] };
      expect(await (await call("GET", path)).json()).toEqual({ periods });
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
