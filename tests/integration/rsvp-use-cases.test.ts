import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createSession } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { sessionUseCases } from "@/server/composition";
import type { Actor } from "@/server/kernel/actor";

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

async function world(
  opts: Parameters<typeof createEvent>[0] = { phase: "scheduling" }
) {
  const event = await createEvent(opts);
  const guest = await createGuest({ eventId: event.id });
  const session = await createSession(event.id, { capacity: 1 });
  return { event, guest, session };
}

const now = () => new Date();

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

describe("RSVP use cases", () => {
  it(
    "RSVPs a named guest and withdraws again",
    { tags: ["009-US1"] },
    async () => {
      const { guest, session } = await world();
      const input = { sessionId: session.id, guestId: guest.id };

      expect((await sessionUseCases().rsvp(NOBODY, input, now())).ok).toBe(
        true
      );
      const listed = await sessionUseCases().listSessionRsvps(NOBODY, {
        sessionId: session.id,
      });
      expect(listed.ok && listed.value).toMatchObject([
        { sessionId: session.id, guestId: guest.id },
      ]);

      expect(
        (await sessionUseCases().withdrawRsvp(NOBODY, input, now())).ok
      ).toBe(true);
      const mine = await sessionUseCases().listGuestRsvps(NOBODY, {
        guestId: guest.id,
      });
      expect(mine.ok && mine.value).toEqual([]);
    }
  );

  it(
    "acts as a protected guest only with that guest's verified cookie",
    { tags: ["009-US1"] },
    async () => {
      const { guest, session } = await world();
      await protect(guest.id);
      const input = { sessionId: session.id, guestId: guest.id };

      for (const actor of [NOBODY, open(guest.id)]) {
        expect(await sessionUseCases().rsvp(actor, input, now())).toMatchObject(
          { ok: false, error: { code: "guest.protected" } }
        );
        expect(
          await sessionUseCases().listGuestRsvps(actor, { guestId: guest.id })
        ).toMatchObject({ ok: false, error: { code: "guest.protected" } });
      }
      expect(
        (await sessionUseCases().rsvp(verified(guest.id), input, now())).ok
      ).toBe(true);
    }
  );

  it(
    "refuses in check order: session, membership, phase, host",
    { tags: ["009-US1"] },
    async () => {
      const { event, guest, session } = await world();
      const outsider = await createGuest();
      const rsvp = (sessionId: string, guestId: string) =>
        sessionUseCases().rsvp(NOBODY, { sessionId, guestId }, now());

      expect(await rsvp("missing", outsider.id)).toMatchObject({
        error: { kind: "notFound", code: "session.notFound" },
      });
      expect(await rsvp(session.id, outsider.id)).toMatchObject({
        error: { kind: "forbidden", code: "guest.notInEvent" },
      });

      const hosted = await createSession(event.id, { hostIds: [guest.id] });
      expect(await rsvp(hosted.id, guest.id)).toMatchObject({
        error: { kind: "forbidden", code: "rsvp.ownSession" },
      });
      expect(
        (
          await sessionUseCases().withdrawRsvp(
            NOBODY,
            { sessionId: hosted.id, guestId: guest.id },
            now()
          )
        ).ok
      ).toBe(true);

      const voting = await world({ phase: "voting" });
      for (const run of [
        sessionUseCases().rsvp,
        sessionUseCases().withdrawRsvp,
      ]) {
        expect(
          await run(
            NOBODY,
            { sessionId: voting.session.id, guestId: voting.guest.id },
            now()
          )
        ).toMatchObject({
          error: { kind: "forbidden", code: "event.notSchedulingPhase" },
        });
      }
    }
  );

  it(
    "refuses an RSVP to a full session when the event enforces capacity",
    { tags: ["009-US2"] },
    async () => {
      const { event, guest, session } = await world({
        phase: "scheduling",
        rsvpCapacityHardLimit: true,
      });
      const other = await createGuest({ eventId: event.id });
      const rsvp = (guestId: string) =>
        sessionUseCases().rsvp(
          NOBODY,
          { sessionId: session.id, guestId },
          now()
        );

      expect((await rsvp(guest.id)).ok).toBe(true);
      expect(await rsvp(other.id)).toMatchObject({
        error: { kind: "conflict", code: "session.full" },
      });
      expect((await rsvp(guest.id)).ok).toBe(true);
    }
  );

  it(
    "lists a session's RSVPs only for a session that exists",
    { tags: ["009-US1"] },
    async () => {
      expect(
        await sessionUseCases().listSessionRsvps(NOBODY, {
          sessionId: "missing",
        })
      ).toMatchObject({ error: { code: "session.notFound" } });
    }
  );
});

describe("admin RSVP use cases", () => {
  it(
    "an organizer removes a guest's RSVP in any phase",
    { tags: ["018-US3"] },
    async () => {
      const { guest, session } = await world({ phase: "proposal" });
      await getRepositories().rsvps.create({
        sessionId: session.id,
        guestId: guest.id,
      });
      const input = { sessionId: session.id, guestId: guest.id };

      expect(
        await sessionUseCases().adminRemoveRsvp(open(guest.id), input)
      ).toMatchObject({ error: { code: "admin.required" } });
      expect(
        await sessionUseCases().adminRemoveRsvp(ADMIN, {
          ...input,
          sessionId: "missing",
        })
      ).toMatchObject({ error: { code: "session.notFound" } });

      const removed = await sessionUseCases().adminRemoveRsvp(ADMIN, input);
      expect(removed.ok && removed.value.id).toBe(session.id);
      expect(
        await getRepositories().rsvps.listBySession(session.id)
      ).toHaveLength(0);
    }
  );
});
