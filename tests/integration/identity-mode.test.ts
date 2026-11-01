import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createProposal } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import { createEventUseCases } from "@/server/modules/events/module";
import { sessionUseCases } from "@/server/composition";
import { createCommentUseCases } from "@/server/modules/comments/module";
import type { Actor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";

const ADMIN: Actor = { admin: true, guest: null };
const claimed = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "claimed" },
});
const verified = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "verified" },
});

const events = () =>
  createEventUseCases({ repos: getRepositories(), uow: unitOfWork });
const settings = {
  name: "Camp",
  description: "",
  website: "",
  timezone: "UTC",
  maxSessionDuration: 120,
  breakMinutes: 10,
  slotIncrementMinutes: 30,
};
const code = (r: Result<unknown>) => (r.ok ? "ok" : r.error.code);
const mode = async (id: string) =>
  (await getRepositories().events.findById(id))?.identityMode;

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

describe("an event's identity mode", { tags: ["015-US7"] }, () => {
  it("is verified for a new event unless the organizer picks open", async () => {
    const made = await events().createEvent(ADMIN, settings);
    const open = await events().createEvent(ADMIN, {
      ...settings,
      name: "Open camp",
      identityMode: "open",
    });

    expect(made.ok && made.value.identityMode).toBe("verified");
    expect(open.ok && open.value.identityMode).toBe("open");
  });

  it("is refused when unknown, and kept when an edit leaves it out", async () => {
    const event = await createEvent();
    expect(
      code(
        await events().createEvent(ADMIN, {
          ...settings,
          identityMode: "strict" as "open",
        })
      )
    ).toBe("event.identityModeInvalid");

    const changed = await events().updateEvent(
      ADMIN,
      {
        ...settings,
        id: event.id,
        expectedVersion: event.version,
        identityMode: "verified",
      },
      new Date()
    );
    expect(changed.ok && changed.value.identityMode).toBe("verified");
    const kept = await events().updateEvent(
      ADMIN,
      { ...settings, id: event.id, expectedVersion: event.version + 1 },
      new Date()
    );
    expect(kept.ok && kept.value.identityMode).toBe("verified");
  });

  it("makes every participant of a verified event need a verified login", async () => {
    const event = await createEvent({ phase: "scheduling" });
    const member = await createGuest({ eventId: event.id });
    const stranger = await createGuest();
    const list = (actor: Actor, guestId: string) =>
      sessionUseCases().listGuestRsvps(actor, { guestId });
    const setMode = async (identityMode: "open" | "verified") => {
      const current = await getRepositories().events.findById(event.id);
      return events().updateEvent(
        ADMIN,
        {
          ...settings,
          id: event.id,
          expectedVersion: current!.version,
          identityMode,
        },
        new Date()
      );
    };
    expect(code(await list(claimed(member.id), member.id))).toBe("ok");

    expect((await setMode("verified")).ok).toBe(true);
    expect(await mode(event.id)).toBe("verified");
    expect(code(await list(claimed(member.id), member.id))).toBe(
      "guest.protected"
    );
    expect(code(await list(verified(member.id), member.id))).toBe("ok");
    expect(code(await list(claimed(stranger.id), stranger.id))).toBe("ok");
    const shown = await getRepositories().guests.listByEvent(event.id);
    expect(shown.map((g) => g.authProtected)).toEqual([true]);

    await setMode("open");
    expect(code(await list(claimed(member.id), member.id))).toBe("ok");
  });

  it("keeps a claimed name that is not a member out of a verified event", async () => {
    const event = await createEvent({ phase: "scheduling" });
    const host = await createGuest({ eventId: event.id });
    const stranger = await createGuest();
    const proposal = await createProposal(event.id, [host.id]);
    const comment = (actor: Actor) =>
      createCommentUseCases({
        repos: getRepositories(),
        uow: unitOfWork,
      }).createComment(
        actor,
        { subject: { kind: "proposal", id: proposal.id }, body: "Hi" },
        new Date()
      );
    expect(code(await comment(claimed(stranger.id)))).toBe("ok");

    const current = await getRepositories().events.findById(event.id);
    await events().updateEvent(
      ADMIN,
      {
        ...settings,
        id: event.id,
        expectedVersion: current!.version,
        identityMode: "verified",
      },
      new Date()
    );

    expect(code(await comment(claimed(stranger.id)))).toBe("guest.protected");
    expect(code(await comment(verified(stranger.id)))).toBe("ok");
  });

  it("records a guest change when the mode changes, for open clients", async () => {
    const event = await createEvent();
    const member = await createGuest({ eventId: event.id });
    const before = (await getRepositories().changes.listAfter(0)).length;
    await events().updateEvent(
      ADMIN,
      {
        ...settings,
        id: event.id,
        expectedVersion: event.version,
        identityMode: "verified",
      },
      new Date()
    );
    const after = (await getRepositories().changes.listAfter(0)).slice(before);
    expect(JSON.stringify(after)).toContain(member.id);
  });
});
