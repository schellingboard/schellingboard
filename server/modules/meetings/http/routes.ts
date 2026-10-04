import { createRoute, z } from "@hono/zod-openapi";
import {
  meetingAvailabilitySchema,
  meetingCancelBodySchema,
  meetingCandidatesQuerySchema,
  meetingCandidatesSchema,
  meetingRequestSchema,
  meetingSchema,
  myMeetingsSchema,
} from "@schellingboard/contracts/meeting";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import {
  body,
  idParam,
  json,
  noContent,
  type App,
} from "@/server/http/route-parts";
import type { MeetingUseCases } from "../application/use-cases";
import { toMeetingView } from "./view";

const listMyMeetings = createRoute({
  method: "get",
  path: "/meetings",
  tags: ["meetings"],
  description:
    "The acting guest's own 1-on-1s at an event, and the slots they declared themselves free.",
  request: { query: z.object({ eventId: z.string().min(1) }) },
  responses: {
    200: json(myMeetingsSchema, "The caller's 1-on-1s and availability"),
    ...problemDefault,
  },
});

const listCandidates = createRoute({
  method: "get",
  path: "/meeting-candidates",
  tags: ["meetings"],
  description:
    "Who the acting guest could ask for a 1-on-1 starting at a slot, for slotCount consecutive slots.",
  request: { query: meetingCandidatesQuerySchema },
  responses: {
    200: json(meetingCandidatesSchema, "The slot and who is free in it"),
    ...problemDefault,
  },
});

const requestMeeting = createRoute({
  method: "post",
  path: "/meetings",
  tags: ["meetings"],
  description:
    "Asks another attendee for a 1-on-1 as the acting guest; the recipient is notified.",
  request: { headers: idempotencyHeaders, body: body(meetingRequestSchema) },
  responses: {
    201: json(meetingSchema, "The pending request"),
    ...problemDefault,
  },
});

const answerRoute = (response: "accept" | "decline") =>
  createRoute({
    method: "post",
    path: `/meetings/{id}/${response}`,
    tags: ["meetings"],
    description: `The person asked ${response}s a pending request; the requester is notified.`,
    request: { headers: idempotencyHeaders, params: idParam },
    responses: {
      200: json(meetingSchema, "The answered 1-on-1"),
      ...problemDefault,
    },
  });

const cancelMeeting = createRoute({
  method: "post",
  path: "/meetings/{id}/cancel",
  tags: ["meetings"],
  description:
    "Calls a 1-on-1 off: the requester at any time before its slot, the recipient once agreed. The other party is notified.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: { ...body(meetingCancelBodySchema), required: false },
  },
  responses: {
    200: json(meetingSchema, "The canceled 1-on-1"),
    ...problemDefault,
  },
});

const saveAvailability = createRoute({
  method: "put",
  path: "/meeting-availability",
  tags: ["meetings"],
  description:
    "Replaces the slots the acting guest declares themselves free for 1-on-1s at an event.",
  request: {
    headers: idempotencyHeaders,
    body: body(meetingAvailabilitySchema),
  },
  responses: { 204: noContent("Saved"), ...problemDefault },
});

export function addMeetingRoutes(app: App, meetings: () => MeetingUseCases) {
  app.openapi(listMyMeetings, async (c) => {
    const result = await meetings().listMyMeetings(
      c.var.actor,
      c.req.valid("query"),
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(listCandidates, async (c) => {
    const result = await meetings().listMeetingCandidates(
      c.var.actor,
      c.req.valid("query"),
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(requestMeeting, async (c) => {
    const result = await meetings().requestMeeting(
      c.var.actor,
      c.req.valid("json"),
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(toMeetingView(result.value), 201);
  });

  for (const response of ["accept", "decline"] as const) {
    app.openapi(answerRoute(response), async (c) => {
      const result = await meetings().respondToMeeting(
        c.var.actor,
        { meetingId: c.req.valid("param").id, response },
        c.var.now
      );
      if (!result.ok) return problem(result.error);
      return c.json(toMeetingView(result.value.meeting), 200);
    });
  }

  app.openapi(cancelMeeting, async (c) => {
    const result = await meetings().cancelMeeting(
      c.var.actor,
      { ...c.req.valid("json"), meetingId: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(toMeetingView(result.value.meeting), 200);
  });

  app.openapi(saveAvailability, async (c) => {
    const result = await meetings().saveMeetingAvailability(
      c.var.actor,
      c.req.valid("json"),
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
