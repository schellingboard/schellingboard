import type { Snapshot } from "@schellingboard/contracts/snapshot";
import {
  commentCreateSchema,
  commentEditSchema,
  type commentViewSchema,
} from "@schellingboard/contracts/comment";
import type { Command } from "./runner";
import { describeProposalIn, describeSessionIn } from "./subject";

export type CommentView = (typeof commentViewSchema)["_output"];

export type CommentSubject = {
  kind: "session" | "proposal" | "profile";
  id: string;
  /** Names a profile in notices: a profile is not in the replica. */
  name?: string;
};

type Input = { subject: CommentSubject; parentId?: string; body: string };

/** Comments are not in the replica: the caller adds the created comment to its query. */
export const createComment: Command<Input, CommentView> = {
  kind: "comment.create",
  describe: (replica, { subject }) =>
    `post your comment${onSubject(replica, { subject })}`,
  predict: (_replica, _now, { parentId, body }) =>
    commentCreateSchema.safeParse({ parentId, body }).success
      ? { project: (replica) => replica }
      : { refusal: "comment.invalid" },
  call: (api, { subject, parentId, body }, key) => {
    const options = {
      params: { path: { id: subject.id } },
      body: { parentId, body },
      headers: { "Idempotency-Key": key },
    };
    switch (subject.kind) {
      case "session":
        return api.POST("/api/v1/sessions/{id}/comments", options);
      case "proposal":
        return api.POST("/api/v1/proposals/{id}/comments", options);
      case "profile":
        return api.POST("/api/v1/guests/{id}/comments", options);
    }
  },
};

type Target = { commentId: string; subject: CommentSubject };

const onSubject = (replica: Snapshot, { subject }: Pick<Target, "subject">) =>
  subject.kind === "session"
    ? ` on ${describeSessionIn(replica, subject.id)}`
    : subject.kind === "proposal"
      ? ` on ${describeProposalIn(replica, subject.id)}`
      : subject.name
        ? ` on ${subject.name}’s profile`
        : " on a profile";
const path = ({ commentId }: Target) => ({
  params: { path: { id: commentId } },
});
const unchanged = { project: (replica: Snapshot) => replica };

export const editComment: Command<Target & { body: string }, CommentView> = {
  kind: "comment.edit",
  describe: (replica, input) =>
    `save your edit to a comment${onSubject(replica, input)}`,
  target: ({ commentId }) => `comment:${commentId}`,
  predict: (_replica, _now, { body }) =>
    commentEditSchema.safeParse({ body }).success
      ? unchanged
      : { refusal: "comment.invalid" },
  call: (api, input, key) =>
    api.PUT("/api/v1/comments/{id}", {
      ...path(input),
      body: { body: input.body },
      headers: { "Idempotency-Key": key },
    }),
};

export const deleteComment: Command<Target> = {
  kind: "comment.delete",
  describe: (replica, input) =>
    `delete your comment${onSubject(replica, input)}`,
  target: ({ commentId }) => `comment:${commentId}`,
  predict: () => unchanged,
  call: (api, input, key) =>
    api.DELETE("/api/v1/comments/{id}", {
      ...path(input),
      headers: { "Idempotency-Key": key },
    }),
};

export const likeComment: Command<Target> = {
  kind: "comment.like",
  describe: (replica, input) => `like a comment${onSubject(replica, input)}`,
  target: ({ commentId }) => `like:${commentId}`,
  predict: () => unchanged,
  call: (api, input, key) =>
    api.PUT("/api/v1/comments/{id}/like", {
      ...path(input),
      headers: { "Idempotency-Key": key },
    }),
};

export const unlikeComment: Command<Target> = {
  kind: "comment.unlike",
  describe: (replica, input) =>
    `remove your like from a comment${onSubject(replica, input)}`,
  target: ({ commentId }) => `like:${commentId}`,
  predict: () => unchanged,
  call: (api, input, key) =>
    api.DELETE("/api/v1/comments/{id}/like", {
      ...path(input),
      headers: { "Idempotency-Key": key },
    }),
};
