import { inVotingPhase, type VotingPhaseDates } from "./phase";
import type { SessionProposal } from "./session";

export type VoteRefusal =
  "guest.notInEvent" | "event.notVotingPhase" | "vote.ownProposal";

export type VoteRuleInput = {
  intent: "cast" | "withdraw";
  event: VotingPhaseDates | undefined;
  now: Date;
  guestId: string;
  guestInEvent: boolean;
  proposal: Pick<SessionProposal, "hosts">;
};

/** Withdraw skips membership so that a host or former guest can always clear a stale vote. */
export function voteRefusal(input: VoteRuleInput): VoteRefusal | undefined {
  const { intent, event, now, guestId, proposal } = input;
  if (intent === "cast" && !input.guestInEvent) return "guest.notInEvent";
  if (!event || !inVotingPhase(event, now)) return "event.notVotingPhase";
  if (intent === "cast" && proposal.hosts.some((h) => h.id === guestId))
    return "vote.ownProposal";
  return undefined;
}
