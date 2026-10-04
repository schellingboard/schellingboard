import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createProposal } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { proposalUseCases } from "@/server/composition";
import type { Actor } from "@/server/kernel/actor";
import { VoteChoice } from "@schellingboard/domain/vote";

const NOBODY: Actor = { admin: false, guest: null };
const open = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "open" },
});
const verified = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "verified" },
});

async function world(phase: "proposal" | "voting" | "scheduling" = "voting") {
  const event = await createEvent({ phase });
  const guest = await createGuest({ eventId: event.id });
  const proposal = await createProposal(event.id, []);
  return { event, guest, proposal };
}

const now = () => new Date();

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

describe("vote use cases", () => {
  it(
    "casts, replaces and withdraws a named guest's vote",
    { tags: ["005-US1"] },
    async () => {
      const { event, guest, proposal } = await world();
      const cast = (choice: VoteChoice) =>
        proposalUseCases().castVote(
          NOBODY,
          { proposalId: proposal.id, guestId: guest.id, choice },
          now()
        );
      const mine = () =>
        proposalUseCases().listGuestVotes(NOBODY, {
          guestId: guest.id,
          event: { id: event.id },
        });

      expect((await cast(VoteChoice.maybe)).ok).toBe(true);
      expect((await cast(VoteChoice.interested)).ok).toBe(true);
      const listed = await mine();
      expect(listed.ok && listed.value).toMatchObject([
        { proposalId: proposal.id, choice: VoteChoice.interested },
      ]);

      expect(
        (
          await proposalUseCases().withdrawVote(
            NOBODY,
            { proposalId: proposal.id, guestId: guest.id },
            now()
          )
        ).ok
      ).toBe(true);
      const bySlug = await proposalUseCases().listGuestVotes(NOBODY, {
        guestId: guest.id,
        event: { slug: event.slug },
      });
      expect(bySlug.ok && bySlug.value).toEqual([]);
    }
  );

  it(
    "a protected guest's votes are cast and read only with its verified cookie",
    { tags: ["005-US1"] },
    async () => {
      const { event, guest, proposal } = await world();
      await getRepositories().guests.setAuthProtection(guest.id, {
        authProtected: true,
        passwordHash: null,
      });
      const input = {
        proposalId: proposal.id,
        guestId: guest.id,
        choice: VoteChoice.skip,
      };

      for (const actor of [NOBODY, open(guest.id)]) {
        expect(
          await proposalUseCases().castVote(actor, input, now())
        ).toMatchObject({ error: { code: "guest.protected" } });
        expect(
          await proposalUseCases().withdrawVote(actor, input, now())
        ).toMatchObject({ error: { code: "guest.protected" } });
        expect(
          await proposalUseCases().listGuestVotes(actor, {
            guestId: guest.id,
            event: { id: event.id },
          })
        ).toMatchObject({ error: { code: "guest.protected" } });
      }
      expect(
        (await proposalUseCases().castVote(verified(guest.id), input, now())).ok
      ).toBe(true);
    }
  );

  it(
    "refuses in check order: proposal, membership, phase",
    { tags: ["005-US1"] },
    async () => {
      const { guest, proposal } = await world();
      const outsider = await createGuest();
      const cast = (proposalId: string, guestId: string) =>
        proposalUseCases().castVote(
          NOBODY,
          { proposalId, guestId, choice: VoteChoice.maybe },
          now()
        );

      expect(await cast("missing", outsider.id)).toMatchObject({
        error: { kind: "notFound", code: "proposal.notFound" },
      });
      expect(await cast(proposal.id, outsider.id)).toMatchObject({
        error: { kind: "forbidden", code: "guest.notInEvent" },
      });
      expect(
        await proposalUseCases().withdrawVote(
          NOBODY,
          { proposalId: "missing", guestId: guest.id },
          now()
        )
      ).toMatchObject({ error: { code: "proposal.notFound" } });

      const scheduling = await world("scheduling");
      const input = {
        proposalId: scheduling.proposal.id,
        guestId: scheduling.guest.id,
      };
      expect(
        await proposalUseCases().castVote(
          NOBODY,
          { ...input, choice: VoteChoice.maybe },
          now()
        )
      ).toMatchObject({
        error: { kind: "forbidden", code: "event.notVotingPhase" },
      });
      expect(
        await proposalUseCases().withdrawVote(NOBODY, input, now())
      ).toMatchObject({ error: { code: "event.notVotingPhase" } });
    }
  );

  it(
    "lists votes only for an event that exists",
    { tags: ["005-US1"] },
    async () => {
      const guest = await createGuest();
      expect(
        await proposalUseCases().listGuestVotes(NOBODY, {
          guestId: guest.id,
          event: { slug: "missing" },
        })
      ).toMatchObject({ error: { kind: "notFound", code: "event.notFound" } });
    }
  );
});
