// @module-tag 018-US3
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import {
  adminRemoveRsvpAction,
  loginAsAdmin,
  logoutAdmin,
} from "../helpers/admin-api";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createSession } from "../helpers/factories";
import { getRepositories } from "@/db/container";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

describe("adminRemoveRsvpAction", () => {
  beforeAll(() => setupTestDb());

  beforeEach(async () => {
    resetTestDb();
    logoutAdmin();
    vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await loginAsAdmin();
  });

  afterEach(() => vi.unstubAllEnvs());

  it("removes a single RSVP, leaving others intact", async () => {
    const repos = getRepositories();
    const event = await createEvent();
    const g1 = await createGuest({ name: "Attendee One" });
    const g2 = await createGuest({ name: "Attendee Two" });
    const session = await createSession(event.id);
    await repos.rsvps.create({ sessionId: session.id, guestId: g1.id });
    await repos.rsvps.create({ sessionId: session.id, guestId: g2.id });

    const result = await adminRemoveRsvpAction({
      sessionId: session.id,
      guestId: g1.id,
    });
    expect(result.ok).toBe(true);

    const remaining = await repos.rsvps.listBySession(session.id);
    expect(remaining.map((r) => r.guestId)).toEqual([g2.id]);
  });

  it("rejects when not authenticated", async () => {
    const event = await createEvent();
    const guest = await createGuest();
    const session = await createSession(event.id);
    await getRepositories().rsvps.create({
      sessionId: session.id,
      guestId: guest.id,
    });
    logoutAdmin();

    const result = await adminRemoveRsvpAction({
      sessionId: session.id,
      guestId: guest.id,
    });
    expect(!result.ok && result.error).toBe("Unauthorized");
  });

  it("errors for an unknown session", async () => {
    const result = await adminRemoveRsvpAction({
      sessionId: "no-such-session",
      guestId: "whoever",
    });
    expect(!result.ok && result.error).toBe("Session not found");
  });
});
