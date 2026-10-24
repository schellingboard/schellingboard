import {
  createComment,
  deleteComment,
  editComment,
  likeComment,
  unlikeComment,
  type CommentSubject,
  type CommentView,
} from "../commands/comment";
import type { CommandRunner } from "../commands/runner";
import type { CommentsQuery } from "./comments";

export type Liker = { id: string; name: string; avatarUrl: string | null };
export type CommentResult = { ok: true } | { ok: false; message: string };

const MESSAGES: Record<string, string> = {
  "comment.invalid": "Comment cannot be empty",
  "comment.notAuthor": "Only the author can change a comment",
  "comment.notFound": "This comment no longer exists",
  "comment.parentInvalid": "The comment you replied to no longer exists",
};
const messageFor = (code: string) =>
  MESSAGES[code] ?? "Could not save the comment. Please try again.";

/** Comments are not in the replica, so each change that succeeds is applied to the query by hand. */
export function createCommentsController({
  runner,
  query,
  subject,
  me,
}: {
  runner: CommandRunner;
  query: CommentsQuery;
  subject: CommentSubject;
  /** Read when a like is made: who the reader is can change while a thread is open. */
  me: () => Liker | null;
}) {
  const settle = (
    outcome: { ok: true } | { ok: false; code: string }
  ): CommentResult =>
    outcome.ok
      ? { ok: true }
      : { ok: false, message: messageFor(outcome.code) };

  return {
    create: async (body: string, parentId?: string): Promise<CommentResult> => {
      const outcome = await runner.run(createComment, {
        subject,
        parentId,
        body,
      });
      if (outcome.ok && outcome.data) query.add(outcome.data);
      return settle(outcome);
    },
    edit: async (commentId: string, body: string): Promise<CommentResult> => {
      const outcome = await runner.run(editComment, { commentId, body });
      if (outcome.ok && outcome.data) {
        const edited: CommentView = outcome.data;
        query.update(commentId, () => edited);
      }
      return settle(outcome);
    },
    remove: async (commentId: string): Promise<CommentResult> => {
      const outcome = await runner.run(deleteComment, { commentId });
      if (outcome.ok) {
        // A comment with replies stays in the thread, as the server shows it.
        const { items, hasMore } = query.get();
        // Replies on a page not loaded yet would otherwise come back as orphans.
        if (hasMore || items.some((c) => c.parentId === commentId))
          query.update(commentId, (c) => ({
            ...c,
            deleted: true,
            body: "",
            author: null,
            likes: [],
          }));
        else query.remove(commentId);
      }
      return settle(outcome);
    },
    setLiked: async (
      commentId: string,
      liked: boolean
    ): Promise<CommentResult> => {
      const liker = me();
      if (!liker)
        return { ok: false, message: "Select your name to like a comment" };
      const outcome = await runner.run(liked ? likeComment : unlikeComment, {
        commentId,
      });
      if (outcome.ok)
        query.update(commentId, (c) => ({
          ...c,
          likes: liked
            ? [...c.likes.filter((l) => l.id !== liker.id), liker]
            : c.likes.filter((l) => l.id !== liker.id),
        }));
      return settle(outcome);
    },
  };
}

export type CommentsController = ReturnType<typeof createCommentsController>;
