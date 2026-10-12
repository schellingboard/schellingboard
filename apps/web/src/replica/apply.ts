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
    case "guest.changed": {
      const { guest } = message;
      next.guests = byNameThenId([
        ...next.guests.filter((g) => g.id !== guest.id),
        guest,
      ]);
      const partner = withoutMember(guest);
      if (next.me?.meetingGuests.some((g) => g.id === guest.id))
        next.me = {
          ...next.me,
          meetingGuests: next.me.meetingGuests.map((g) =>
            g.id === guest.id ? partner : g
          ),
        };
      return next;
    }
    case "guest.removed":
      next.guests = next.guests.filter((g) => g.id !== message.guestId);
      return next;
    case "meetingPoint.changed": {
      const { meetingPoint } = message;
      next.meetingPoints = [
        ...next.meetingPoints.filter((p) => p.id !== meetingPoint.id),
        meetingPoint,
      ].sort(
        (a, b) =>
          a.sortIndex - b.sortIndex || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
      );
      return next;
    }
    case "meetingPoint.removed":
      next.meetingPoints = next.meetingPoints.filter(
        (p) => p.id !== message.meetingPointId
      );
      return next;
    case "meeting.changed": {
      const { me } = next;
      const { meeting } = message;
      if (!me) return next;
      const otherId =
        meeting.requesterId === me.guestId
          ? meeting.recipientId
          : meeting.requesterId;
      const partner = next.guests.find((g) => g.id === otherId);
      next.me = {
        ...me,
        meetings: [
          ...me.meetings.filter((m) => m.id !== meeting.id),
          meeting,
        ].sort(
          (a, b) =>
            a.slotStart.localeCompare(b.slotStart) || a.id.localeCompare(b.id)
        ),
        meetingGuests:
          partner && !me.meetingGuests.some((g) => g.id === otherId)
            ? byNameThenId([...me.meetingGuests, withoutMember(partner)])
            : me.meetingGuests,
      };
      return next;
    }
    case "meeting.deleted": {
      const { me } = next;
      if (!me) return next;
      const meetings = me.meetings.filter((m) => m.id !== message.meetingId);
      const partners = new Set(
        meetings.flatMap((m) => [m.requesterId, m.recipientId])
      );
      next.me = {
        ...me,
        meetings,
        meetingGuests: me.meetingGuests.filter((g) => partners.has(g.id)),
      };
      return next;
    }
    case "availability.changed":
      if (next.me) next.me = { ...next.me, availability: message.slotStarts };
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

function withoutMember(guest: Snapshot["guests"][number]) {
  return {
    id: guest.id,
    name: guest.name,
    avatarUrl: guest.avatarUrl,
    aboutMe: guest.aboutMe,
    authProtected: guest.authProtected,
    profileVersion: guest.profileVersion,
  };
}

function byNameThenId<T extends { id: string; name: string }>(list: T[]): T[] {
  return [...list].sort((a, b) =>
    a.name === b.name ? (a.id < b.id ? -1 : 1) : a.name < b.name ? -1 : 1
  );
}
