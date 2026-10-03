import type { SessionProposal } from "@schellingboard/domain/session";

export function wantsHost(
  proposal: Pick<SessionProposal, "hosts" | "cohostWanted">
): boolean {
  return proposal.hosts.length === 0 || proposal.cohostWanted;
}
