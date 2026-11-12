import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createSession } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { sessionUseCases } from "@/server/composition";
import type { Actor } from "@/server/kernel/actor";

const NOBODY: Actor = { admin: false, guest: null };
const open = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "claimed" },
});
const verified = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "verified" },
});
const now = () => new Date();

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

async function world() {
  const event = await createEvent({ phase: "proposal" });
  const guest = await createGuest({ eventId: event.id });
  const session = await createSession(event.id);
  return { event, guest, session };
}

const marksOf = (guestId: string) =>
  getRepositories().sessionMarks.listByGuest(guestId);

describe("session mark use cases", () => {
  it(
    "bookmarks a session in any phase, replaces the mark and clears it",
    { tags: ["007-US9"] },
    async () => {
      const { guest, session } = await world();
      const input = { sessionId: session.id, guestId: guest.id };
      const set = (kind: "bookmark" | "hidden") =>
        sessionUseCases().setSessionMark(
          open(guest.id),
          { ...input, kind },
          now()
        );

      expect((await set("bookmark")).ok).toBe(true);
      expect(await marksOf(guest.id)).toEqual([{ ...input, kind: "bookmark" }]);

      await set("hidden");
      expect(await marksOf(guest.id)).toEqual([{ ...input, kind: "hidden" }]);

      const cleared = await sessionUseCases().clearSessionMark(
        open(guest.id),
        input,
        now()
      );
      expect(cleared.ok).toBe(true);
      expect(await marksOf(guest.id)).toEqual([]);
    }
  );

  it(
    "refuses a non-member and an unknown session",
    { tags: ["007-US9"] },
    async () => {
      const { guest, session } = await world();
      const outsider = await createGuest({
        eventId: (await createEvent({ phase: "proposal" })).id,
      });

      expect(
        await sessionUseCases().setSessionMark(
          open(outsider.id),
          { sessionId: session.id, guestId: outsider.id, kind: "bookmark" },
          now()
        )
      ).toMatchObject({ ok: false, error: { code: "guest.notInEvent" } });
      expect(
        await sessionUseCases().setSessionMark(
          open(guest.id),
          { sessionId: "nope", guestId: guest.id, kind: "bookmark" },
          now()
        )
      ).toMatchObject({ ok: false, error: { code: "session.notFound" } });
    }
  );

  it(
    "acts as a protected guest only with that guest's verified cookie",
    { tags: ["007-US9"] },
    async () => {
      const { guest, session } = await world();
      await getRepositories().guests.setAuthProtection(guest.id, {
        authProtected: true,
        passwordHash: null,
      });
      const input = { sessionId: session.id, guestId: guest.id };

      for (const actor of [NOBODY, open(guest.id)]) {
        expect(
          await sessionUseCases().setSessionMark(
            actor,
            { ...input, kind: "bookmark" },
            now()
          )
        ).toMatchObject({ ok: false, error: { code: "guest.protected" } });
        expect(
          await sessionUseCases().clearSessionMark(actor, input, now())
        ).toMatchObject({ ok: false, error: { code: "guest.protected" } });
      }
      expect(
        (
          await sessionUseCases().setSessionMark(
            verified(guest.id),
            { ...input, kind: "bookmark" },
            now()
          )
        ).ok
      ).toBe(true);
    }
  );

  it(
    "goes with the session or the guest when either is deleted",
    { tags: ["007-US9"] },
    async () => {
      const { event, guest, session } = await world();
      const other = await createSession(event.id);
      const repos = getRepositories();
      for (const s of [session, other])
        await repos.sessionMarks.upsert(
          { sessionId: s.id, guestId: guest.id, kind: "bookmark" },
          now()
        );

      await repos.sessions.delete(session.id);
      expect(await marksOf(guest.id)).toHaveLength(1);
      await repos.guests.delete(guest.id);
      expect(await marksOf(guest.id)).toEqual([]);
    }
  );
});
