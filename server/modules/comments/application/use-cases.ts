import type { CommentDeps } from "../ports";
import {
  createComment,
  deleteComment,
  editComment,
  listComments,
  setCommentLike,
  toggleCommentLike,
} from "./comments";

export function createCommentUseCases(deps: CommentDeps) {
  return {
    listComments: listComments(deps),
    createComment: createComment(deps),
    editComment: editComment(deps),
    deleteComment: deleteComment(deps),
    toggleCommentLike: toggleCommentLike(deps),
    setCommentLike: setCommentLike(deps),
  };
}

export type CommentUseCases = ReturnType<typeof createCommentUseCases>;
