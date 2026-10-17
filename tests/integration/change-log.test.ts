import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { updateLoggedSession, deleteLoggedSession } from "../helpers/changes";
import {
  createDay,
  createEvent,
  createGuest,
  createLocation,
  createUnavailability,
  createSession,
} from "../helpers/factories";
import { getRepositories, withWriter } from "@/db/container";
import { createEventUseCases } from "@/server/modules/events/module";
import { createVenueUseCases } from "@/server/modules/venue/module";
import { createMeetingUseCases } from "@/server/modules/meetings/module";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import {
  addSession,
  recordRsvpAdded,
  removeRsvp,
} from "@/server/modules/sessions/module";
import type { ChangeContext } from "@schellingboard/domain/change";

const AT = new Date("2026-06-01T10:00:00.000Z");
const BY: ChangeContext = { actor: { type: "system" }, at: AT };

describe("change log", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  async function world() {
    const event = await createEvent();
    const host = await createGuest({ name: "Hana Host", eventId: event.id });
    const attendee = await createGuest({ name: "Ari Attendee" });
    const room = await createLocation({ name: "Room A", eventId: event.id });
    const session = await createSession(event.id, {
      title: "Old title",
      hostIds: [host.id],
      locationIds: [room.id],
      startTime: new Date("2026-06-02T09:00:00.000Z"),
      endTime: new Date("2026-06-02T10:00:00.000Z"),
    });
    const by: ChangeContext = { actor: { type: "guest", id: host.id }, at: AT };
    return { event, host, attendee, room, session, by };
  }

  it("records an update with the state before and after it", async () => {
    const { event, host, session, by } = await world();
    const { changes } = getRepositories();

    await updateLoggedSession(session.id, { title: "New title" }, by);

    const recorded = await changes.listAfter(0);
    expect(recorded).toHaveLength(1);
    expect(recorded[0]).toMatchObject({
      type: "session.changed",
      subjectId: session.id,
      eventId: event.id,
      actor: { type: "guest", id: host.id },
      occurredAt: AT,
      payload: {
        before: { title: "Old title" },
        after: { title: "New title" },
      },
    });
    const { after } = (
      recorded[0] as { payload: { after: { startTime: Date } } }
    ).payload;
    expect(after.startTime).toEqual(new Date("2026-06-02T09:00:00.000Z"));
  });

  it("records a deletion with the guests who had RSVPed", async () => {
    const { attendee, session, by } = await world();
    const { rsvps, changes } = getRepositories();
    await rsvps.create({ sessionId: session.id, guestId: attendee.id });

    await deleteLoggedSession(session.id, by);

    const deleted = (await changes.listAfter(0)).find(
      (c) => c.type === "session.deleted"
    );
    expect(deleted).toMatchObject({
      type: "session.deleted",
      subjectId: session.id,
      payload: {
        session: { id: session.id, title: "Old title" },
        rsvpGuestIds: [attendee.id],
      },
    });
  });

  it("records nothing when the change itself fails", async () => {
    const { session, by } = await world();
    const { changes } = getRepositories();

    await expect(
      updateLoggedSession(session.id, { locationIds: ["no-such-room"] }, by)
    ).rejects.toThrow();

    expect(await changes.listAfter(0)).toEqual([]);
  });

  it("resumes after a sequence number, in order", async () => {
    const { session, by } = await world();
    const { changes } = getRepositories();

    await updateLoggedSession(session.id, { title: "One" }, by);
    await updateLoggedSession(session.id, { title: "Two" }, by);

    const all = await changes.listAfter(0);
    expect(
      all.map((c) => c.type === "session.changed" && c.payload.after.title)
    ).toEqual(["One", "Two"]);
    const rest = await changes.listAfter(all[0].seq);
    expect(rest).toHaveLength(1);
    expect(rest[0]).toMatchObject({ payload: { after: { title: "Two" } } });
  });

  it("records who made the change", async () => {
    const { session } = await world();
    const { changes } = getRepositories();

    await updateLoggedSession(
      session.id,
      { title: "By an organizer" },
      { actor: { type: "admin" }, at: AT }
    );

    const [change] = await changes.listAfter(0);
    expect(change.actor).toEqual({ type: "admin" });
  });

  it("records nothing for a save that changes nothing, nor bumps the version", async () => {
    const { session, by } = await world();
    const { changes } = getRepositories();

    const saved = await updateLoggedSession(
      session.id,
      { title: "Old title" },
      by
    );

    expect(await changes.listAfter(0)).toEqual([]);
    expect(saved?.version).toBe(session.version);
  });

  it("logs the version a change brought the session to", async () => {
    const { session, by } = await world();
    const { changes } = getRepositories();

    await updateLoggedSession(session.id, { title: "One" }, by);

    const [change] = await changes.listAfter(0);
    expect(change).toMatchObject({
      payload: {
        before: { version: session.version },
        after: { version: session.version + 1 },
      },
    });
  });

  it(
    "addresses session changes to everyone who can open the event",
    { tags: ["007-US8"] },
    async () => {
      const { session, by } = await world();
      const { changes } = getRepositories();

      await updateLoggedSession(session.id, { title: "One" }, by);
      await deleteLoggedSession(session.id, by);

      const recorded = await changes.listAfter(0);
      expect(recorded.map((c) => c.audience)).toEqual([
        { kind: "event" },
        { kind: "event" },
      ]);
    }
  );

  it(
    "reads an entry written before audiences as addressed to no one",
    { tags: ["007-US8"] },
    async () => {
      const { session } = await world();
      await withWriter((writer) =>
        writer
          .prepare(
            `INSERT INTO changes (id, type, subject_type, subject_id, actor_type, occurred_at, payload)
           VALUES ('before-audiences', 'session.deleted', 'session', ?, 'system', ?, ?)`
          )
          .run(
            session.id,
            AT.toISOString(),
            JSON.stringify({ session, rsvpGuestIds: [] })
          )
      );

      const [old] = await getRepositories().changes.listAfter(0);
      expect(old).toMatchObject({ id: "before-audiences", audience: null });
    }
  );

  it("skips entries of a type this version does not know", async () => {
    const { session, by } = await world();
    const { changes } = getRepositories();
    await updateLoggedSession(session.id, { title: "One" }, by);
    const [first] = await changes.listAfter(0);
    await withWriter((writer) =>
      writer
        .prepare(
          `INSERT INTO changes (id, type, subject_type, subject_id, actor_type, occurred_at, payload)
           VALUES ('from-a-newer-version', 'session.renamed.v9', 'session', ?, 'system', ?, '{}')`
        )
        .run(session.id, AT.toISOString())
    );
    const repos = getRepositories();
    await updateLoggedSession(session.id, { title: "Two" }, by);

    const rest = await repos.changes.listAfter(first.seq);
    expect(rest).toHaveLength(1);
    expect(rest[0]).toMatchObject({ payload: { after: { title: "Two" } } });
  });

  it(
    "records an RSVP for its guest and the new count for the event",
    { tags: ["007-US8"] },
    async () => {
      const { event, attendee, session } = await world();
      const { changes } = getRepositories();

      await unitOfWork.run(async (tx) => {
        const rsvp = await tx.rsvps.create({
          sessionId: session.id,
          guestId: attendee.id,
        });
        await recordRsvpAdded(tx, rsvp, BY);
      });

      const recorded = await changes.listAfter(0);
      expect(recorded).toMatchObject([
        {
          type: "rsvp.added",
          eventId: event.id,
          audience: { kind: "guests", ids: [attendee.id] },
          payload: { rsvp: { sessionId: session.id, guestId: attendee.id } },
        },
        {
          type: "session.attendanceChanged",
          subjectId: session.id,
          audience: { kind: "event" },
          payload: { numRsvps: 1 },
        },
      ]);
    }
  );

  it("counts RSVPs added one after the other", async () => {
    const { host, attendee, session } = await world();
    for (const guest of [attendee, host]) {
      await unitOfWork.run(async (tx) => {
        const rsvp = await tx.rsvps.create({
          sessionId: session.id,
          guestId: guest.id,
        });
        await recordRsvpAdded(tx, rsvp, BY);
      });
    }

    const counts = (await getRepositories().changes.listAfter(0))
      .filter((c) => c.type === "session.attendanceChanged")
      .map((c) => c.payload.numRsvps);
    expect(counts).toEqual([1, 2]);
  });

  it(
    "records a withdrawn RSVP with the count left",
    { tags: ["007-US8"] },
    async () => {
      const { attendee, session } = await world();
      const { changes, rsvps } = getRepositories();
      await rsvps.create({ sessionId: session.id, guestId: attendee.id });

      await unitOfWork.run((tx) => removeRsvp(tx, session.id, attendee.id, BY));

      expect(await changes.listAfter(0)).toMatchObject([
        {
          type: "rsvp.removed",
          audience: { kind: "guests", ids: [attendee.id] },
          payload: { sessionId: session.id, guestId: attendee.id },
        },
        { type: "session.attendanceChanged", payload: { numRsvps: 0 } },
      ]);
    }
  );

  it("records nothing for an RSVP that was already gone", async () => {
    const { attendee, session } = await world();

    await unitOfWork.run((tx) => removeRsvp(tx, session.id, attendee.id, BY));

    expect(await getRepositories().changes.listAfter(0)).toEqual([]);
  });

  it(
    "tells each RSVPer their RSVP went with a deleted session",
    { tags: ["007-US8"] },
    async () => {
      const { attendee, session, by } = await world();
      const { changes, rsvps } = getRepositories();
      await rsvps.create({ sessionId: session.id, guestId: attendee.id });

      await deleteLoggedSession(session.id, by);

      expect(await changes.listAfter(0)).toMatchObject([
        {
          type: "rsvp.removed",
          audience: { kind: "guests", ids: [attendee.id] },
        },
        { type: "session.deleted" },
      ]);
    }
  );

  it("records a created session with its state", async () => {
    const { event, host } = await world();

    const created = await unitOfWork.run((tx) =>
      addSession(
        tx,
        {
          title: "New",
          description: "",
          capacity: 5,
          adminManaged: false,
          blocker: false,
          closed: false,
          eventId: event.id,
          hostIds: [host.id],
          locationIds: [],
        },
        BY
      )
    );

    expect(await getRepositories().changes.listAfter(0)).toMatchObject([
      {
        type: "session.created",
        subjectId: created.id,
        eventId: event.id,
        audience: { kind: "event" },
        payload: { session: { title: "New", hosts: [{ id: host.id }] } },
      },
    ]);
  });

  it(
    "marks the sessions a deleted day takes with it as cascades",
    { tags: ["007-US8"] },
    async () => {
      const { event, attendee, session } = await world();
      const day = await createDay(event.id, {
        start: new Date("2026-06-02T08:00:00.000Z"),
        end: new Date("2026-06-02T18:00:00.000Z"),
        startBookings: new Date("2026-06-02T09:00:00.000Z"),
        endBookings: new Date("2026-06-02T17:00:00.000Z"),
      });
      await getRepositories().rsvps.create({
        sessionId: session.id,
        guestId: attendee.id,
      });

      await createEventUseCases({
        repos: getRepositories(),
        uow: unitOfWork,
      }).deleteDay({ admin: true, guest: null }, { id: day.id }, AT);

      expect(await getRepositories().changes.listAfter(0)).toMatchObject([
        { type: "rsvp.removed", subjectType: "rsvp" },
        { type: "session.deleted", payload: { cascade: true } },
        { type: "day.deleted", subjectId: day.id, audience: { kind: "event" } },
        { type: "event.changed" },
      ]);
    }
  );

  it("records an event's deletion after its sessions'", async () => {
    const { event, session } = await world();

    await createEventUseCases({
      repos: getRepositories(),
      uow: unitOfWork,
    }).deleteEvent({ admin: true, guest: null }, { id: event.id }, AT);

    expect(await getRepositories().changes.listAfter(0)).toMatchObject([
      {
        type: "session.deleted",
        subjectId: session.id,
        payload: { cascade: true },
      },
      { type: "event.deleted", subjectId: event.id, eventId: event.id },
    ]);
  });

  it(
    "records what deleting a location takes with it, once for the event",
    { tags: ["007-US8"] },
    async () => {
      const { event, room, session } = await world();
      const period = await createUnavailability(
        event.id,
        room.id,
        AT,
        new Date(AT.getTime() + 3600_000)
      );

      await createVenueUseCases({
        repos: getRepositories(),
        images: {
          validate: (buffer) => Promise.resolve({ buffer, ext: "png" }),
          saveNew: (id) => Promise.resolve(`/media/${id}.png`),
          deleteByUrl: async () => {},
        },
        uow: unitOfWork,
      }).deleteLocation({ admin: true, guest: null }, { id: room.id }, AT);

      expect(await getRepositories().changes.listAfter(0)).toMatchObject([
        {
          type: "session.changed",
          subjectId: session.id,
          payload: { cascade: true, after: { locations: [] } },
        },
        { type: "unavailability.removed", subjectId: period.id },
        { type: "location.removed", subjectId: room.id, eventId: event.id },
      ]);
    }
  );

  it(
    "keeps a 1-on-1 between its two guests and a guest leaving visible to all",
    { tags: ["012-US3"] },
    async () => {
      const event = await createEvent({ phase: "scheduling" });
      const repos = getRepositories();
      await repos.events.update(event.id, {
        meetingsEnabled: true,
        maxOpenMeetingRequests: 5,
      });
      const day = new Date(Date.now() + 30 * 86_400_000);
      day.setUTCHours(9, 0, 0, 0);
      await createDay(event.id, {
        start: day,
        end: new Date(day.getTime() + 8 * 3600_000),
      });
      const ada = await createGuest({ name: "Ada", eventId: event.id });
      const grace = await createGuest({ name: "Grace", eventId: event.id });
      const slot = new Date(day.getTime() + 3600_000);
      await repos.meetingAvailability.replaceForGuest(grace.id, event.id, [
        slot,
      ]);
      const meetings = createMeetingUseCases({
        repos,
        notifyMeetingRequested: async () => {},
        notifyMeetingOutcome: async () => {},
        uow: unitOfWork,
      });

      const asked = await meetings.requestMeeting(
        { admin: false, guest: { id: ada.id, level: "open" } },
        {
          eventId: event.id,
          recipientId: grace.id,
          slotStart: slot.toISOString(),
          slotCount: 1,
          meetingPoint: "Lawn",
        },
        new Date()
      );
      expect(asked.ok).toBe(true);

      expect(await repos.changes.listAfter(0)).toMatchObject([
        {
          type: "meeting.changed",
          eventId: event.id,
          actor: { type: "guest", id: ada.id },
          audience: { kind: "guests", ids: [ada.id, grace.id] },
          payload: { meeting: { status: "pending", slotStart: slot } },
        },
      ]);
    }
  );
});
