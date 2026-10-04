import type { Repositories } from "@/db/container";

export interface ProposalDeps {
  repos: Pick<Repositories, "sessionProposals" | "events" | "guests" | "votes">;
}
