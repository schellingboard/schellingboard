import type { CommentDeps } from "../ports";
import {
  createComment,
  deleteComment,
  editComment,
  listComments,
  setCommentLike,
} from "./comments";

export function createCommentUseCases(deps: CommentDeps) {
  return {
    listComments: listComments(deps),
    createComment: createComment(deps),
    editComment: editComment(deps),
    deleteComment: deleteComment(deps),
    setCommentLike: setCommentLike(deps),
  };
}

export type CommentUseCases = ReturnType<typeof createCommentUseCases>;
