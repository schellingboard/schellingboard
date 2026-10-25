import { changes, type ChangeContext } from "@schellingboard/domain/change";
import type { SessionProposal } from "@schellingboard/domain/session";
import type { Tx } from "./unit-of-work";

const hostsOf = (p: SessionProposal) =>
  p.hosts.map((h) => `${h.id}:${h.name}`).join();

/**
 * Runs `work`, which removes or renames hosts of `proposals` as a side effect
 * (deleting or renaming a guest), and records a change for each proposal it touched (ADR 0014
 * section 9). Their link rows cascade-delete without a version bump.
 */
export async function recordingProposalCascade<T>(
  tx: Tx,
  proposals: SessionProposal[],
  work: () => Promise<T>,
  by: ChangeContext
): Promise<T> {
  const result = await work();
  for (const before of proposals) {
    const after = await tx.sessionProposals.findById(before.id);
    if (after && hostsOf(after) !== hostsOf(before))
      tx.record(changes.proposalChanged(after, by));
  }
  return result;
}
