import { changes, type ChangeContext } from "@schellingboard/domain/change";
import type { Tx } from "./unit-of-work";

/**
 * Runs `work`, which may delete votes on `proposal` as a side effect
 * (withdrawing, a voter becoming a host, the proposal going away), and records
 * a withdrawal for each voter who lost theirs (ADR 0014 section 9).
 */
export async function recordingVoteLoss<T>(
  tx: Tx,
  proposal: { id: string; eventId: string },
  work: () => Promise<T>,
  by: ChangeContext
): Promise<T> {
  const before = await tx.votes.listByProposal(proposal.id);
  const result = await work();
  const left = new Set(
    (await tx.votes.listByProposal(proposal.id)).map((v) => v.guestId)
  );
  for (const vote of before)
    if (!left.has(vote.guestId))
      tx.record(
        changes.voteWithdrawn(proposal.id, vote.guestId, proposal.eventId, by)
      );
  return result;
}
