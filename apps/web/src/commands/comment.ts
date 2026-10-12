import {
  commentCreateSchema,
  type commentViewSchema,
} from "@schellingboard/contracts/comment";
import type { Command } from "./runner";

export type CommentView = (typeof commentViewSchema)["_output"];

export type CommentSubject = {
  kind: "session" | "proposal" | "profile";
  id: string;
};

type Input = { subject: CommentSubject; parentId?: string; body: string };

/** Comments are not in the replica: the caller adds the created comment to its query. */
export const createComment: Command<Input, CommentView> = {
  kind: "comment.create",
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
