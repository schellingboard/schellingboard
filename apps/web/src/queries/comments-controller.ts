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
/** A failure is reported as a notice by the command runner. */
export type CommentResult = { ok: boolean };

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
  return {
    create: async (body: string, parentId?: string): Promise<CommentResult> => {
      const outcome = await runner.run(createComment, {
        subject,
        parentId,
        body,
      });
      if (outcome.ok && outcome.data) query.add(outcome.data);
      return { ok: outcome.ok };
    },
    edit: async (commentId: string, body: string): Promise<CommentResult> => {
      const outcome = await runner.run(editComment, {
        commentId,
        body,
        subject,
      });
      if (outcome.ok && outcome.data) {
        const edited: CommentView = outcome.data;
        query.update(commentId, () => edited);
      }
      return { ok: outcome.ok };
    },
    remove: async (commentId: string): Promise<CommentResult> => {
      const outcome = await runner.run(deleteComment, { commentId, subject });
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
      return { ok: outcome.ok };
    },
    setLiked: async (
      commentId: string,
      liked: boolean
    ): Promise<CommentResult> => {
      const liker = me();
      if (!liker) return { ok: false };
      const outcome = await runner.run(liked ? likeComment : unlikeComment, {
        commentId,
        subject,
      });
      if (outcome.ok)
        query.update(commentId, (c) => ({
          ...c,
          likes: liked
            ? [...c.likes.filter((l) => l.id !== liker.id), liker]
            : c.likes.filter((l) => l.id !== liker.id),
        }));
      return { ok: outcome.ok };
    },
  };
}

export type CommentsController = ReturnType<typeof createCommentsController>;
