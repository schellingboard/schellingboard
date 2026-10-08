import { createRoute, z } from "@hono/zod-openapi";
import {
  adminProposalCreateSchema,
  adminProposalUpdateSchema,
  proposalCreateSchema,
  proposalListSchema,
  proposalUpdateSchema,
  proposalViewSchema,
} from "@schellingboard/contracts/proposal";
import { idempotencyHeaders } from "@/server/http/idempotency";
import {
  problem,
  problemDefault,
  versionConflictResponse,
} from "@/server/http/problem";
import {
  body,
  idParam,
  json,
  noContent,
  type App,
} from "@/server/http/route-parts";
import type { ProposalUseCases } from "../application/use-cases";
import { toProposalView } from "./view";

const getProposal = createRoute({
  method: "get",
  path: "/proposals/{id}",
  tags: ["proposals"],
  request: { params: idParam },
  responses: {
    200: json(proposalViewSchema, "The proposal"),
    ...problemDefault,
  },
});

const listProposals = createRoute({
  method: "get",
  path: "/proposals",
  tags: ["proposals"],
  request: { query: z.object({ eventId: z.string().min(1) }) },
  responses: {
    200: json(proposalListSchema, "The event's proposals"),
    ...problemDefault,
  },
});

const createProposal = createRoute({
  method: "post",
  path: "/proposals",
  tags: ["proposals"],
  description:
    "Proposes a session as the acting guest, until scheduling starts.",
  request: { headers: idempotencyHeaders, body: body(proposalCreateSchema) },
  responses: {
    201: json(proposalViewSchema, "The new proposal"),
    ...problemDefault,
  },
});

const updateProposal = createRoute({
  method: "put",
  path: "/proposals/{id}",
  tags: ["proposals"],
  description:
    "Replaces a proposal the acting guest hosts, or one nobody hosts.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(proposalUpdateSchema),
  },
  responses: {
    200: json(proposalViewSchema, "The updated proposal"),
    ...versionConflictResponse(proposalViewSchema),
    ...problemDefault,
  },
});

const joinProposal = createRoute({
  method: "post",
  path: "/proposals/{id}/hosts",
  tags: ["proposals"],
  description:
    "Adds the acting guest as a host of a proposal that wants one; its hosts are notified.",
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("Joined"), ...problemDefault },
});

const deleteProposal = createRoute({
  method: "delete",
  path: "/proposals/{id}",
  tags: ["proposals"],
  description:
    "Deletes a proposal the acting guest hosts, or one nobody hosts.",
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("Deleted"), ...problemDefault },
});

const adminCreateProposal = createRoute({
  method: "post",
  path: "/admin/proposals",
  tags: ["admin"],
  description:
    "Creates a proposal in any phase; its hosts are added to the event.",
  request: {
    headers: idempotencyHeaders,
    body: body(adminProposalCreateSchema),
  },
  responses: {
    201: json(proposalViewSchema, "The new proposal"),
    ...problemDefault,
  },
});

const adminUpdateProposal = createRoute({
  method: "put",
  path: "/admin/proposals/{id}",
  tags: ["admin"],
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(adminProposalUpdateSchema),
  },
  responses: {
    200: json(proposalViewSchema, "The updated proposal"),
    ...versionConflictResponse(proposalViewSchema),
    ...problemDefault,
  },
});

const adminDeleteProposal = createRoute({
  method: "delete",
  path: "/admin/proposals/{id}",
  tags: ["admin"],
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("Deleted"), ...problemDefault },
});

export function addProposalRoutes(app: App, proposals: () => ProposalUseCases) {
  app.openapi(getProposal, async (c) => {
    const result = await proposals().getProposal(
      c.var.actor,
      { proposalId: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(toProposalView(result.value), 200);
  });

  app.openapi(listProposals, async (c) => {
    const result = await proposals().listProposals(
      c.var.actor,
      c.req.valid("query"),
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json({ proposals: result.value.map(toProposalView) }, 200);
  });

  app.openapi(createProposal, async (c) => {
    const result = await proposals().createProposal(
      c.var.actor,
      c.req.valid("json"),
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(toProposalView(result.value), 201);
  });

  app.openapi(updateProposal, async (c) => {
    const result = await proposals().updateProposal(
      c.var.actor,
      { ...c.req.valid("json"), proposalId: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error, toProposalView);
    return c.json(toProposalView(result.value), 200);
  });

  app.openapi(joinProposal, async (c) => {
    const result = await proposals().joinProposal(
      c.var.actor,
      { proposalId: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(deleteProposal, async (c) => {
    const result = await proposals().deleteProposal(c.var.actor, {
      proposalId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(adminCreateProposal, async (c) => {
    const { eventId, ...input } = c.req.valid("json");
    const result = await proposals().adminCreateProposal(
      c.var.actor,
      { ...input, event: { id: eventId } },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(toProposalView(result.value), 201);
  });

  app.openapi(adminUpdateProposal, async (c) => {
    const result = await proposals().adminUpdateProposal(
      c.var.actor,
      { ...c.req.valid("json"), id: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error, toProposalView);
    return c.json(toProposalView(result.value), 200);
  });

  app.openapi(adminDeleteProposal, async (c) => {
    const result = await proposals().adminDeleteProposal(c.var.actor, {
      id: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
