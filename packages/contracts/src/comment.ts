import { z } from "zod";
import { COMMENT_MAX_LENGTH } from "@schellingboard/domain/comment";

const body = z
  .string()
  .trim()
  .min(1, { message: "Comment cannot be empty" })
  .max(COMMENT_MAX_LENGTH, {
    message: `Comment must be at most ${COMMENT_MAX_LENGTH} characters`,
  });

export const proposalCommentSchema = z.object({
  proposalId: z.string().min(1),
  eventSlug: z.string().min(1),
  parentId: z.string().min(1).optional(),
  body,
});

export const sessionCommentSchema = z.object({
  sessionId: z.string().min(1),
  parentId: z.string().min(1).optional(),
  body,
});

export const profileCommentSchema = z.object({
  profileId: z.string().min(1),
  parentId: z.string().min(1).optional(),
  body,
});

// eventSlug is only the cache invalidation target for pages that
// server-render their comments — proposals. Sessions and profiles fetch
// theirs client-side and omit it.
export const commentUpdateSchema = z.object({
  commentId: z.string().min(1),
  eventSlug: z.string().min(1).optional(),
  body,
});

export const commentDeleteSchema = z.object({
  commentId: z.string().min(1),
  eventSlug: z.string().min(1).optional(),
});

export const commentLikeSchema = z.object({
  commentId: z.string().min(1),
  eventSlug: z.string().min(1).optional(),
});

const instant = z.iso.datetime({ offset: true });
const guestRef = z.object({ id: z.string(), name: z.string() });

export const commentViewSchema = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  body: z.string(),
  deleted: z
    .boolean()
    .describe(
      "A deleted comment with replies stays in the thread, without body or author"
    ),
  createdTime: instant,
  editedTime: instant.nullable(),
  author: guestRef.nullable(),
  likes: z
    .array(guestRef.extend({ avatarUrl: z.string().nullable() }))
    .describe("Who liked the comment, oldest first"),
});

export const commentListSchema = z.object({
  comments: z.array(commentViewSchema).describe("Oldest first"),
});

export const commentCreateSchema = z.object({
  parentId: z
    .string()
    .min(1)
    .optional()
    .describe("The comment this replies to, on the same subject"),
  body,
});

export const commentEditSchema = z.object({ body });
