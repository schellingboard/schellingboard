// @module-tag 001-US1
import { describe, it, expect, beforeAll, beforeEach } from "vitest";

// FR-005/FR-020: a recorded attendee count is host-only. The enforcement is
// structural — `attendeeCount` is absent from the `Session` type, which the
// snapshot serialises into every visitor's browser (docs/dev/adr/0007).
// "Structurally impossible" is a claim a test should hold, not something a
// reviewer has to remember, so this pins both payloads that carry sessions:
// the attendee-facing snapshot and the admin session list.

import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createSession } from "../helpers/factories";
import { snapshotFor } from "@/server/feed/snapshot";
import type { Actor } from "@/server/kernel/actor";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import { getRepositories } from "@/db/container";

const HOUR_MS = 60 * 60 * 1000;
const RECORDED_COUNT = 137;

/** Every key anywhere in the payload, however deeply nested. */
function allKeys(value: unknown, into = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) allKeys(item, into);
  } else if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      into.add(key);
      allKeys(nested, into);
    }
  }
  return into;
}

/** Every primitive value anywhere in the payload. */
function allValues(value: unknown, into: unknown[] = []): unknown[] {
  if (Array.isArray(value)) {
    for (const item of value) allValues(item, into);
  } else if (value && typeof value === "object") {
    for (const nested of Object.values(value)) allValues(nested, into);
  } else {
    into.push(value);
  }
  return into;
}

function expectNoCount(payload: unknown): void {
  for (const key of allKeys(payload)) {
    expect(key.toLowerCase()).not.toContain("attendeecount");
    expect(key.toLowerCase()).not.toContain("attendee_count");
  }
  // Belt and braces: the number itself must not appear under some other name.
  // Value by value rather than as a substring of the JSON, where a seeded
  // title or a millisecond stamp can carry the same digits by coincidence.
  for (const value of allValues(payload)) {
    expect(value).not.toBe(RECORDED_COUNT);
    expect(value).not.toBe(String(RECORDED_COUNT));
  }
}

async function snapshotAs(guestId: string, slug: string) {
  const actor: Actor = {
    admin: false,
    guest: { id: guestId, level: "verified" },
  };
  const result = await snapshotFor(unitOfWork, actor, slug, new Date());
  if (!result.ok) throw new Error(`No snapshot of ${slug}`);
  return result.value;
}

async function seed() {
  const event = await createEvent({ phase: "scheduling" });
  const host = await createGuest({ eventId: event.id });
  const attendee = await createGuest({ eventId: event.id });
  const now = Date.now();
  const session = await createSession(event.id, {
    hostIds: [host.id],
    startTime: new Date(now - 3 * HOUR_MS),
    endTime: new Date(now - HOUR_MS),
  });
  await getRepositories().sessions.setAttendeeCount(session.id, RECORDED_COUNT);
  return { event, host, attendee, session };
}

describe("a recorded attendee count never reaches a session payload", () => {
  beforeAll(() => setupTestDb());

  beforeEach(() => resetTestDb());

  it("is absent from the snapshot served to a non-host (FR-005)", async () => {
    const { event, attendee } = await seed();

    const { sessions } = await snapshotAs(attendee.id, event.slug);

    expect(sessions.length).toBeGreaterThan(0);
    expectNoCount(sessions);
  });

  it("is absent even from the snapshot served to the host who recorded it", async () => {
    const { event, host } = await seed();

    // The host reads their count through its own endpoint, never off the
    // shared snapshot — otherwise every other visitor would receive it too.
    const { sessions } = await snapshotAs(host.id, event.slug);

    expect(sessions.length).toBeGreaterThan(0);
    expectNoCount(sessions);
  });

  it("is absent from every other session listing", async () => {
    const { event, host } = await seed();
    const { sessions } = getRepositories();

    for (const rows of [
      await sessions.list(),
      await sessions.listByEvent(event.id),
      await sessions.listScheduled(),
      await sessions.listScheduledByEvent(event.id),
      await sessions.listHostedByGuest(host.id),
    ]) {
      expect(rows.length).toBeGreaterThan(0);
      expectNoCount(rows);
    }
  });
});
