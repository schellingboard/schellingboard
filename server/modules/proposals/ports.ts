import type { Repositories } from "@/db/container";

export interface ProposalDeps {
  repos: Pick<Repositories, "sessionProposals" | "events" | "guests" | "votes">;
  notifyProposalJoined(args: {
    proposalId: string;
    joinerId: string;
    now: Date;
  }): void;
}
