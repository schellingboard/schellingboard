// @module-tag 007-US8
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createDay,
  createEvent,
  createGuest,
  createLocation,
  createSession,
  createUnavailability,
} from "../helpers/factories";
import { updateLoggedSession } from "../helpers/changes";
import { getRepositories, withWriter } from "@/db/container";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import { snapshotFor } from "@/server/feed/snapshot";
import type { Actor } from "@/server/kernel/actor";
import { snapshotSchema } from "@schellingboard/contracts/snapshot";

const NINE = new Date("2026-06-02T09:00:00.000Z");
const TEN = new Date("2026-06-02T10:00:00.000Z");

const NOBODY: Actor = { admin: false, guest: null };
const openGuest = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "open" },
});

async function read(slug: string, actor: Actor) {
  const result = await snapshotFor(unitOfWork, actor, slug);
  return result.ok ? result.value : undefined;
}

describe("snapshot", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  async function world() {
    const repos = getRepositories();
    const event = await createEvent();
    const other = await createEvent();
    const day = await createDay(event.id);
    const room = await createLocation({ name: "Room A", eventId: event.id });
    await createLocation({ name: "Elsewhere", eventId: other.id });
    const member = await createGuest({ name: "Mia Member", eventId: event.id });
    const host = await createGuest({ name: "Hal Host" });
    const partner = await createGuest({ name: "Pat Partner" });
    await createGuest({ name: "Ola Outsider" });
    const session = await createSession(event.id, {
      title: "Talk",
      hostIds: [host.id],
      locationIds: [room.id],
      startTime: NINE,
      endTime: TEN,
    });
    const elsewhere = await createSession(other.id, { title: "Other talk" });
    await repos.rsvps.create({ sessionId: session.id, guestId: member.id });
    await repos.rsvps.create({ sessionId: elsewhere.id, guestId: member.id });
    const unavailable = await createUnavailability(
      event.id,
      room.id,
      NINE,
      TEN
    );
    const point = await repos.meetingPoints.create({
      eventId: event.id,
      name: "Lobby",
      description: "",
      sortIndex: 0,
    });
    const meeting = await repos.meetings.create({
      eventId: event.id,
      requesterId: member.id,
      recipientId: partner.id,
      slotStart: NINE,
      slotEnd: TEN,
      meetingPoint: "Lobby",
      message: "",
      createdAt: NINE,
    });
    await repos.meetingAvailability.replaceForGuest(member.id, event.id, [
      NINE,
    ]);
    return {
      event,
      day,
      room,
      member,
      host,
      partner,
      session,
      unavailable,
      point,
      meeting,
    };
  }

  it("holds the event's schedule, normalized", async () => {
    const w = await world();

    const snapshot = await read(w.event.slug, NOBODY);

    expect(snapshotSchema.parse(snapshot)).toEqual(snapshot);
    expect(snapshot).toMatchObject({
      event: { id: w.event.id, slug: w.event.slug },
      days: [{ id: w.day.id }],
      locations: [{ id: w.room.id, name: "Room A" }],
      unavailability: [{ id: w.unavailable.id, locationId: w.room.id }],
      sessions: [
        {
          id: w.session.id,
          title: "Talk",
          hostIds: [w.host.id],
          locationIds: [w.room.id],
          startTime: NINE.toISOString(),
          version: w.session.version,
        },
      ],
      counts: { [w.session.id]: 1 },
      meetingPoints: [{ id: w.point.id, name: "Lobby" }],
      me: null,
    });
    expect(snapshot!.sessions[0]).not.toHaveProperty("hosts");
    expect(snapshot!.locations[0]).not.toHaveProperty("eventIds");
  });

  it("names the event's members and session hosts, not meeting parties", async () => {
    const w = await world();

    const snapshot = await read(w.event.slug, NOBODY);

    expect(snapshot!.guests.map((g) => [g.name, g.member])).toEqual([
      ["Hal Host", false],
      ["Mia Member", true],
    ]);
    expect(Object.keys(snapshot!.guests[0]).sort()).toEqual([
      "aboutMe",
      "authProtected",
      "avatarUrl",
      "id",
      "member",
      "name",
      "profileVersion",
    ]);
  });

  it("gives a viewer their own RSVPs in the event, meetings and slots", async () => {
    const w = await world();

    const repos = getRepositories();
    await repos.meetings.create({
      eventId: w.event.id,
      requesterId: w.host.id,
      recipientId: w.partner.id,
      slotStart: TEN,
      slotEnd: new Date("2026-06-02T11:00:00.000Z"),
      meetingPoint: "Lobby",
      message: "",
      createdAt: NINE,
    });
    await repos.meetingAvailability.replaceForGuest(w.host.id, w.event.id, [
      TEN,
    ]);

    const snapshot = await read(w.event.slug, openGuest(w.member.id));

    expect(snapshotSchema.parse(snapshot)).toEqual(snapshot);

    const me = snapshot!.me!;
    expect(me.guestId).toBe(w.member.id);
    expect(me.rsvps.map((r) => [r.sessionId, r.guestId])).toEqual([
      [w.session.id, w.member.id],
    ]);
    expect(me.meetings).toMatchObject([
      {
        id: w.meeting.id,
        recipientId: w.partner.id,
        status: "pending",
        slotStart: NINE.toISOString(),
      },
    ]);
    expect(me.meetingGuests.map((g) => g.name)).toEqual(["Pat Partner"]);
    expect(me.availability).toEqual([NINE.toISOString()]);
  });

  it("is stamped with the newest seq, which pruning does not lower", async () => {
    const w = await world();
    expect((await read(w.event.slug, NOBODY))!.seq).toBe(0);

    await updateLoggedSession(w.session.id, { title: "One" });
    await updateLoggedSession(w.session.id, { title: "Two" });
    const [, second] = await getRepositories().changes.listAfter(0);
    await withWriter((writer) => writer.exec("DELETE FROM changes"));

    const snapshot = await read(w.event.slug, NOBODY);
    expect(snapshot!.seq).toBe(second.seq);
    expect(snapshot!.sessions[0].title).toBe("Two");
  });

  it("is undefined for an unknown event", async () => {
    expect(await read("nope", NOBODY)).toBeUndefined();
  });
});
