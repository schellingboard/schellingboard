import type { Repositories } from "@/db/container";
import type { Comment } from "@schellingboard/domain/comment";

export type CommentSubjectKind = "proposal" | "session" | "profile";

export interface CommentSubject {
  kind: CommentSubjectKind;
  id: string;
}

export interface CommentDeps {
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
  notifyCommented(args: {
    subject: CommentSubject;
    comment: Comment;
    now: Date;
  }): void;
}
