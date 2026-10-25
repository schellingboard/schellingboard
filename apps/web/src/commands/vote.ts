import { voteRefusal } from "@schellingboard/domain/vote-rule";
import type { VoteChoice } from "@schellingboard/domain/vote";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { Command, Prediction } from "./runner";
import { describeProposalIn } from "./subject";

const date = (iso: string | null) => (iso ? new Date(iso) : undefined);

type Intent = { intent: "cast"; choice: VoteChoice } | { intent: "withdraw" };

function predictVote(
  replica: Snapshot,
  now: Date,
  proposalId: string,
  action: Intent
): Prediction {
  const { me, event } = replica;
  if (!me) return { refusal: "guest.notInEvent" };
  const proposal = replica.proposals.find((p) => p.id === proposalId);
  if (!proposal) return { refusal: "proposal.notFound" };

  const refusal = voteRefusal({
    intent: action.intent,
    event: {
      votingPhaseStart: date(event.votingPhaseStart),
      votingPhaseEnd: date(event.votingPhaseEnd),
      schedulingPhaseStart: date(event.schedulingPhaseStart),
    },
    now,
    guestId: me.guestId,
    guestInEvent: replica.guests.some((g) => g.id === me.guestId && g.member),
    proposal,
  });
  if (refusal) return { refusal };

  return {
    project: (current) => {
      if (!current.me) return current;
      const held = current.me.votes.find((v) => v.proposalId === proposalId);
      if (action.intent === "withdraw") {
        return held
          ? {
              ...current,
              me: {
                ...current.me,
                votes: current.me.votes.filter((v) => v !== held),
              },
            }
          : current;
      }
      if (held?.choice === action.choice) return current;
      const vote = { proposalId, choice: action.choice };
      return {
        ...current,
        me: {
          ...current.me,
          votes: held
            ? current.me.votes.map((v) => (v === held ? vote : v))
            : [...current.me.votes, vote],
        },
      };
    },
  };
}

const PATH = "/api/v1/proposals/{id}/votes/{guestId}" as const;

const target = (replica: Snapshot, proposalId: string) => ({
  path: { id: proposalId, guestId: replica.me?.guestId ?? "" },
});

export const castVote: Command<{ proposalId: string; choice: VoteChoice }> = {
  kind: "vote.cast",
  describe: (replica, { proposalId }) =>
    `vote on ${describeProposalIn(replica, proposalId)}`,
  target: ({ proposalId }) => `vote:${proposalId}`,
  predict: (replica, now, { proposalId, choice }) =>
    predictVote(replica, now, proposalId, { intent: "cast", choice }),
  call: (api, { proposalId, choice }, key, replica) =>
    api.PUT(PATH, {
      params: target(replica, proposalId),
      body: { choice },
      headers: { "Idempotency-Key": key },
    }),
};

export const withdrawVote: Command<{ proposalId: string }> = {
  kind: "vote.withdraw",
  describe: (replica, { proposalId }) =>
    `withdraw your vote on ${describeProposalIn(replica, proposalId)}`,
  target: ({ proposalId }) => `vote:${proposalId}`,
  predict: (replica, now, { proposalId }) =>
    predictVote(replica, now, proposalId, { intent: "withdraw" }),
  call: (api, { proposalId }, key, replica) =>
    api.DELETE(PATH, {
      params: target(replica, proposalId),
      headers: { "Idempotency-Key": key },
    }),
};
