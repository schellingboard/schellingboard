import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
}));

import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createDay,
  createEvent,
  createGuest,
  createLocation,
  createSession,
  slotStart,
} from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { sessionUseCases } from "@/server/composition";
import type { Actor } from "@/server/kernel/actor";
import type { Day } from "@schellingboard/domain/event";

const NOBODY: Actor = { admin: false, guest: null };
const ADMIN: Actor = { admin: true, guest: null };
const open = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "open" },
});
const verified = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "verified" },
});

async function protect(guestId: string) {
  await getRepositories().guests.setAuthProtection(guestId, {
    authProtected: true,
    passwordHash: null,
  });
}

function booking(
  day: Day,
  hostIds: string[],
  locationId: string,
  minutesIn = 60
) {
  return {
    dayId: day.id,
    title: "Talk",
    description: "",
    closed: false,
    hostIds,
    locationId,
    startTime: new Date(slotStart(day, minutesIn)),
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

const now = () => new Date();

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

describe("session queries", () => {
  it("gets a session by id", { tags: ["007-US5"] }, async () => {
    const { event, host, location } = await scheduledWorld();
    const session = await createSession(event.id, {
      title: "Keynote",
      hostIds: [host.id],
      locationIds: [location.id],
    });

    const result = await sessionUseCases().getSession(NOBODY, {
      sessionId: session.id,
    });

    expect(result).toMatchObject({ ok: true, value: { title: "Keynote" } });
  });

  it("answers an unknown session with session.notFound", async () => {
    const result = await sessionUseCases().getSession(NOBODY, {
      sessionId: "nope",
    });
    expect(result).toMatchObject({
      ok: false,
      error: { kind: "notFound", code: "session.notFound" },
    });
  });

  it("lists an event's sessions", { tags: ["007-US5"] }, async () => {
    const { event } = await scheduledWorld();
    await createSession(event.id, { title: "A" });
    await createSession(event.id, { title: "B" });
    const other = await createEvent();
    await createSession(other.id, { title: "Elsewhere" });

    const result = await sessionUseCases().listSessions(NOBODY, {
      eventId: event.id,
    });

    if (!result.ok) throw new Error(result.error.code);
    expect(result.value.map((s) => s.title).sort()).toEqual(["A", "B"]);
  });

  it("answers an unknown event with event.notFound", async () => {
    const result = await sessionUseCases().listSessions(NOBODY, {
      eventId: "nope",
    });
    expect(result).toMatchObject({
      ok: false,
      error: { code: "event.notFound" },
    });
  });
});

describe("createSession", () => {
  it(
    "books a session for the acting guest",
    { tags: ["008-US1"] },
    async () => {
      const { event, host, location, day } = await scheduledWorld();

      const result = await sessionUseCases().createSession(
        open(host.id),
        booking(day, [host.id], location.id),
        now()
      );

      expect(result).toMatchObject({ ok: true, value: { title: "Talk" } });
      expect(
        await getRepositories().sessions.listByEvent(event.id)
      ).toHaveLength(1);
    }
  );

  it("refuses an actor without a guest", async () => {
    const { host, location, day } = await scheduledWorld();
    const result = await sessionUseCases().createSession(
      NOBODY,
      booking(day, [host.id], location.id),
      now()
    );
    expect(result).toMatchObject({
      ok: false,
      error: { kind: "forbidden", code: "guest.unselected" },
    });
  });

  it("refuses a protected guest named by an open cookie", async () => {
    const { host, location, day } = await scheduledWorld();
    await protect(host.id);
    const sessions = sessionUseCases();

    const refused = await sessions.createSession(
      open(host.id),
      booking(day, [host.id], location.id),
      now()
    );
    const accepted = await sessions.createSession(
      verified(host.id),
      booking(day, [host.id], location.id),
      now()
    );

    expect(refused).toMatchObject({
      ok: false,
      error: { kind: "forbidden", code: "guest.protected" },
    });
    expect(accepted.ok).toBe(true);
  });

  it("refuses outside the scheduling phase", async () => {
    const event = await createEvent({ phase: "voting" });
    const host = await createGuest({ eventId: event.id });
    const location = await createLocation({ eventId: event.id });
    const day = await createDay(event.id);
    const result = await sessionUseCases().createSession(
      open(host.id),
      booking(day, [host.id], location.id),
      now()
    );
    expect(result).toMatchObject({
      ok: false,
      error: { kind: "forbidden", code: "event.notSchedulingPhase" },
    });
  });

  it("answers a clash in the same room with session.clash", async () => {
    const { host, location, day } = await scheduledWorld();
    const sessions = sessionUseCases();
    await sessions.createSession(
      open(host.id),
      booking(day, [host.id], location.id),
      now()
    );

    const result = await sessions.createSession(
      open(host.id),
      booking(day, [host.id], location.id),
      now()
    );

    expect(result).toMatchObject({
      ok: false,
      error: { kind: "conflict", code: "session.clash" },
    });
  });
});

describe("updateSession and deleteSession", () => {
  async function hostedSession() {
    const world = await scheduledWorld();
    const created = await sessionUseCases().createSession(
      open(world.host.id),
      booking(world.day, [world.host.id], world.location.id),
      now()
    );
    if (!created.ok) throw new Error(created.error.code);
    return { ...world, session: created.value };
  }

  it("lets a host rename their session", { tags: ["008-US2"] }, async () => {
    const { host, location, day, session } = await hostedSession();

    const result = await sessionUseCases().updateSession(
      open(host.id),
      {
        ...booking(day, [host.id], location.id),
        sessionId: session.id,
        title: "Renamed",
        locationIds: [location.id],
      },
      now()
    );

    expect(result).toMatchObject({ ok: true, value: { title: "Renamed" } });
  });

  it(
    "lets a host place their session that has no time yet",
    { tags: ["008-US2"] },
    async () => {
      const { event, host, location, day } = await scheduledWorld();
      const unplaced = await createSession(event.id, {
        hostIds: [host.id],
        locationIds: [location.id],
      });

      const result = await sessionUseCases().updateSession(
        open(host.id),
        {
          ...booking(day, [host.id], location.id),
          sessionId: unplaced.id,
          locationIds: [location.id],
        },
        now()
      );

      expect(result.ok).toBe(true);
      expect(
        (await getRepositories().sessions.findById(unplaced.id))?.startTime
      ).toBeInstanceOf(Date);
    }
  );

  it("answers a day of another event with session.dayUnknown", async () => {
    const { host, location, session } = await hostedSession();
    const otherDay = await createDay(
      (await createEvent({ phase: "scheduling" })).id
    );

    const result = await sessionUseCases().updateSession(
      open(host.id),
      {
        ...booking(otherDay, [host.id], location.id),
        sessionId: session.id,
        locationIds: [location.id],
      },
      now()
    );

    expect(result).toMatchObject({
      ok: false,
      error: { kind: "invalid", code: "session.dayUnknown" },
    });
  });

  it("refuses a guest who does not host the session", async () => {
    const { event, location, day, host, session } = await hostedSession();
    const stranger = await createGuest({ eventId: event.id });
    const sessions = sessionUseCases();

    const edit = await sessions.updateSession(
      open(stranger.id),
      {
        ...booking(day, [host.id], location.id),
        sessionId: session.id,
        locationIds: [location.id],
      },
      now()
    );
    const removal = await sessions.deleteSession(
      open(stranger.id),
      { sessionId: session.id },
      now()
    );

    for (const result of [edit, removal]) {
      expect(result).toMatchObject({
        ok: false,
        error: { kind: "forbidden", code: "session.notHost" },
      });
    }
  });

  it("lets a host delete their session", { tags: ["008-US3"] }, async () => {
    const { host, session } = await hostedSession();

    const result = await sessionUseCases().deleteSession(
      open(host.id),
      { sessionId: session.id },
      now()
    );

    expect(result.ok).toBe(true);
    expect(await getRepositories().sessions.findById(session.id)).toBe(
      undefined
    );
  });

  it("refuses to delete a session an organizer manages", async () => {
    const { event, host, location } = await scheduledWorld();
    const session = await createSession(event.id, {
      hostIds: [host.id],
      locationIds: [location.id],
      adminManaged: true,
    });
    const result = await sessionUseCases().deleteSession(
      open(host.id),
      { sessionId: session.id },
      now()
    );
    expect(result).toMatchObject({
      ok: false,
      error: { kind: "forbidden", code: "session.managedByOrganizer" },
    });
  });
});

describe("organizer session use cases", () => {
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
  };

  it("requires the admin actor", async () => {
    const event = await createEvent();
    const host = await createGuest();
    const result = await sessionUseCases().adminCreateSession(
      verified(host.id),
      { ...fields, eventId: event.id, locationIds: [] },
      now()
    );
    expect(result).toMatchObject({
      ok: false,
      error: { kind: "forbidden", code: "admin.required" },
    });
  });

  it(
    "creates, updates and deletes a session",
    { tags: ["018-US2"] },
    async () => {
      const event = await createEvent();
      const location = await createLocation();
      const sessions = sessionUseCases();

      const created = await sessions.adminCreateSession(
        ADMIN,
        { ...fields, eventId: event.id, locationIds: [location.id] },
        now()
      );
      if (!created.ok) throw new Error(created.error.code);
      const updated = await sessions.adminUpdateSession(
        ADMIN,
        {
          ...fields,
          id: created.value.id,
          title: "Dinner",
          locationIds: [location.id],
        },
        now()
      );
      const deleted = await sessions.adminDeleteSession(
        ADMIN,
        { id: created.value.id },
        now()
      );

      expect(updated).toMatchObject({ ok: true, value: { title: "Dinner" } });
      expect(deleted.ok).toBe(true);
      expect(await getRepositories().sessions.listByEvent(event.id)).toEqual(
        []
      );
    }
  );

  it("answers an unknown host or room instead of failing to save", async () => {
    const event = await createEvent();
    const sessions = sessionUseCases();
    const created = await sessions.adminCreateSession(
      ADMIN,
      { ...fields, eventId: event.id, locationIds: [] },
      now()
    );
    if (!created.ok) throw new Error(created.error.code);

    const unknownHost = await sessions.adminCreateSession(
      ADMIN,
      { ...fields, eventId: event.id, hostIds: ["nope"], locationIds: [] },
      now()
    );
    const unknownRoom = await sessions.adminUpdateSession(
      ADMIN,
      { ...fields, id: created.value.id, locationIds: ["nope"] },
      now()
    );

    expect(unknownHost).toMatchObject({
      ok: false,
      error: { kind: "invalid", code: "session.hostUnknown" },
    });
    expect(unknownRoom).toMatchObject({
      ok: false,
      error: { kind: "invalid", code: "session.locationUnknown" },
    });
  });

  it("answers an overlap in the same room with session.clash", async () => {
    const event = await createEvent();
    const location = await createLocation();
    const sessions = sessionUseCases();
    const input = { ...fields, eventId: event.id, locationIds: [location.id] };
    await sessions.adminCreateSession(ADMIN, input, now());

    const result = await sessions.adminCreateSession(ADMIN, input, now());

    expect(result).toMatchObject({
      ok: false,
      error: { kind: "conflict", code: "session.clash" },
    });
  });
});
