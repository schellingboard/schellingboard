import { changes, type ChangeContext } from "@schellingboard/domain/change";
import type { Session } from "@schellingboard/domain/session";
import type { Tx } from "./unit-of-work";

// Rooms and hosts are compared too: their link rows cascade-delete without a
// version bump.
const roomsOf = (s: Session) => s.locations.map((l) => l.id).join();
const hostsOf = (s: Session) => s.hosts.map((h) => h.id).join();

/**
 * Runs `work`, which removes or edits `sessions` as a side effect (deleting a
 * day, location, event or guest), and records a change for each one it touched (ADR 0014
 * section 9). The changes are marked `cascade`, so no one is emailed for them
 * unless `tellAttendees` asks for the RSVPed guests to be.
 */
export async function recordingSessionCascade<T>(
  tx: Tx,
  sessions: Session[],
  work: () => Promise<T>,
  by: ChangeContext,
  { tellAttendees = false } = {}
): Promise<T> {
  const cascade = {
    ...by,
    cascade: true as const,
    ...(tellAttendees && { tellAttendees: true as const }),
  };
  const rsvps = await Promise.all(
    sessions.map((s) => tx.rsvps.listBySession(s.id))
  );
  const result = await work();
  for (const [i, before] of sessions.entries()) {
    const after = await tx.sessions.findById(before.id);
    if (!after) {
      for (const rsvp of rsvps[i])
        tx.record(
          changes.rsvpRemoved(
            rsvp.id,
            before.id,
            rsvp.guestId,
            before.eventId,
            cascade
          )
        );
      tx.record(
        changes.sessionDeleted(
          before,
          rsvps[i].map((r) => r.guestId),
          cascade
        )
      );
    } else if (
      after.version !== before.version ||
      roomsOf(after) !== roomsOf(before) ||
      hostsOf(after) !== hostsOf(before)
    ) {
      tx.record(changes.sessionChanged(before, after, cascade));
    }
    if (after && after.numRsvps !== before.numRsvps)
      tx.record(
        changes.sessionAttendanceChanged(after, after.numRsvps, cascade)
      );
  }
  return result;
}
