import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

vi.mock("@/utils/mailer", () => ({ sendMail: vi.fn() }));

import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createProposal } from "../helpers/factories";
import { expectChangesSuffice } from "../helpers/sufficiency";
import { getRepositories } from "@/db/container";
import { proposalUseCases, peopleUseCases } from "@/server/composition";
import type { Actor } from "@/server/kernel/actor";
import { VoteChoice } from "@schellingboard/domain/vote";
import { snapshotFor } from "@/server/feed/snapshot";
import { unitOfWork } from "@/server/kernel/unit-of-work";

const NOBODY: Actor = { admin: false, guest: null };
const ADMIN: Actor = { admin: true, guest: null };
const open = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "claimed" },
});
const now = () => new Date();

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

async function world() {
  const event = await createEvent({ phase: "proposal" });
  const other = await createEvent({ phase: "proposal" });
  const host = await createGuest({ name: "Hana Host", eventId: event.id });
  const member = await createGuest({ name: "Mia Member", eventId: event.id });
  const proposal = await createProposal(event.id, [host.id], {
    title: "Rust intro",
    cohostWanted: true,
    cohostWantedNote: "Know Rust?",
  });
  await createProposal(other.id, [], { title: "Elsewhere" });
  return { event, other, host, member, proposal };
}

async function snapshotOf(actor: Actor, slug: string) {
  const result = await snapshotFor(unitOfWork, actor, slug, now());
  if (!result.ok) throw new Error("no snapshot");
  return result.value;
}

describe("the snapshot's proposals", () => {
  it(
    "lists the event's proposals with their public fields and hosts",
    { tags: ["004-US4"] },
    async () => {
      const w = await world();

      const snapshot = await snapshotOf(NOBODY, w.event.slug);

      expect(snapshot.proposals).toEqual([
        {
          id: w.proposal.id,
          eventId: w.event.id,
          title: "Rust intro",
          description: null,
          durationMinutes: null,
          createdTime: w.proposal.createdTime.toISOString(),
          updatedTime: w.proposal.updatedTime.toISOString(),
          hosts: [{ id: w.host.id, name: "Hana Host" }],
          cohostWanted: true,
          cohostWantedNote: "Know Rust?",
          version: w.proposal.version,
        },
      ]);
    }
  );

  it(
    "is the same for every viewer and carries no vote data",
    { tags: ["004-US4"] },
    async () => {
      const w = await world();
      await getRepositories().votes.upsert({
        proposalId: w.proposal.id,
        guestId: w.member.id,
        choice: VoteChoice.interested,
      });

      const anonymous = await snapshotOf(NOBODY, w.event.slug);
      const member = await snapshotOf(open(w.member.id), w.event.slug);

      expect(member.proposals).toEqual(anonymous.proposals);
      expect(JSON.stringify(anonymous.proposals)).not.toMatch(
        /tally|breakdown|interested|votes/i
      );
    }
  );
});

describe("the logged changes suffice to keep proposals current", () => {
  it("for a proposal created by a member", { tags: ["004-US1"] }, async () => {
    const w = await world();
    await expectChangesSuffice(NOBODY, w.event.slug, async () => {
      const created = await proposalUseCases().createProposal(
        open(w.member.id),
        {
          eventId: w.event.id,
          title: "Fresh",
          description: "About it",
          hostIds: [w.member.id],
          durationMinutes: 30,
          cohostWanted: false,
        },
        now()
      );
      expect(created.ok).toBe(true);
    });
  });

  it(
    "for a proposal edited by its host, others in other events untouched",
    { tags: ["004-US2"] },
    async () => {
      const w = await world();
      await expectChangesSuffice(open(w.member.id), w.event.slug, async () => {
        const updated = await proposalUseCases().updateProposal(
          open(w.host.id),
          {
            proposalId: w.proposal.id,
            expectedVersion: w.proposal.version,
            title: "Renamed",
            description: "More",
            hostIds: [w.host.id, w.member.id],
            durationMinutes: 45,
            cohostWanted: false,
          },
          now()
        );
        expect(updated.ok).toBe(true);
      });
    }
  );

  it("for a member who joins as host", { tags: ["004-US6"] }, async () => {
    const w = await world();
    await expectChangesSuffice(NOBODY, w.event.slug, async () => {
      const joined = await proposalUseCases().joinProposal(
        open(w.member.id),
        { proposalId: w.proposal.id },
        now()
      );
      expect(joined.ok).toBe(true);
    });
  });

  it("for a proposal its host withdraws", { tags: ["004-US3"] }, async () => {
    const w = await world();
    await expectChangesSuffice(NOBODY, w.event.slug, async () => {
      const deleted = await proposalUseCases().deleteProposal(
        open(w.host.id),
        { proposalId: w.proposal.id },
        now()
      );
      expect(deleted.ok).toBe(true);
    });
  });

  it(
    "for proposals an organizer creates, edits and deletes",
    { tags: ["018-US1"] },
    async () => {
      const w = await world();
      await expectChangesSuffice(NOBODY, w.event.slug, async () => {
        const created = await proposalUseCases().adminCreateProposal(
          ADMIN,
          {
            event: { id: w.event.id },
            title: "Seeded",
            description: "",
            durationMinutes: null,
            hostIds: [w.member.id],
          },
          now()
        );
        if (!created.ok) throw new Error("create failed");
        const updated = await proposalUseCases().adminUpdateProposal(
          ADMIN,
          {
            id: created.value.id,
            title: "Seeded again",
            description: "d",
            durationMinutes: 20,
            hostIds: [],
            expectedVersion: created.value.version,
          },
          now()
        );
        expect(updated.ok).toBe(true);
        await proposalUseCases().adminDeleteProposal(
          ADMIN,
          { id: w.proposal.id },
          now()
        );
      });
    }
  );

  it("for a host who renames themselves", { tags: ["007-US8"] }, async () => {
    const w = await world();
    await expectChangesSuffice(NOBODY, w.event.slug, async () => {
      const renamed = await peopleUseCases().updateMyProfile(
        open(w.host.id),
        {
          name: "Hana Renamed",
          aboutMe: null,
          pronouns: null,
          basedIn: null,
          prompts: null,
          languages: null,
          contacts: null,
          expectedVersion: w.host.profileVersion,
        },
        now()
      );
      expect(renamed.ok).toBe(true);
    });
  });

  it("for a host an organizer renames", { tags: ["007-US8"] }, async () => {
    const w = await world();
    await expectChangesSuffice(NOBODY, w.event.slug, async () => {
      const renamed = await peopleUseCases().updateGuest(
        ADMIN,
        {
          id: w.host.id,
          name: "Hana Renamed",
          email: "hana@example.com",
          expectedVersion: (await getRepositories().guests.findById(w.host.id))!
            .version,
        },
        now()
      );
      expect(renamed.ok).toBe(true);
    });
  });

  it(
    "for a proposal whose host is deleted",
    { tags: ["007-US8"] },
    async () => {
      const w = await world();
      await expectChangesSuffice(NOBODY, w.event.slug, async () => {
        const deleted = await peopleUseCases().deleteGuest(
          ADMIN,
          { id: w.host.id },
          now()
        );
        expect(deleted.ok).toBe(true);
      });
    }
  );
});

describe("proposal changes in the log", () => {
  it(
    "are recorded for the event's viewers, one per change",
    { tags: ["004-US6"] },
    async () => {
      const w = await world();
      const before = (await getRepositories().changes.listAfter(0, 1000))
        .length;

      await proposalUseCases().joinProposal(
        open(w.member.id),
        { proposalId: w.proposal.id },
        now()
      );

      const logged = (await getRepositories().changes.listAfter(0, 1000)).slice(
        before
      );
      const changed = logged.filter((c) => c.type === "proposal.changed");
      expect(changed).toHaveLength(1);
      expect(changed[0]).toMatchObject({
        eventId: w.event.id,
        audience: { kind: "event" },
      });
      const proposal = (changed[0].payload as { proposal: object }).proposal;
      expect(proposal).not.toHaveProperty("votesCount");
      expect(proposal).not.toHaveProperty("sessionIds");
    }
  );
});
