// @module-tag 009-US1
// @module-tag 009-US2
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createSession } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { DELETE, PUT } from "@/tests/helpers/v1-route";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";

type RsvpCall = {
  sessionId: string;
  guestId: string;
  remove?: boolean;
  key?: string;
};

function toggleRsvp({ sessionId, guestId, remove, key }: RsvpCall) {
  const headers: Record<string, string> = {
    cookie: `${GUEST_COOKIE_NAME}=${openGuestValue(guestId)}`,
  };
  if (key) headers["idempotency-key"] = key;
  return (remove ? DELETE : PUT)(
    new NextRequest(
      `http://test/api/v1/sessions/${sessionId}/rsvps/${guestId}`,
      { method: remove ? "DELETE" : "PUT", headers }
    )
  );
}

const rsvpsForGuest = (guestId: string) =>
  getRepositories().rsvps.listByGuest(guestId);

describe("RSVP writes through /api/v1", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  it("records the Idempotency-Key on the change and ignores a repeat", async () => {
    const event = await createEvent({ phase: "scheduling" });
    const guest = await createGuest({ eventId: event.id });
    const session = await createSession(event.id);
    const send = () =>
      toggleRsvp({ sessionId: session.id, guestId: guest.id, key: "click-1" });

    expect((await send()).ok).toBe(true);
    expect((await send()).ok).toBe(true);

    const added = (await getRepositories().changes.listAfter(0)).filter(
      (c) => c.type === "rsvp.added"
    );
    expect(added.map((c) => c.commandKey)).toEqual(["click-1"]);
  });

  it("withdrawing an absent RSVP is a no-op", async () => {
    const event = await createEvent({ phase: "scheduling" });
    const guest = await createGuest();
    const session = await createSession(event.id);
    await getRepositories().guests.assignToEvent(event.id, [guest.id]);

    const res = await toggleRsvp({
      sessionId: session.id,
      guestId: guest.id,
      remove: true,
    });
    expect(res.ok).toBe(true);
    expect(await rsvpsForGuest(guest.id)).toHaveLength(0);
  });

  it("adding twice keeps one RSVP and records one change", async () => {
    const event = await createEvent({ phase: "scheduling" });
    const guest = await createGuest();
    const session = await createSession(event.id);
    await getRepositories().guests.assignToEvent(event.id, [guest.id]);

    for (let i = 0; i < 2; i++) {
      const res = await toggleRsvp({
        sessionId: session.id,
        guestId: guest.id,
      });
      expect(res.ok).toBe(true);
    }

    expect(await rsvpsForGuest(guest.id)).toHaveLength(1);
    const added = (await getRepositories().changes.listAfter(0)).filter(
      (c) => c.type === "rsvp.added"
    );
    expect(added).toHaveLength(1);
  });

  describe("capacity hard limit", () => {
    it("rejects a new RSVP when the session is full and the event enforces capacity", async () => {
      const event = await createEvent({
        phase: "scheduling",
        rsvpCapacityHardLimit: true,
      });
      const alice = await createGuest({ name: "Alice" });
      const bob = await createGuest({ name: "Bob" });
      const session = await createSession(event.id, { capacity: 1 });
      await getRepositories().guests.assignToEvent(event.id, [
        alice.id,
        bob.id,
      ]);

      const first = await toggleRsvp({
        sessionId: session.id,
        guestId: alice.id,
      });
      expect(first.ok).toBe(true);

      const second = await toggleRsvp({
        sessionId: session.id,
        guestId: bob.id,
      });
      expect(second.status).toBe(409);
      expect(await second.json()).toMatchObject({ code: "session.full" });
      expect(await rsvpsForGuest(bob.id)).toHaveLength(0);

      // Removal must still work on a full session.
      const remove = await toggleRsvp({
        sessionId: session.id,
        guestId: alice.id,
        remove: true,
      });
      expect(remove.ok).toBe(true);
      expect(await rsvpsForGuest(alice.id)).toHaveLength(0);
    });

    it("allows exceeding capacity when the event does not enforce it", async () => {
      const event = await createEvent({ phase: "scheduling" });
      const alice = await createGuest({ name: "Alice" });
      const bob = await createGuest({ name: "Bob" });
      const session = await createSession(event.id, { capacity: 1 });
      await getRepositories().guests.assignToEvent(event.id, [
        alice.id,
        bob.id,
      ]);

      for (const guest of [alice, bob]) {
        const res = await toggleRsvp({
          sessionId: session.id,
          guestId: guest.id,
        });
        expect(res.ok).toBe(true);
        expect(await rsvpsForGuest(guest.id)).toHaveLength(1);
      }
    });

    it("treats capacity 0 as unlimited even when enforcement is on", async () => {
      const event = await createEvent({
        phase: "scheduling",
        rsvpCapacityHardLimit: true,
      });
      const alice = await createGuest({ name: "Alice" });
      const bob = await createGuest({ name: "Bob" });
      const session = await createSession(event.id, { capacity: 0 });
      await getRepositories().guests.assignToEvent(event.id, [
        alice.id,
        bob.id,
      ]);

      for (const guest of [alice, bob]) {
        const res = await toggleRsvp({
          sessionId: session.id,
          guestId: guest.id,
        });
        expect(res.ok).toBe(true);
        expect(await rsvpsForGuest(guest.id)).toHaveLength(1);
      }
    });

    it("re-adding an existing RSVP on a full session succeeds", async () => {
      const event = await createEvent({
        phase: "scheduling",
        rsvpCapacityHardLimit: true,
      });
      const alice = await createGuest({ name: "Alice" });
      const session = await createSession(event.id, { capacity: 1 });
      await getRepositories().guests.assignToEvent(event.id, [alice.id]);

      for (let i = 0; i < 2; i++) {
        const res = await toggleRsvp({
          sessionId: session.id,
          guestId: alice.id,
        });
        expect(res.ok).toBe(true);
      }
      expect(await rsvpsForGuest(alice.id)).toHaveLength(1);
    });

    it("enforces capacity atomically for concurrent requests", async () => {
      const event = await createEvent({
        phase: "scheduling",
        rsvpCapacityHardLimit: true,
      });
      const alice = await createGuest({ name: "Alice" });
      const bob = await createGuest({ name: "Bob" });
      const session = await createSession(event.id, { capacity: 1 });
      await getRepositories().guests.assignToEvent(event.id, [
        alice.id,
        bob.id,
      ]);

      const [first, second] = await Promise.all([
        toggleRsvp({ sessionId: session.id, guestId: alice.id }),
        toggleRsvp({ sessionId: session.id, guestId: bob.id }),
      ]);

      const oks = [first, second].filter((res) => res.ok);
      expect(oks).toHaveLength(1);
      const rsvps = await getRepositories().rsvps.listBySession(session.id);
      expect(rsvps).toHaveLength(1);
    });
  });
});

describe("createIfUnderCapacity", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  it("refuses a full session, and returns an existing RSVP unchanged", async () => {
    const event = await createEvent();
    const session = await createSession(event.id, { capacity: 1 });
    const first = await createGuest({ eventId: event.id });
    const second = await createGuest({ eventId: event.id });
    const { rsvps } = getRepositories();

    const created = await rsvps.createIfUnderCapacity({
      sessionId: session.id,
      guestId: first.id,
      capacity: 1,
    });
    const again = await rsvps.createIfUnderCapacity({
      sessionId: session.id,
      guestId: first.id,
      capacity: 1,
    });
    const refused = await rsvps.createIfUnderCapacity({
      sessionId: session.id,
      guestId: second.id,
      capacity: 1,
    });

    expect(again?.id).toBe(created?.id);
    expect(refused).toBeNull();
  });
});
