// @module-tag 013-US4
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
}));

import { sendMail } from "@/utils/mailer";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { runJobs } from "../helpers/jobs";
import {
  createDay,
  createEvent,
  createGuest,
  createLocation,
  createSession,
} from "../helpers/factories";
import { getRepositories } from "@/db/container";
import {
  eventUseCases,
  peopleUseCases,
  venueUseCases,
} from "@/server/composition";
import type { Actor } from "@/server/kernel/actor";

const ADMIN: Actor = { admin: true, guest: null };
const AT = new Date("2026-06-01T10:00:00.000Z");
const START = new Date("2030-06-02T09:00:00.000Z");
const END = new Date("2030-06-02T10:00:00.000Z");

const sessionChanges = async () =>
  (await getRepositories().changes.listAfter(0)).filter(
    (c) => c.type === "session.changed" || c.type === "session.deleted"
  );

const recipients = () => vi.mocked(sendMail).mock.calls.map(([m]) => m.to);

async function sessionWithAnRsvp() {
  const event = await createEvent();
  const host = await createGuest({
    email: "host@test.example",
    eventId: event.id,
  });
  const rsvper = await createGuest({
    email: "rsvper@test.example",
    eventId: event.id,
  });
  const day = await createDay(event.id, {
    start: new Date("2030-06-02T08:00:00.000Z"),
    end: new Date("2030-06-02T18:00:00.000Z"),
  });
  const room = await createLocation({ eventId: event.id });
  const session = await createSession(event.id, {
    hostIds: [host.id],
    locationIds: [room.id],
    startTime: START,
    endTime: END,
  });
  await getRepositories().rsvps.create({
    sessionId: session.id,
    guestId: rsvper.id,
  });
  return { event, day, room, session, host, rsvper };
}

describe("telling attendees about cascades", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    vi.mocked(sendMail).mockReset();
    vi.stubEnv("SITE_URL", "https://site.example");
  });

  it("tells RSVPed guests once when deleting a location changes their session", async () => {
    const { room, rsvper } = await sessionWithAnRsvp();

    const result = await venueUseCases().deleteLocation(
      ADMIN,
      { id: room.id },
      AT
    );
    expect(result.ok).toBe(true);
    await runJobs();
    await runJobs();

    expect(recipients()).toEqual(["rsvper@test.example"]);
    const notices = await getRepositories().notifications.listByGuest(
      rsvper.id
    );
    expect(notices).toHaveLength(1);
  });

  it("tells RSVPed guests once when deleting a day removes their session", async () => {
    const { day, session } = await sessionWithAnRsvp();

    const result = await eventUseCases().deleteDay(ADMIN, { id: day.id }, AT);
    expect(result.ok).toBe(true);
    await runJobs();
    await runJobs();

    expect(await getRepositories().sessions.findById(session.id)).toBe(
      undefined
    );
    expect(recipients()).toEqual(["rsvper@test.example"]);
  });

  it("stays silent when an event is deleted", async () => {
    const { event } = await sessionWithAnRsvp();

    const result = await eventUseCases().deleteEvent(
      ADMIN,
      { id: event.id },
      AT
    );
    expect(result.ok).toBe(true);
    await runJobs();

    const recorded = await sessionChanges();
    expect(recorded.length).toBeGreaterThan(0);
    for (const change of recorded)
      expect(change.payload).not.toHaveProperty("tellAttendees");
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("stays silent when a host's guest record is deleted", async () => {
    const { host } = await sessionWithAnRsvp();

    const result = await peopleUseCases().deleteGuest(
      ADMIN,
      { id: host.id },
      AT
    );
    expect(result.ok).toBe(true);
    await runJobs();

    const recorded = await sessionChanges();
    expect(recorded.length).toBeGreaterThan(0);
    for (const change of recorded)
      expect(change.payload).not.toHaveProperty("tellAttendees");
    expect(sendMail).not.toHaveBeenCalled();
  });
});
