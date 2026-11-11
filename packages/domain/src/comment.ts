import type { Guest } from "./guest";

export const COMMENT_MAX_LENGTH = 20000;

export type CommentAuthor = Pick<Guest, "id" | "name">;

export type CommentLiker = Pick<Guest, "id" | "name" | "avatarUrl">;

/** What a notification needs of a comment; the body stays out of the change log. */
export type CommentRef = Pick<Comment, "id" | "author" | "createdTime">;

/** A comment as its author sees it in their own list, with where it was written. */
export type AuthoredComment = {
  id: string;
  kind: "proposal" | "session" | "profile";
  subjectId: string;
  subjectTitle: string;
  /** Profiles belong to no event. */
  event: { name: string; slug: string } | null;
  body: string;
  createdTime: Date;
  replyCount: number;
  likeCount: number;
};

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
