import { changes } from "@schellingboard/domain/change";
import type { Comment } from "@schellingboard/domain/comment";
import type { IdentityMode } from "@schellingboard/domain/event";
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

async function modeOfEvent(
  repos: CommentDeps["repos"],
  eventId: string | null
): Promise<IdentityMode> {
  const event = eventId ? await repos.events.findById(eventId) : null;
  return event?.identityMode ?? "open";
}

async function eventIdOfComment(
  repos: CommentDeps["repos"],
  commentId: string
): Promise<string | null> {
  const proposalId = await repos.proposalComments.findSubjectId(commentId);
  if (proposalId) return eventIdOf(repos, { kind: "proposal", id: proposalId });
  const sessionId = await repos.sessionComments.findSubjectId(commentId);
  return sessionId
    ? eventIdOf(repos, { kind: "session", id: sessionId })
    : null;
}

async function eventIdOf(
  repos: CommentDeps["repos"],
  { kind, id }: CommentSubject
): Promise<string | null> {
  if (kind === "proposal")
    return (await repos.sessionProposals.findById(id))?.eventId ?? null;
  if (kind === "session")
    return (await repos.sessions.findById(id))?.eventId ?? null;
  return null;
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
    return deps.uow.run(async (tx) => {
      const acting = await actingGuest(actor, tx.guests);
      if (!acting.ok) return acting;
      const missing = await missingSubject(tx, subject);
      if (missing) return missing;
      const eventId = await eventIdOf(tx, subject);
      const inEvent = await actingGuest(
        actor,
        tx.guests,
        await modeOfEvent(tx, eventId)
      );
      if (!inEvent.ok) return inEvent;
      const comments = thread(tx, subject.kind);
      if (parentId && (await comments.findSubjectId(parentId)) !== subject.id)
        return invalid(
          "comment.parentInvalid",
          "The comment being replied to is invalid"
        );

      const created = await comments.create({
        subjectId: subject.id,
        authorId: acting.value,
        parentId,
        body,
        createdTime: now,
      });
      tx.record(
        changes.commentCreated(
          created,
          { kind: subject.kind, id: subject.id },
          eventId,
          { actor: { type: "guest", id: acting.value }, at: now }
        )
      );
      return ok(created);
    });
  };

export const editComment =
  ({ uow }: CommentDeps) =>
  async (
    actor: Actor,
    { commentId, body }: { commentId: string; body: string },
    now: Date
  ): Promise<Result<Comment>> =>
    uow.run(async (tx) => {
      const own = await ownComment(actor, tx, commentId);
      if (!own.ok) return own;
      await tx.comments.update(commentId, { body, editedTime: now });
      return ok({ ...own.value, body, editedTime: now });
    });

export const deleteComment =
  ({ uow }: CommentDeps) =>
  async (
    actor: Actor,
    { commentId }: { commentId: string }
  ): Promise<Result<void>> =>
    uow.run(async (tx) => {
      const own = await ownComment(actor, tx, commentId);
      if (!own.ok) return own;
      await tx.comments.delete(commentId);
      return ok(undefined);
    });

export const toggleCommentLike =
  ({ uow }: CommentDeps) =>
  async (
    actor: Actor,
    { commentId }: { commentId: string },
    now: Date
  ): Promise<Result<boolean>> =>
    uow.run(async (tx) => {
      const acting = await actingGuest(actor, tx.guests);
      if (!acting.ok) return acting;
      const comment = await liveComment(tx, commentId);
      if (!comment.ok) return comment;
      const inEvent = await actingGuest(
        actor,
        tx.guests,
        await modeOfEvent(tx, await eventIdOfComment(tx, commentId))
      );
      if (!inEvent.ok) return inEvent;
      return ok(
        await tx.comments.toggleLike({
          commentId,
          guestId: acting.value,
          createdTime: now,
        })
      );
    });

export const setCommentLike =
  ({ uow }: CommentDeps) =>
  async (
    actor: Actor,
    { commentId, liked }: { commentId: string; liked: boolean },
    now: Date
  ): Promise<Result<void>> =>
    uow.run(async (tx) => {
      const acting = await actingGuest(actor, tx.guests);
      if (!acting.ok) return acting;
      const comment = await liveComment(tx, commentId);
      if (!comment.ok) return comment;
      const inEvent = await actingGuest(
        actor,
        tx.guests,
        await modeOfEvent(tx, await eventIdOfComment(tx, commentId))
      );
      if (!inEvent.ok) return inEvent;
      await tx.comments.setLike({
        commentId,
        guestId: acting.value,
        liked,
        createdTime: now,
      });
      return ok(undefined);
    });
