import type { Guest } from "./guest";

export const COMMENT_MAX_LENGTH = 20000;

export type CommentAuthor = Pick<Guest, "id" | "name">;

export type CommentLiker = Pick<Guest, "id" | "name" | "avatarUrl">;

/** What a notification needs of a comment; the body stays out of the change log. */
export type CommentRef = Pick<Comment, "id" | "author" | "createdTime">;

export type Comment = {
  id: string;
  parentId: string | null;
  body: string;
  deleted: boolean;
  createdTime: Date;
  editedTime: Date | null;
  author: CommentAuthor | null;
  likes: CommentLiker[];
};
