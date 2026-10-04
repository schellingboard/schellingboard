import { createRoute, z } from "@hono/zod-openapi";
import { voteCastSchema, voteListSchema } from "@schellingboard/contracts/vote";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import {
  body,
  idParam,
  json,
  noContent,
  type App,
} from "@/server/http/route-parts";
import type { ProposalUseCases } from "../application/use-cases";

const voteParams = z.object({
  id: z.string().min(1),
  guestId: z.string().min(1),
});

const listGuestVotes = createRoute({
  method: "get",
  path: "/guests/{id}/votes",
  tags: ["votes"],
  description: "A protected guest's votes need that guest's verified cookie.",
  request: { params: idParam, query: z.object({ eventId: z.string().min(1) }) },
  responses: {
    200: json(voteListSchema, "The guest's votes in the event"),
    ...problemDefault,
  },
});

const castVote = createRoute({
  method: "put",
  path: "/proposals/{id}/votes/{guestId}",
  tags: ["votes"],
  description:
    "Casts or replaces the named guest's vote during voting; a protected guest needs its verified cookie.",
  request: {
    headers: idempotencyHeaders,
    params: voteParams,
    body: body(voteCastSchema),
  },
  responses: { 204: noContent("Voted"), ...problemDefault },
});

const withdrawVote = createRoute({
  method: "delete",
  path: "/proposals/{id}/votes/{guestId}",
  tags: ["votes"],
  description: "Withdraws the named guest's vote during voting.",
  request: { headers: idempotencyHeaders, params: voteParams },
  responses: { 204: noContent("Withdrawn"), ...problemDefault },
});

export function addVoteRoutes(app: App, proposals: () => ProposalUseCases) {
  app.openapi(listGuestVotes, async (c) => {
    const result = await proposals().listGuestVotes(c.var.actor, {
      guestId: c.req.valid("param").id,
      event: { id: c.req.valid("query").eventId },
    });
    if (!result.ok) return problem(result.error);
    return c.json({ votes: result.value }, 200);
  });

  app.openapi(castVote, async (c) => {
    const { id, guestId } = c.req.valid("param");
    const result = await proposals().castVote(
      c.var.actor,
      { proposalId: id, guestId, choice: c.req.valid("json").choice },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(withdrawVote, async (c) => {
    const { id, guestId } = c.req.valid("param");
    const result = await proposals().withdrawVote(
      c.var.actor,
      { proposalId: id, guestId },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
