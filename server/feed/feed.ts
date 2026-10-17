import type { FeedMessage } from "@schellingboard/contracts/feed";
import {
  reaches,
  type RecordedChange,
  type Viewer,
} from "@schellingboard/domain/change";
import { newestSeq } from "@/server/kernel/change-log";
import type { UnitOfWork } from "@/server/kernel/unit-of-work";
import { register } from "./hub";
import { project } from "./project";

const BATCH = 200;

export type FeedRequest = { eventId: string; viewer: Viewer; since: number };

export type OpenFeed =
  /** The resume point cannot be served: the client loads the snapshot again. */
  { kind: "reset" } | { kind: "open"; close: () => void };

/**
 * Sends `send` the event's changes after `since` that `viewer` may see: first
 * the logged ones, then live ones, with no change twice or out of order.
 */
export async function openFeed(
  uow: UnitOfWork,
  { eventId, viewer, since }: FeedRequest,
  send: (message: FeedMessage) => boolean | void,
  drop: () => void = () => {}
): Promise<OpenFeed> {
  let lastSeq = since;
  let buffer: RecordedChange[] | null = [];
  let stopped = false;

  function emit(change: RecordedChange): void {
    const message = project(change, viewer);
    if (message && send(message) === false) {
      stopped = true;
      unregister();
    }
  }

  function deliver(change: RecordedChange): void {
    if (change.seq <= lastSeq || stopped) return;
    lastSeq = change.seq;
    emit(change);
  }

  const unregister = register({
    eventId,
    viewer,
    drop,
    // Bounded in practice: a replay lasts a few reads.
    deliver: (change) => void (buffer ? buffer.push(change) : deliver(change)),
  });

  try {
    const servable = await uow.read(async (q) => {
      const [newest, pruned] = await Promise.all([
        newestSeq(q),
        q.changes.getPrunedThrough(),
      ]);
      return since >= pruned && since <= newest;
    });
    if (!servable) {
      unregister();
      return { kind: "reset" };
    }

    for (;;) {
      const batch = await uow.read((q) =>
        q.changes.listEventAfter(eventId, lastSeq, BATCH)
      );
      for (const change of batch) {
        lastSeq = change.seq;
        if (reaches(change.audience, viewer)) emit(change);
        if (stopped) break;
      }
      if (stopped || batch.length < BATCH) break;
    }

    // Pruning may have passed the resume point while we replayed.
    const prunedMeanwhile = await uow.read(
      async (q) => (await q.changes.getPrunedThrough()) > since
    );
    if (prunedMeanwhile) {
      unregister();
      return { kind: "reset" };
    }
  } catch (e) {
    unregister();
    throw e;
  }

  // No await from here: nothing can be published between the flush and live.
  const pending = buffer;
  buffer = null;
  for (const change of pending) deliver(change);
  return { kind: "open", close: unregister };
}
