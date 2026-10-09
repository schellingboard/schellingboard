// @module-tag 013-US4
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
}));

import { sendMail } from "@/utils/mailer";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { updateLoggedSession } from "../helpers/changes";
import {
  createEvent,
  createGuest,
  createLocation,
  createSession,
} from "../helpers/factories";
import { runJobs } from "../helpers/jobs";
import { getRepositories } from "@/db/container";
import { pruneChanges } from "@/utils/jobs/reactions";

const AT = new Date("2026-06-01T10:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;
const BY_TEST_AT = { actor: { type: "system" as const }, at: AT };

describe("session notifications from the change log", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    vi.mocked(sendMail).mockReset();
    vi.stubEnv("SITE_URL", "https://site.example");
  });

  async function moveSessionWithAnRsvp() {
    const event = await createEvent();
    const host = await createGuest({ email: "host@test.example" });
    const rsvper = await createGuest({ email: "rsvper@test.example" });
    const room = await createLocation({ eventId: event.id });
    const session = await createSession(event.id, {
      hostIds: [host.id],
      locationIds: [room.id],
      startTime: new Date("2026-06-02T09:00:00.000Z"),
      endTime: new Date("2026-06-02T10:00:00.000Z"),
    });
    await getRepositories().rsvps.create({
      sessionId: session.id,
      guestId: rsvper.id,
    });
    await updateLoggedSession(
      session.id,
      {
        startTime: new Date("2026-06-02T11:00:00.000Z"),
        endTime: new Date("2026-06-02T12:00:00.000Z"),
      },
      { actor: { type: "guest", id: host.id }, at: AT }
    );
    return session;
  }

  it("tells the RSVPed guests once, however often the jobs run", async () => {
    await moveSessionWithAnRsvp();

    await runJobs();
    await runJobs();

    expect(vi.mocked(sendMail).mock.calls.map(([m]) => m.to)).toEqual([
      "rsvper@test.example",
    ]);
  });

  it("forgets changes every reaction has handled, once they are a week old", async () => {
    await moveSessionWithAnRsvp();
    const { changes } = getRepositories();

    // Not handled yet: kept however old.
    await pruneChanges.run(new Date(AT.getTime() + 30 * DAY_MS));
    expect(await changes.listAfter(0)).toHaveLength(1);

    await runJobs();
    await pruneChanges.run(new Date(AT.getTime() + 6 * DAY_MS));
    expect(await changes.listAfter(0)).toHaveLength(1);

    await pruneChanges.run(new Date(AT.getTime() + 8 * DAY_MS));
    expect(await changes.listAfter(0)).toEqual([]);
  });

  it("keeps the changes a reaction has not reached yet", async () => {
    const session = await moveSessionWithAnRsvp();
    await runJobs();
    const { changes } = getRepositories();
    await updateLoggedSession(session.id, { title: "Renamed" }, BY_TEST_AT);

    await pruneChanges.run(new Date(AT.getTime() + 8 * DAY_MS));

    expect(await changes.listAfter(0)).toHaveLength(1);
  });
});
