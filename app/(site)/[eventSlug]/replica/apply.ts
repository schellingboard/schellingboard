import type { FeedMessage } from "@schellingboard/contracts/feed";
import type { Snapshot } from "@schellingboard/contracts/snapshot";

/**
 * The replica after `message` (ADR 0014). A message it already holds changes
 * nothing; one of a type this version does not know only moves `seq` past it.
 */
export function apply(replica: Snapshot, message: FeedMessage): Snapshot {
  if (message.seq <= replica.seq) return replica;
  const next = { ...replica, seq: message.seq };
  switch (message.type) {
    case "session.changed": {
      const { session } = message;
      const at = next.sessions.findIndex((s) => s.id === session.id);
      if (at === -1) {
        next.sessions = [...next.sessions, session];
        next.counts = { [session.id]: 0, ...next.counts };
      } else {
        next.sessions = next.sessions.map((s, i) => (i === at ? session : s));
      }
      return next;
    }
    case "session.deleted": {
      next.sessions = next.sessions.filter((s) => s.id !== message.sessionId);
      next.counts = Object.fromEntries(
        Object.entries(next.counts).filter(([id]) => id !== message.sessionId)
      );
      return next;
    }
    default:
      return next;
  }
}
