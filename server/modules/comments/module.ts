export type { CommentDeps, CommentSubject } from "./ports";
export type { CreateCommentInput } from "./application/comments";
export {
  createCommentUseCases,
  type CommentUseCases,
} from "./application/use-cases";
export { addCommentRoutes } from "./http/routes";
