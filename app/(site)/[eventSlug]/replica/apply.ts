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
    case "event.changed":
      next.event = message.event;
      return next;
    case "day.created":
    case "day.changed": {
      const { day } = message;
      const others = next.days.filter((d) => d.id !== day.id);
      next.days = [...others, day].sort((a, b) =>
        a.start < b.start ? -1 : a.start > b.start ? 1 : 0
      );
      return next;
    }
    case "location.changed": {
      const { location } = message;
      next.locations = [
        ...next.locations.filter((l) => l.id !== location.id),
        location,
      ].sort(
        (a, b) =>
          a.sortIndex - b.sortIndex || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
      );
      return next;
    }
    case "location.removed":
      next.locations = next.locations.filter(
        (l) => l.id !== message.locationId
      );
      return next;
    case "unavailability.added": {
      const { period } = message;
      next.unavailability = [
        ...next.unavailability.filter((p) => p.id !== period.id),
        period,
      ].sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
      return next;
    }
    case "unavailability.removed":
      next.unavailability = next.unavailability.filter(
        (p) => p.id !== message.periodId
      );
      return next;
    case "day.deleted":
      next.days = next.days.filter((d) => d.id !== message.dayId);
      return next;
    case "session.created":
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
    case "session.attendanceChanged": {
      if (message.sessionId in next.counts)
        next.counts = { ...next.counts, [message.sessionId]: message.numRsvps };
      return next;
    }
    case "rsvp.added": {
      const { me } = next;
      if (
        me?.guestId === message.rsvp.guestId &&
        !me.rsvps.some((r) => r.id === message.rsvp.id)
      )
        next.me = { ...me, rsvps: [...me.rsvps, message.rsvp] };
      return next;
    }
    case "rsvp.removed": {
      const { me } = next;
      if (me?.guestId === message.guestId)
        next.me = {
          ...me,
          rsvps: me.rsvps.filter((r) => r.sessionId !== message.sessionId),
        };
      return next;
    }
    default:
      return next;
  }
}
