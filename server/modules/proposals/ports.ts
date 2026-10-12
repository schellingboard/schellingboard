import type { Repositories } from "@/db/container";
import type { UnitOfWork } from "@/server/kernel/unit-of-work";

export interface ProposalDeps {
  uow: UnitOfWork;
  repos: Pick<Repositories, "sessionProposals" | "events" | "guests" | "votes">;
}
