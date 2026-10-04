import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createSession } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { createSessionUseCases } from "@/server/modules/sessions/module";
import type { Actor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";

const HOUR_MS = 60 * 60 * 1000;
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
const now = () => new Date();

const sessions = () =>
  createSessionUseCases({
    repos: getRepositories(),
    notifyCohostsAdded: vi.fn(async () => {}),
    nudgeJobs: vi.fn(),
  });

const code = (result: Result<unknown>) =>
  result.ok ? "ok" : result.error.code;

async function scenario({ finished = true } = {}) {
  const event = await createEvent({ phase: "scheduling" });
  const host = await createGuest({ eventId: event.id });
  const stranger = await createGuest({ eventId: event.id });
  const offset = finished ? -3 * HOUR_MS : HOUR_MS;
  const session = await createSession(event.id, {
    hostIds: [host.id],
    startTime: new Date(Date.now() + offset),
    endTime: new Date(Date.now() + offset + 2 * HOUR_MS),
  });
  return { host, stranger, session };
}

const record = (actor: Actor, sessionId: string, count: unknown) =>
  sessions().recordAttendeeCount(actor, { sessionId, count }, now());
const read = (actor: Actor, sessionId: string) =>
  sessions().getAttendeeCount(actor, { sessionId }, now());

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

describe("attendee count", () => {
  it(
    "lets a host of a finished session record a count and read the stored value",
    { tags: ["001-US1"] },
    async () => {
      const { host, session } = await scenario();

      expect(await record(open(host.id), session.id, 12)).toEqual({
        ok: true,
        value: 12,
      });
      expect(await read(open(host.id), session.id)).toEqual({
        ok: true,
        value: 12,
      });
      expect(await record(open(host.id), session.id, null)).toEqual({
        ok: true,
        value: null,
      });
    }
  );

  it(
    "answers a stranger and an unknown session alike, so neither can be told apart",
    { tags: ["001-US1"] },
    async () => {
      const { host, stranger, session } = await scenario();
      await record(open(host.id), session.id, 12);

      for (const result of [
        await read(open(stranger.id), session.id),
        await read(open(host.id), "no-such-session"),
      ]) {
        expect(result).toMatchObject({
          ok: false,
          error: { kind: "forbidden", code: "attendeeCount.notHost" },
        });
      }
      expect(code(await record(open(stranger.id), session.id, 99))).toBe(
        "attendeeCount.notHost"
      );
      expect(code(await read(ADMIN, session.id))).toBe("guest.unselected");
    }
  );

  it(
    "checks who is asking before the value, so a stranger cannot probe the rules",
    { tags: ["001-US1"] },
    async () => {
      const { host, stranger, session } = await scenario();

      expect(code(await record(open(stranger.id), session.id, -1))).toBe(
        "attendeeCount.notHost"
      );
      expect(code(await record(NOBODY, session.id, -1))).toBe(
        "guest.unselected"
      );
      for (const bad of [-1, 1.5, 1001, "x"])
        expect(await record(open(host.id), session.id, bad)).toMatchObject({
          ok: false,
          error: { kind: "invalid", code: "attendeeCount.invalid" },
        });
    }
  );

  it(
    "refuses before the session has finished",
    { tags: ["001-US1"] },
    async () => {
      const { host, session } = await scenario({ finished: false });

      expect(code(await read(open(host.id), session.id))).toBe(
        "attendeeCount.sessionNotFinished"
      );
      expect(code(await record(open(host.id), session.id, 3))).toBe(
        "attendeeCount.sessionNotFinished"
      );
    }
  );

  it(
    "needs a protected host's verified cookie (#370)",
    { tags: ["001-US1"] },
    async () => {
      const { host, session } = await scenario();
      await getRepositories().guests.setAuthProtection(host.id, {
        authProtected: true,
        passwordHash: null,
      });

      expect(code(await read(open(host.id), session.id))).toBe(
        "guest.protected"
      );
      expect(code(await read(verified(host.id), session.id))).toBe("ok");
    }
  );
});
