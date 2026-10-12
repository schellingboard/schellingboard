import type { Repositories } from "@/db/container";

export const proposalComments = (
  q: Pick<Repositories, "proposalComments">,
  proposalId: string
) => q.proposalComments.list(proposalId);
