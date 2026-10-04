"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

import {
  commentDeleteSchema,
  commentLikeSchema,
  commentUpdateSchema,
  profileCommentSchema,
  proposalCommentSchema,
  sessionCommentSchema,
} from "@schellingboard/contracts/comment";
import { commentUseCases } from "@/server/composition";
import { resolveActor, type Actor } from "@/server/kernel/actor";
import type { CommentSubject } from "@/server/modules/comments/module";
import type { AppError, Result } from "@/server/kernel/result";
import { serverNow } from "@/utils/dev-clock-server";
import {
  actingGuestRefusalMessage,
  unverifiedUserMessage,
  verifiedCurrentUser,
} from "@/utils/acting-guest";
import { requireSiteAuth } from "@/utils/action-auth";

export type CommentActionResult =
  { error: string | z.core.$ZodIssue[] } | { success: true };

export type CommentLikeResult =
  { error: string | z.core.$ZodIssue[] } | { success: true; liked: boolean };

class Refusal extends Error {
  constructor(readonly payload: string | z.core.$ZodIssue[]) {
    super(typeof payload === "string" ? payload : JSON.stringify(payload));
  }
}

function toResult(
  error: unknown,
  failure: string
): { error: string | z.core.$ZodIssue[] } {
  if (error instanceof Refusal) {
    return { error: error.payload };
  }
  console.error(failure, error);
  return { error: failure };
}

// Only surfaces that server-render their comments need cache invalidation —
// proposals. Sessions and profiles reload through their own endpoint, so they
// pass no slug and nothing is revalidated for them.
function revalidateEvent(eventSlug: string | undefined): void {
  if (eventSlug) {
    revalidatePath(`/${eventSlug}`, "layout");
  }
}

// Before parsing, so a visitor without a name hears that first; the use cases
// check again.
async function requireGuest(task: string): Promise<Actor> {
  const cookieStore = await cookies();
  if (!(await verifiedCurrentUser(cookieStore))) {
    throw new Refusal(await unverifiedUserMessage(cookieStore, task));
  }
  return resolveActor(cookieStore);
}

async function requireParsed<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown
): Promise<z.output<Schema>> {
  const parsed = await schema.safeParseAsync(input);
  if (!parsed.success) {
    throw new Refusal(parsed.error.issues);
  }
  return parsed.data;
}

function settled<T>(result: Result<T>, task: string): T {
  if (result.ok) return result.value;
  throw new Refusal(refusalMessage(result.error, task));
}

function refusalMessage(error: AppError, task: string): string {
  return error.code.startsWith("guest.")
    ? actingGuestRefusalMessage(error.code, task)
    : (error.detail ?? "Something went wrong");
}

async function create(
  actor: Actor,
  subject: CommentSubject,
  { parentId, body }: { parentId?: string; body: string }
): Promise<void> {
  settled(
    await commentUseCases().createComment(
      actor,
      { subject, parentId, body },
      await serverNow()
    ),
    "commenting"
  );
}

export async function createProposalComment(
  comment: z.input<typeof proposalCommentSchema>
): Promise<CommentActionResult>;
export async function createProposalComment(
  input: unknown
): Promise<CommentActionResult> {
  await requireSiteAuth();
  try {
    const actor = await requireGuest("commenting");
    const { proposalId, eventSlug, ...comment } = await requireParsed(
      proposalCommentSchema,
      input
    );
    await create(actor, { kind: "proposal", id: proposalId }, comment);
    revalidateEvent(eventSlug);
    return { success: true };
  } catch (error) {
    return toResult(error, "Failed to post comment");
  }
}

export async function createSessionComment(
  comment: z.input<typeof sessionCommentSchema>
): Promise<CommentActionResult>;
export async function createSessionComment(
  input: unknown
): Promise<CommentActionResult> {
  await requireSiteAuth();
  try {
    const actor = await requireGuest("commenting");
    const { sessionId, ...comment } = await requireParsed(
      sessionCommentSchema,
      input
    );
    await create(actor, { kind: "session", id: sessionId }, comment);
    return { success: true };
  } catch (error) {
    return toResult(error, "Failed to post comment");
  }
}

export async function createProfileComment(
  comment: z.input<typeof profileCommentSchema>
): Promise<CommentActionResult>;
export async function createProfileComment(
  input: unknown
): Promise<CommentActionResult> {
  await requireSiteAuth();
  try {
    const actor = await requireGuest("commenting");
    const { profileId, ...comment } = await requireParsed(
      profileCommentSchema,
      input
    );
    await create(actor, { kind: "profile", id: profileId }, comment);
    return { success: true };
  } catch (error) {
    return toResult(error, "Failed to post comment");
  }
}

export async function updateComment(
  comment: z.input<typeof commentUpdateSchema>
): Promise<CommentActionResult>;
export async function updateComment(
  input: unknown
): Promise<CommentActionResult> {
  await requireSiteAuth();
  try {
    const task = "editing your comment";
    const actor = await requireGuest(task);
    const { commentId, body, eventSlug } = await requireParsed(
      commentUpdateSchema,
      input
    );
    settled(
      await commentUseCases().editComment(
        actor,
        { commentId, body },
        await serverNow()
      ),
      task
    );
    revalidateEvent(eventSlug);
    return { success: true };
  } catch (error) {
    return toResult(error, "Failed to update comment");
  }
}

export async function toggleCommentLike(
  like: z.input<typeof commentLikeSchema>
): Promise<CommentLikeResult>;
export async function toggleCommentLike(
  input: unknown
): Promise<CommentLikeResult> {
  await requireSiteAuth();
  try {
    const task = "liking a comment";
    const actor = await requireGuest(task);
    const { commentId, eventSlug } = await requireParsed(
      commentLikeSchema,
      input
    );
    const liked = settled(
      await commentUseCases().toggleCommentLike(
        actor,
        { commentId },
        await serverNow()
      ),
      task
    );
    revalidateEvent(eventSlug);
    return { success: true, liked };
  } catch (error) {
    return toResult(error, "Failed to like comment");
  }
}

export async function deleteComment(
  comment: z.input<typeof commentDeleteSchema>
): Promise<CommentActionResult>;
export async function deleteComment(
  input: unknown
): Promise<CommentActionResult> {
  await requireSiteAuth();
  try {
    const task = "deleting your comment";
    const actor = await requireGuest(task);
    const { commentId, eventSlug } = await requireParsed(
      commentDeleteSchema,
      input
    );
    settled(await commentUseCases().deleteComment(actor, { commentId }), task);
    revalidateEvent(eventSlug);
    return { success: true };
  } catch (error) {
    return toResult(error, "Failed to delete comment");
  }
}
