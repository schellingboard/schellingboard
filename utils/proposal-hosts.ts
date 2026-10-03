import type { SessionProposal } from "@/db/repositories/interfaces";

export function wantsHost(
  proposal: Pick<SessionProposal, "hosts" | "cohostWanted">
): boolean {
  return proposal.hosts.length === 0 || proposal.cohostWanted;
}
