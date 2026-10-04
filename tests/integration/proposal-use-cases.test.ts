import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

vi.mock("@/utils/mailer", () => ({ sendMail: vi.fn() }));

const { afterTasks } = vi.hoisted(() => ({
  afterTasks: [] as Promise<unknown>[],
}));

vi.mock("next/server", async (original) => ({
  ...(await original<typeof import("next/server")>()),
  after: (task: () => unknown) => {
    afterTasks.push(Promise.resolve(task()));
  },
}));

import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createProposal } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { proposalUseCases } from "@/server/composition";
import type { Actor } from "@/server/kernel/actor";
import { VoteChoice } from "@schellingboard/domain/vote";

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

async function protect(guestId: string) {
  await getRepositories().guests.setAuthProtection(guestId, {
    authProtected: true,
    passwordHash: null,
  });
}

async function vote(
  proposalId: string,
  guestIds: string[],
  choice: VoteChoice
) {
  for (const guestId of guestIds)
    await getRepositories().votes.upsert({ proposalId, guestId, choice });
}

async function voters(eventId: string, count: number) {
  const ids: string[] = [];
  for (let i = 0; i < count; i++) ids.push((await createGuest({ eventId })).id);
  return ids;
}

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  afterTasks.length = 0;
});

describe("reading proposals: the vote breakdown", () => {
  it(
    "shows a hosted proposal's breakdown to its hosts only; others get the tally",
    { tags: ["005-US3", "004-US4"] },
    async () => {
      const event = await createEvent({ phase: "scheduling" });
      const host = await createGuest({ eventId: event.id });
      const other = await createGuest({ eventId: event.id });
      const proposal = await createProposal(event.id, [host.id]);
      const ids = await voters(event.id, 4);
      await vote(proposal.id, ids.slice(0, 2), VoteChoice.interested);
      await vote(proposal.id, ids.slice(2, 3), VoteChoice.maybe);
      await vote(proposal.id, ids.slice(3), VoteChoice.skip);

      const asHost = await proposalUseCases().getProposal(
        open(host.id),
        { proposalId: proposal.id },
        now()
      );
      expect(asHost.ok && asHost.value).toMatchObject({
        id: proposal.id,
        tally: { interested: 2, maybe: 1 },
        breakdown: { interested: 2, maybe: 1, skip: 1, votes: 4, attendees: 6 },
      });

      for (const actor of [open(other.id), NOBODY, ADMIN]) {
        const seen = await proposalUseCases().getProposal(
          actor,
          { proposalId: proposal.id },
          now()
        );
        expect(seen.ok && seen.value).toMatchObject({
          tally: { interested: 2, maybe: 1 },
          breakdown: null,
        });
        expect(seen.ok && seen.value).not.toHaveProperty("skipVotesCount");
        expect(seen.ok && seen.value).not.toHaveProperty("votesCount");
      }

      const listed = await proposalUseCases().listProposals(
        open(other.id),
        { eventId: event.id },
        now()
      );
      expect(listed.ok && listed.value).toMatchObject([
        { id: proposal.id, breakdown: null },
      ]);
      const listedByHost = await proposalUseCases().listProposals(
        open(host.id),
        { eventId: event.id },
        now()
      );
      expect(listedByHost.ok && listedByHost.value).toMatchObject([
        { id: proposal.id, breakdown: { skip: 1 } },
      ]);
    }
  );

  it(
    "shows an unhosted proposal's breakdown to everyone",
    { tags: ["005-US3"] },
    async () => {
      const event = await createEvent({ phase: "scheduling" });
      const proposal = await createProposal(event.id, []);
      await vote(proposal.id, await voters(event.id, 1), VoteChoice.skip);

      const seen = await proposalUseCases().getProposal(
        NOBODY,
        { proposalId: proposal.id },
        now()
      );
      expect(seen.ok && seen.value).toMatchObject({
        breakdown: { skip: 1, votes: 1 },
      });
    }
  );

  it(
    "a protected host sees the breakdown only with that host's verified cookie",
    { tags: ["005-US3"] },
    async () => {
      const event = await createEvent({ phase: "scheduling" });
      const host = await createGuest({ eventId: event.id });
      await protect(host.id);
      const proposal = await createProposal(event.id, [host.id]);

      const unverified = await proposalUseCases().getProposal(
        open(host.id),
        { proposalId: proposal.id },
        now()
      );
      expect(unverified.ok && unverified.value).toMatchObject({
        breakdown: null,
      });
      const proven = await proposalUseCases().getProposal(
        verified(host.id),
        { proposalId: proposal.id },
        now()
      );
      expect(proven.ok && proven.value.breakdown).not.toBeNull();
    }
  );

  it(
    "shows no tally or breakdown to anyone until scheduling starts",
    { tags: ["005-US3"] },
    async () => {
      for (const phase of ["proposal", "voting"] as const) {
        const event = await createEvent({ phase });
        const host = await createGuest({ eventId: event.id });
        const hosted = await createProposal(event.id, [host.id]);
        await createProposal(event.id, []);
        await vote(hosted.id, await voters(event.id, 1), VoteChoice.interested);

        const asHost = await proposalUseCases().getProposal(
          open(host.id),
          { proposalId: hosted.id },
          now()
        );
        expect(asHost.ok && asHost.value).toMatchObject({
          tally: null,
          breakdown: null,
        });
        const listed = await proposalUseCases().listProposals(
          NOBODY,
          { eventId: event.id },
          now()
        );
        expect(listed.ok && listed.value).toMatchObject([
          { tally: null, breakdown: null },
          { tally: null, breakdown: null },
        ]);
      }
    }
  );

  it(
    "guesses attendance only when enough attendees voted",
    { tags: ["005-US4"] },
    async () => {
      const event = await createEvent({ phase: "scheduling" });
      const crowd = await voters(event.id, 20);
      const popular = await createProposal(event.id, []);
      await vote(popular.id, crowd.slice(0, 10), VoteChoice.interested);
      await vote(popular.id, crowd.slice(10, 15), VoteChoice.skip);
      const quiet = await createProposal(event.id, []);
      await vote(quiet.id, crowd.slice(0, 1), VoteChoice.interested);

      const seen = await proposalUseCases().listProposals(
        NOBODY,
        { eventId: event.id },
        now()
      );
      if (!seen.ok) throw new Error("listing failed");
      const byId = new Map(seen.value.map((p) => [p.id, p.breakdown]));
      expect(byId.get(popular.id)).toMatchObject({
        estimatedAttendance: { low: expect.any(Number) as number },
        noEstimateReason: null,
      });
      expect(byId.get(quiet.id)).toMatchObject({
        estimatedAttendance: null,
        noEstimateReason: "low-turnout",
      });
    }
  );

  it(
    "refuses an unknown proposal or event",
    { tags: ["004-US4"] },
    async () => {
      const proposal = await proposalUseCases().getProposal(
        NOBODY,
        {
          proposalId: "missing",
        },
        now()
      );
      expect(!proposal.ok && proposal.error.code).toBe("proposal.notFound");
      const list = await proposalUseCases().listProposals(
        NOBODY,
        {
          eventId: "missing",
        },
        now()
      );
      expect(!list.ok && list.error.code).toBe("event.notFound");
    }
  );
});

describe("proposal mutations", () => {
  it(
    "creates a proposal as the acting guest until scheduling starts",
    { tags: ["004-US1"] },
    async () => {
      const event = await createEvent({ phase: "voting" });
      const guest = await createGuest({ eventId: event.id });
      const input = {
        eventId: event.id,
        title: "Rust for beginners",
        hostIds: [guest.id],
        cohostWanted: false,
      };

      const refused = await proposalUseCases().createProposal(
        NOBODY,
        input,
        now()
      );
      expect(!refused.ok && refused.error.code).toBe("guest.unselected");
      const stranger = await proposalUseCases().createProposal(
        open(guest.id),
        { ...input, hostIds: ["someone-else"] },
        now()
      );
      expect(!stranger.ok && stranger.error.code).toBe(
        "proposal.hostNotInEvent"
      );

      const created = await proposalUseCases().createProposal(
        open(guest.id),
        { ...input, hostIds: [guest.id, guest.id] },
        now()
      );
      expect(created.ok && created.value).toMatchObject({
        title: "Rust for beginners",
        hosts: [{ id: guest.id }],
      });

      const closed = await createEvent({ phase: "scheduling" });
      const late = await proposalUseCases().createProposal(
        open(guest.id),
        { ...input, eventId: closed.id, hostIds: [] },
        now()
      );
      expect(!late.ok && late.error.code).toBe("event.proposalsClosed");
    }
  );

  it(
    "lets only a host edit a hosted proposal, refusing a stale copy",
    { tags: ["004-US2"] },
    async () => {
      const event = await createEvent();
      const host = await createGuest({ eventId: event.id });
      const other = await createGuest({ eventId: event.id });
      const proposal = await createProposal(event.id, [host.id], {
        durationMinutes: 60,
      });
      const edit = {
        proposalId: proposal.id,
        title: "Renamed",
        hostIds: [host.id, other.id],
        cohostWanted: false,
        expectedUpdatedTime: proposal.updatedTime,
      };

      const notHost = await proposalUseCases().updateProposal(
        open(other.id),
        edit,
        now()
      );
      expect(!notHost.ok && notHost.error.code).toBe("proposal.notHost");

      const updated = await proposalUseCases().updateProposal(
        open(host.id),
        edit,
        new Date(Date.now() + 1000)
      );
      expect(updated.ok && updated.value).toMatchObject({
        title: "Renamed",
        hosts: expect.arrayContaining([
          { id: other.id, name: other.name },
        ]) as unknown,
      });
      expect(updated.ok && updated.value.durationMinutes).toBeUndefined();

      const stale = await proposalUseCases().updateProposal(
        open(host.id),
        edit,
        now()
      );
      expect(!stale.ok && stale.error.code).toBe("proposal.stale");
    }
  );

  it(
    "joins a proposal that wants a host and tells its hosts",
    { tags: ["004-US6"] },
    async () => {
      const event = await createEvent();
      const host = await createGuest({ eventId: event.id });
      const joiner = await createGuest({ eventId: event.id });
      const proposal = await createProposal(event.id, [host.id], {
        cohostWanted: true,
      });

      const joined = await proposalUseCases().joinProposal(
        open(joiner.id),
        { proposalId: proposal.id },
        now()
      );
      expect(joined.ok).toBe(true);
      await Promise.all(afterTasks);
      expect(
        await getRepositories().notifications.listByGuest(host.id)
      ).toMatchObject([{ text: expect.stringContaining("co-host") as string }]);

      const again = await proposalUseCases().joinProposal(
        open(joiner.id),
        { proposalId: proposal.id },
        now()
      );
      expect(!again.ok && again.error.code).toBe("proposal.alreadyHost");
    }
  );

  it(
    "deletes a proposal for its host, any attendee for an unhosted one",
    { tags: ["004-US3"] },
    async () => {
      const event = await createEvent();
      const host = await createGuest({ eventId: event.id });
      const other = await createGuest({ eventId: event.id });
      const hosted = await createProposal(event.id, [host.id]);
      const unhosted = await createProposal(event.id, []);

      const refused = await proposalUseCases().deleteProposal(open(other.id), {
        proposalId: hosted.id,
      });
      expect(!refused.ok && refused.error.code).toBe("proposal.notHost");
      expect(
        (
          await proposalUseCases().deleteProposal(open(host.id), {
            proposalId: hosted.id,
          })
        ).ok
      ).toBe(true);
      expect(
        (
          await proposalUseCases().deleteProposal(NOBODY, {
            proposalId: unhosted.id,
          })
        ).ok
      ).toBe(true);
      expect(
        await getRepositories().sessionProposals.listByEvent(event.id)
      ).toEqual([]);
    }
  );

  it(
    "lets an organizer edit and delete any proposal",
    { tags: ["018-US1"] },
    async () => {
      const event = await createEvent();
      const host = await createGuest({ eventId: event.id });
      const proposal = await createProposal(event.id, [host.id]);
      const edit = {
        id: proposal.id,
        title: "  Organizer title  ",
        description: "",
        durationMinutes: 30,
        hostIds: [host.id, host.id],
        expectedUpdatedTime: proposal.updatedTime.toISOString(),
      };

      const guest = await proposalUseCases().adminUpdateProposal(
        open(host.id),
        edit,
        now()
      );
      expect(!guest.ok && guest.error.code).toBe("admin.required");
      const unknownHost = await proposalUseCases().adminUpdateProposal(
        ADMIN,
        { ...edit, hostIds: ["nobody"] },
        now()
      );
      expect(!unknownHost.ok && unknownHost.error.detail).toBe(
        "Guest not found: nobody"
      );

      const updated = await proposalUseCases().adminUpdateProposal(
        ADMIN,
        edit,
        new Date(Date.now() + 1000)
      );
      expect(updated.ok && updated.value).toMatchObject({
        title: "Organizer title",
        durationMinutes: 30,
        hosts: [{ id: host.id }],
      });

      expect(
        (
          await proposalUseCases().adminDeleteProposal(ADMIN, {
            id: proposal.id,
          })
        ).ok
      ).toBe(true);
      const gone = await proposalUseCases().adminDeleteProposal(ADMIN, {
        id: proposal.id,
      });
      expect(!gone.ok && gone.error.code).toBe("proposal.notFound");
    }
  );
});
