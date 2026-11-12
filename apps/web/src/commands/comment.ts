import { select } from "@lingui/core/macro";
import {
  commentCreateSchema,
  commentEditSchema,
  type commentViewSchema,
} from "@schellingboard/contracts/comment";
import type { Snapshot } from "@schellingboard/contracts/snapshot";

import type { Described } from "./failure-message";
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
  describe: (replica, { subject }): Described => {
    const { where, place, name } = whereOf(replica, { subject });
    return {
      failed: select(where, {
        place: `Could not post your comment on ${place}.`,
        profile: `Could not post your comment on ${name}’s profile.`,
        unnamed: `Could not post your comment on a profile.`,
        other: `Could not post your comment.`,
      }),
      unsure: select(where, {
        place: `Your request to post your comment on ${place} might not have been saved.`,
        profile: `Your request to post your comment on ${name}’s profile might not have been saved.`,
        unnamed: `Your request to post your comment on a profile might not have been saved.`,
        other: `Your request to post your comment might not have been saved.`,
      }),
    };
  },
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

const whereOf = (replica: Snapshot, { subject }: Pick<Target, "subject">) => {
  if (subject.kind === "profile")
    return subject.name
      ? { where: "profile", place: "", name: subject.name }
      : { where: "unnamed", place: "", name: "" };
  const place =
    subject.kind === "session"
      ? describeSessionIn(replica, subject.id)
      : describeProposalIn(replica, subject.id);
  return place
    ? { where: "place", place, name: "" }
    : { where: "other", place: "", name: "" };
};
const path = ({ commentId }: Target) => ({
  params: { path: { id: commentId } },
});
const unchanged = { project: (replica: Snapshot) => replica };

export const editComment: Command<Target & { body: string }, CommentView> = {
  kind: "comment.edit",
  describe: (replica, input): Described => {
    const { where, place, name } = whereOf(replica, input);
    return {
      failed: select(where, {
        place: `Could not save your edit to a comment on ${place}.`,
        profile: `Could not save your edit to a comment on ${name}’s profile.`,
        unnamed: `Could not save your edit to a comment on a profile.`,
        other: `Could not save your edit to a comment.`,
      }),
      unsure: select(where, {
        place: `Your request to save your edit to a comment on ${place} might not have been saved.`,
        profile: `Your request to save your edit to a comment on ${name}’s profile might not have been saved.`,
        unnamed: `Your request to save your edit to a comment on a profile might not have been saved.`,
        other: `Your request to save your edit to a comment might not have been saved.`,
      }),
    };
  },
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
  describe: (replica, input): Described => {
    const { where, place, name } = whereOf(replica, input);
    return {
      failed: select(where, {
        place: `Could not delete your comment on ${place}.`,
        profile: `Could not delete your comment on ${name}’s profile.`,
        unnamed: `Could not delete your comment on a profile.`,
        other: `Could not delete your comment.`,
      }),
      unsure: select(where, {
        place: `Your request to delete your comment on ${place} might not have been saved.`,
        profile: `Your request to delete your comment on ${name}’s profile might not have been saved.`,
        unnamed: `Your request to delete your comment on a profile might not have been saved.`,
        other: `Your request to delete your comment might not have been saved.`,
      }),
    };
  },
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
  describe: (replica, input): Described => {
    const { where, place, name } = whereOf(replica, input);
    return {
      failed: select(where, {
        place: `Could not like a comment on ${place}.`,
        profile: `Could not like a comment on ${name}’s profile.`,
        unnamed: `Could not like a comment on a profile.`,
        other: `Could not like a comment.`,
      }),
      unsure: select(where, {
        place: `Your request to like a comment on ${place} might not have been saved.`,
        profile: `Your request to like a comment on ${name}’s profile might not have been saved.`,
        unnamed: `Your request to like a comment on a profile might not have been saved.`,
        other: `Your request to like a comment might not have been saved.`,
      }),
    };
  },
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
  describe: (replica, input): Described => {
    const { where, place, name } = whereOf(replica, input);
    return {
      failed: select(where, {
        place: `Could not remove your like from a comment on ${place}.`,
        profile: `Could not remove your like from a comment on ${name}’s profile.`,
        unnamed: `Could not remove your like from a comment on a profile.`,
        other: `Could not remove your like from a comment.`,
      }),
      unsure: select(where, {
        place: `Your request to remove your like from a comment on ${place} might not have been saved.`,
        profile: `Your request to remove your like from a comment on ${name}’s profile might not have been saved.`,
        unnamed: `Your request to remove your like from a comment on a profile might not have been saved.`,
        other: `Your request to remove your like from a comment might not have been saved.`,
      }),
    };
  },
  target: ({ commentId }) => `like:${commentId}`,
  predict: () => unchanged,
  call: (api, input, key) =>
    api.DELETE("/api/v1/comments/{id}/like", {
      ...path(input),
      headers: { "Idempotency-Key": key },
    }),
};
