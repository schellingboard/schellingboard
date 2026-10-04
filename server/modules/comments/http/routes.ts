import { createRoute } from "@hono/zod-openapi";
import {
  commentCreateSchema,
  commentEditSchema,
  commentListSchema,
  commentViewSchema,
} from "@schellingboard/contracts/comment";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import {
  body,
  idParam,
  json,
  noContent,
  type App,
} from "@/server/http/route-parts";
import type { CommentUseCases } from "../application/use-cases";
import type { CommentSubjectKind } from "../ports";
import { toCommentView } from "./view";

const SUBJECTS = [
  ["proposal", "/proposals/{id}/comments"],
  ["session", "/sessions/{id}/comments"],
  ["profile", "/guests/{id}/comments"],
] as const satisfies [CommentSubjectKind, string][];

function subjectRoutes(kind: CommentSubjectKind, path: string) {
  const subject = kind === "profile" ? "guest's profile" : kind;
  return {
    list: createRoute({
      method: "get",
      path,
      tags: ["comments"],
      request: { params: idParam },
      responses: {
        200: json(commentListSchema, `The ${subject}'s comments`),
        ...problemDefault,
      },
    }),
    create: createRoute({
      method: "post",
      path,
      tags: ["comments"],
      description: `Comments on a ${subject} as the acting guest; its hosts or owner and earlier commenters are notified.`,
      request: {
        headers: idempotencyHeaders,
        params: idParam,
        body: body(commentCreateSchema),
      },
      responses: {
        201: json(commentViewSchema, "The new comment"),
        ...problemDefault,
      },
    }),
  };
}

const editComment = createRoute({
  method: "put",
  path: "/comments/{id}",
  tags: ["comments"],
  description: "Replaces the body of the acting guest's own comment.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(commentEditSchema),
  },
  responses: {
    200: json(commentViewSchema, "The edited comment"),
    ...problemDefault,
  },
});

const deleteComment = createRoute({
  method: "delete",
  path: "/comments/{id}",
  tags: ["comments"],
  description:
    "Deletes the acting guest's own comment; one with replies stays as a placeholder.",
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("Deleted"), ...problemDefault },
});

const likeComment = createRoute({
  method: "put",
  path: "/comments/{id}/like",
  tags: ["comments"],
  description: "Likes a comment as the acting guest.",
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("Liked"), ...problemDefault },
});

const unlikeComment = createRoute({
  method: "delete",
  path: "/comments/{id}/like",
  tags: ["comments"],
  description: "Takes back the acting guest's like.",
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("No longer liked"), ...problemDefault },
});

export function addCommentRoutes(app: App, comments: () => CommentUseCases) {
  for (const [kind, path] of SUBJECTS) {
    const routes = subjectRoutes(kind, path);

    app.openapi(routes.list, async (c) => {
      const result = await comments().listComments(c.var.actor, {
        kind,
        id: c.req.valid("param").id,
      });
      if (!result.ok) return problem(result.error);
      return c.json({ comments: result.value.map(toCommentView) }, 200);
    });

    app.openapi(routes.create, async (c) => {
      const result = await comments().createComment(
        c.var.actor,
        {
          ...c.req.valid("json"),
          subject: { kind, id: c.req.valid("param").id },
        },
        c.var.now
      );
      if (!result.ok) return problem(result.error);
      return c.json(toCommentView(result.value), 201);
    });
  }

  app.openapi(editComment, async (c) => {
    const result = await comments().editComment(
      c.var.actor,
      { ...c.req.valid("json"), commentId: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(toCommentView(result.value), 200);
  });

  app.openapi(deleteComment, async (c) => {
    const result = await comments().deleteComment(c.var.actor, {
      commentId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  for (const [route, liked] of [
    [likeComment, true],
    [unlikeComment, false],
  ] as const) {
    app.openapi(route, async (c) => {
      const result = await comments().setCommentLike(
        c.var.actor,
        { commentId: c.req.valid("param").id, liked },
        c.var.now
      );
      if (!result.ok) return problem(result.error);
      return c.body(null, 204);
    });
  }
}
