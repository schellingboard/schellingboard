import type { Comment } from "@schellingboard/domain/comment";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import {
  forbidden,
  invalid,
  notFound,
  ok,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { CommentDeps, CommentSubject } from "../ports";

export interface CreateCommentInput {
  subject: CommentSubject;
  parentId?: string;
  body: string;
}

function thread(repos: CommentDeps["repos"], kind: CommentSubject["kind"]) {
  return {
    proposal: repos.proposalComments,
    session: repos.sessionComments,
    profile: repos.profileComments,
  }[kind];
}

async function missingSubject(
  repos: CommentDeps["repos"],
  { kind, id }: CommentSubject
): Promise<Failure | null> {
  if (kind === "proposal")
    return (await repos.sessionProposals.findById(id))
      ? null
      : notFound("proposal.notFound", "Proposal not found");
  if (kind === "session")
    return (await repos.sessions.findById(id))
      ? null
      : notFound("session.notFound", "Session not found");
  return (await repos.guests.findById(id))
    ? null
    : notFound("profile.notFound", "Profile not found");
}

const commentNotFound = () => notFound("comment.notFound", "Comment not found");

async function liveComment(
  repos: CommentDeps["repos"],
  commentId: string
): Promise<Result<Comment>> {
  const comment = await repos.comments.findById(commentId);
  return comment && !comment.deleted ? ok(comment) : commentNotFound();
}

async function ownComment(
  actor: Actor,
  repos: CommentDeps["repos"],
  commentId: string
): Promise<Result<Comment>> {
  const acting = await actingGuest(actor, repos.guests);
  if (!acting.ok) return acting;
  const comment = await liveComment(repos, commentId);
  if (!comment.ok) return comment;
  if (comment.value.author?.id !== acting.value)
    return forbidden("comment.notAuthor", "Comment owned by another guest");
  return comment;
}

export const listComments =
  ({ repos }: CommentDeps) =>
  async (_actor: Actor, subject: CommentSubject): Promise<Result<Comment[]>> =>
    (await missingSubject(repos, subject)) ??
    ok(await thread(repos, subject.kind).list(subject.id));

export const createComment =
  (deps: CommentDeps) =>
  async (
    actor: Actor,
    { subject, parentId, body }: CreateCommentInput,
    now: Date
  ): Promise<Result<Comment>> => {
    const { repos } = deps;
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const missing = await missingSubject(repos, subject);
    if (missing) return missing;
    const comments = thread(repos, subject.kind);
    if (parentId && (await comments.findSubjectId(parentId)) !== subject.id)
      return invalid(
        "comment.parentInvalid",
        "The comment being replied to is invalid"
      );

    const comment = await comments.create({
      subjectId: subject.id,
      authorId: acting.value,
      parentId,
      body,
      createdTime: now,
    });
    deps.notifyCommented({ subject, comment, now });
    return ok(comment);
  };

export const editComment =
  ({ repos }: CommentDeps) =>
  async (
    actor: Actor,
    { commentId, body }: { commentId: string; body: string },
    now: Date
  ): Promise<Result<Comment>> => {
    const own = await ownComment(actor, repos, commentId);
    if (!own.ok) return own;
    await repos.comments.update(commentId, { body, editedTime: now });
    return ok({ ...own.value, body, editedTime: now });
  };

export const deleteComment =
  ({ repos }: CommentDeps) =>
  async (
    actor: Actor,
    { commentId }: { commentId: string }
  ): Promise<Result<void>> => {
    const own = await ownComment(actor, repos, commentId);
    if (!own.ok) return own;
    await repos.comments.delete(commentId);
    return ok(undefined);
  };

export const toggleCommentLike =
  ({ repos }: CommentDeps) =>
  async (
    actor: Actor,
    { commentId }: { commentId: string },
    now: Date
  ): Promise<Result<boolean>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const comment = await liveComment(repos, commentId);
    if (!comment.ok) return comment;
    return ok(
      await repos.comments.toggleLike({
        commentId,
        guestId: acting.value,
        createdTime: now,
      })
    );
  };

export const setCommentLike =
  ({ repos }: CommentDeps) =>
  async (
    actor: Actor,
    { commentId, liked }: { commentId: string; liked: boolean },
    now: Date
  ): Promise<Result<void>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const comment = await liveComment(repos, commentId);
    if (!comment.ok) return comment;
    await repos.comments.setLike({
      commentId,
      guestId: acting.value,
      liked,
      createdTime: now,
    });
    return ok(undefined);
  };
