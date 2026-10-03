import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createEvent,
  createGuest,
  createLocation,
  createSession,
} from "../helpers/factories";
import { getRepositories } from "@/db/container";
import Database from "better-sqlite3";
import { restoreDb, serializeDb } from "@/db/container";
import type { ChangeContext } from "@schellingboard/domain/change";

const AT = new Date("2026-06-01T10:00:00.000Z");

describe("change log", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  async function world() {
    const event = await createEvent();
    const host = await createGuest({ name: "Hana Host" });
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
    const { sessions, changes } = getRepositories();

    await sessions.update(session.id, { title: "New title" }, by);

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
    const { sessions, rsvps, changes } = getRepositories();
    await rsvps.create({ sessionId: session.id, guestId: attendee.id });

    await sessions.delete(session.id, by);

    const [deleted] = await changes.listAfter(0);
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
    const { sessions, changes } = getRepositories();

    await expect(
      sessions.update(session.id, { locationIds: ["no-such-room"] }, by)
    ).rejects.toThrow();

    expect(await changes.listAfter(0)).toEqual([]);
  });

  it("resumes after a sequence number, in order", async () => {
    const { session, by } = await world();
    const { sessions, changes } = getRepositories();

    await sessions.update(session.id, { title: "One" }, by);
    await sessions.update(session.id, { title: "Two" }, by);

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
    const { sessions, changes } = getRepositories();

    await sessions.update(
      session.id,
      { title: "By an organizer" },
      { actor: { type: "admin" }, at: AT }
    );

    const [change] = await changes.listAfter(0);
    expect(change.actor).toEqual({ type: "admin" });
  });

  it("records nothing for a save that changes nothing", async () => {
    const { session, by } = await world();
    const { sessions, changes } = getRepositories();

    await sessions.update(session.id, { title: "Old title" }, by);

    expect(await changes.listAfter(0)).toEqual([]);
  });

  it("skips entries of a type this version does not know", async () => {
    const { session, by } = await world();
    const { sessions, changes } = getRepositories();
    await sessions.update(session.id, { title: "One" }, by);
    const [first] = await changes.listAfter(0);
    const copy = new Database(serializeDb());
    copy
      .prepare(
        `INSERT INTO changes (id, type, subject_type, subject_id, actor_type, occurred_at, payload)
         VALUES ('from-a-newer-version', 'session.renamed.v9', 'session', ?, 'system', ?, '{}')`
      )
      .run(session.id, AT.toISOString());
    restoreDb(copy.serialize());
    copy.close();
    const repos = getRepositories();
    await repos.sessions.update(session.id, { title: "Two" }, by);

    const rest = await repos.changes.listAfter(first.seq);
    expect(rest).toHaveLength(1);
    expect(rest[0]).toMatchObject({ payload: { after: { title: "Two" } } });
  });
});
