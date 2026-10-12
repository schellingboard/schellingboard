import type { Repositories } from "@/db/container";
import type { UnitOfWork } from "@/server/kernel/unit-of-work";

export type CommentSubjectKind = "proposal" | "session" | "profile";

export interface CommentSubject {
  kind: CommentSubjectKind;
  id: string;
}

export interface CommentDeps {
  uow: UnitOfWork;
  repos: Pick<
    Repositories,
    | "comments"
    | "proposalComments"
    | "sessionComments"
    | "profileComments"
    | "sessionProposals"
    | "sessions"
    | "guests"
  >;
}
