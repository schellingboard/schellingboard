import { getRepositories } from "@/db/container";
import type { Actor, RecordedChange } from "@schellingboard/domain/change";
import {
  notifySessionChanged,
  notifySessionDeleted,
} from "@/utils/notifications";
import { PRUNE_CHANGES, SESSION_NOTIFICATIONS, type Job } from "./job";

const BATCH = 50;
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

// The cursor advances after each change, so a crash repeats that one change;
// a failed email is the deliveries job's to retry.
function reaction(
  name: string,
  handle: (change: RecordedChange) => Promise<void>
): Job {
  return {
    name,
    run: async () => {
      const { changes, jobs } = getRepositories();
      const batch = await changes.listAfter(await jobs.cursor(name), BATCH);
      for (const change of batch) {
        await handle(change);
        await jobs.setCursor(name, change.seq);
      }
      return batch.length;
    },
  };
}

function guestId(actor: Actor): string | null {
  return actor.type === "guest" ? actor.id : null;
}

export const sessionNotifications = reaction(
  SESSION_NOTIFICATIONS,
  async (change) => {
    const changedById = guestId(change.actor);
    // Dated by the clock of whoever made the change, so the dev fake clock
    // reaches the notice (ADR 0004).
    const now = change.occurredAt;
    if (change.type === "session.changed") {
      await notifySessionChanged({ ...change.payload, changedById, now });
    } else if (change.type === "session.deleted") {
      await notifySessionDeleted({ ...change.payload, changedById, now });
    }
  }
);

export const REACTIONS = [sessionNotifications];

// Long enough to answer "who moved this session", short enough not to keep
// guests' names around.
export const pruneChanges: Job = {
  name: PRUNE_CHANGES,
  run: async (now) => {
    const { changes, jobs } = getRepositories();
    const handled = Math.min(
      ...(await Promise.all(REACTIONS.map((r) => jobs.cursor(r.name))))
    );
    await changes.deleteUpTo(handled, new Date(now.getTime() - RETENTION_MS));
    return 0;
  },
};
