import { createRoute, z } from "@hono/zod-openapi";
import { snapshotSchema } from "@schellingboard/contracts/snapshot";
import { problem, problemDefault } from "@/server/http/problem";
import { feedMessageSchema } from "@schellingboard/contracts/feed";
import { json, type App } from "@/server/http/route-parts";
import { actingGuest } from "@/server/kernel/acting-guest";
import { invalid, notFound, ok, type Result } from "@/server/kernel/result";
import type { UnitOfWork } from "@/server/kernel/unit-of-work";
import { eventScheduleBySlug } from "@/server/modules/events/module";
import {
  nowWithOffset,
  parseTimeOffset,
  readTimeOffsetCookie,
} from "@/utils/dev-clock";
import { openFeed } from "./feed";
import { snapshotFor } from "./snapshot";

const HEARTBEAT_MS = 25_000;
// A connection that never ends could outlive a credential change; the client
// reconnects with Last-Event-ID, so the cut is invisible.
const MAX_AGE_MS = 10 * 60_000;
// Browsers wait 3-5 s by default before reconnecting an ended stream, longer
// than the client's grace before it shows "Reconnecting…".
export const RECONNECT_DELAY_MS = 1000;

const getSnapshot = createRoute({
  method: "get",
  path: "/events/{slug}/snapshot",
  tags: ["events"],
  description:
    "The event's schedule, normalized, and `seq`, the last change it includes. `me` holds the RSVPs, meetings and free slots of the guest the `guest` cookie names; it is null without that cookie, or for a protected guest whose cookie is not verified.",
  request: { params: z.object({ slug: z.string().min(1) }) },
  responses: {
    200: json(snapshotSchema, "The snapshot"),
    ...problemDefault,
  },
});

const getFeed = createRoute({
  method: "get",
  path: "/events/{slug}/feed",
  tags: ["events"],
  description:
    "A `text/event-stream` of the event's changes after `since` (the snapshot's `seq`), filtered to what the `guest` cookie may see. Each message has `id` = its `seq`, `event` = its type and the message as JSON `data`; a browser's reconnect sends `Last-Event-ID`, which wins over `since`. An `event: reset` message, after which the stream ends, means the resume point cannot be served: load the snapshot again. An `event: ping` every 25 seconds, its data the server's `now`, keeps proxies from closing it and lets a client notice a dead connection; it ends after 10 minutes. The first message carries `retry: 1000`, so a client reconnects after one second.",
  request: {
    params: z.object({ slug: z.string().min(1) }),
    query: z.object({ since: z.string().optional() }),
  },
  responses: {
    200: {
      description:
        "Changes as server-sent events; each `data` is a FeedMessage",
      content: { "text/event-stream": { schema: feedMessageSchema } },
    },
    ...problemDefault,
  },
});

const SEQ = /^\d+$/;

function resumePoint(
  lastEventId: string | undefined,
  since: string | undefined
): Result<number> {
  const raw = lastEventId ?? since;
  if (raw === undefined)
    return invalid("feed.sinceMissing", "Send ?since= or Last-Event-ID");
  if (!SEQ.test(raw)) return invalid("feed.sinceInvalid", "Not a seq");
  return ok(Number(raw));
}

// A client that reads slower than the feed writes is cut off; its browser
// reconnects with Last-Event-ID and replays from the table.
const MAX_UNSENT_BYTES = 1_000_000;

const encoder = new TextEncoder();

export function addFeedRoutes(app: App, deps: { uow: UnitOfWork }): void {
  app.openapi(getSnapshot, async (c) => {
    const result = await snapshotFor(
      deps.uow,
      c.var.actor,
      c.req.valid("param").slug,
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(getFeed, async (c) => {
    const { slug } = c.req.valid("param");
    const resume = resumePoint(
      c.req.header("last-event-id"),
      c.req.valid("query").since
    );
    if (!resume.ok) return problem(resume.error);
    const target = await deps.uow.read(async (q) => {
      const schedule = await eventScheduleBySlug(q, slug);
      if (!schedule) return undefined;
      const guest = await actingGuest(c.var.actor, q.guests);
      return {
        eventId: schedule.event.id,
        viewer: {
          guestId: guest.ok ? guest.value : null,
          admin: c.var.actor.admin,
        },
      };
    });
    if (!target)
      return problem(notFound("event.notFound", "Event not found").error);

    const offset = parseTimeOffset(readTimeOffsetCookie(c.req.raw));
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    let finished = false;
    let stop = () => {};
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    function finish() {
      if (finished) return;
      finished = true;
      clearInterval(heartbeat);
      clearTimeout(deadline);
      stop();
      try {
        controller.close();
      } catch {
        // already cancelled
      }
    }
    let preamble = `retry: ${RECONNECT_DELAY_MS}\n`;
    const write = (text: string): boolean => {
      if (finished) return false;
      controller.enqueue(encoder.encode(preamble + text));
      preamble = "";
      if ((controller.desiredSize ?? 0) >= 0) return true;
      finish();
      return false;
    };
    const body = new ReadableStream<Uint8Array>(
      { start: (ctrl) => void (controller = ctrl), cancel: finish },
      new ByteLengthQueuingStrategy({ highWaterMark: MAX_UNSENT_BYTES })
    );

    const { signal } = c.req.raw;
    if (signal.aborted) finish();
    else signal.addEventListener("abort", finish);

    const feed = await openFeed(
      deps.uow,
      { ...target, since: resume.value },
      (m) =>
        write(`id: ${m.seq}\nevent: ${m.type}\ndata: ${JSON.stringify(m)}\n\n`),
      finish
    );
    if (feed.kind === "reset") {
      write("event: reset\ndata: {}\n\n");
      finish();
    } else if (finished) {
      feed.close();
    } else {
      stop = feed.close;
      heartbeat = setInterval(() => {
        const now = nowWithOffset(offset).toISOString();
        write(`event: ping\ndata: ${JSON.stringify({ now })}\n\n`);
      }, HEARTBEAT_MS);
      deadline = setTimeout(finish, MAX_AGE_MS);
    }
    return c.body(body, 200, {
      "content-type": "text/event-stream",
      "cache-control": "no-store, no-transform",
      "x-accel-buffering": "no",
    });
  });
}
