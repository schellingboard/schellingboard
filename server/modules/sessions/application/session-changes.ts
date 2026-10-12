import { changes, type ChangeContext } from "@schellingboard/domain/change";
import type {
  Rsvp,
  Session,
  SessionCreateInput,
} from "@schellingboard/domain/session";
import { recordingShownGuests } from "@/server/kernel/shown-guests";
import type { Tx } from "@/server/kernel/unit-of-work";
import type { SessionDeps } from "../ports";

type SessionPatch = Parameters<SessionDeps["repos"]["sessions"]["update"]>[1];

export async function addSession(
  tx: Tx,
  input: SessionCreateInput,
  by: ChangeContext
): Promise<Session> {
  // A host who is not a member is shown by hosting alone.
  return recordingShownGuests(
    tx,
    [input.eventId],
    async () => {
      const created = await tx.sessions.create(input);
      tx.record(changes.sessionCreated(created, by));
      return created;
    },
    by,
    input.hostIds
  );
}

/** Updates the session and records the change, if there is one. */
export async function changeSession(
  tx: Tx,
  id: string,
  patch: SessionPatch,
  by: ChangeContext
): Promise<Session | undefined> {
  const before = await tx.sessions.findById(id);
  if (!before) return undefined;
  return recordingShownGuests(
    tx,
    [before.eventId],
    async () => {
      const after = await tx.sessions.update(id, patch);
      if (after && after.version !== before.version)
        tx.record(changes.sessionChanged(before, after, by));
      return after;
    },
    by,
    [...before.hosts.map((h) => h.id), ...(patch.hostIds ?? [])]
  );
}

export async function removeSession(
  tx: Tx,
  id: string,
  by: ChangeContext
): Promise<void> {
  const session = await tx.sessions.findById(id);
  if (!session) return;
  const rsvps = await tx.rsvps.listBySession(id);
  await recordingShownGuests(
    tx,
    [session.eventId],
    async () => {
      await tx.sessions.delete(id);
      for (const rsvp of rsvps)
        tx.record(
          changes.rsvpRemoved(rsvp.id, id, rsvp.guestId, session.eventId, by)
        );
      tx.record(
        changes.sessionDeleted(
          session,
          rsvps.map((r) => r.guestId),
          by
        )
      );
    },
    by,
    session.hosts.map((h) => h.id)
  );
}

/** Records an RSVP the caller has just stored, and the count it brought. */
export async function recordRsvpAdded(
  tx: Tx,
  rsvp: Rsvp,
  by: ChangeContext
): Promise<void> {
  const session = await tx.sessions.findById(rsvp.sessionId);
  if (!session) throw new Error(`RSVP ${rsvp.id} has no session`);
  tx.record(changes.rsvpAdded(rsvp, session.eventId, by));
  tx.record(changes.sessionAttendanceChanged(session, session.numRsvps, by));
}

export async function findRsvp(
  tx: Tx,
  sessionId: string,
  guestId: string
): Promise<Rsvp | undefined> {
  return (await tx.rsvps.listBySession(sessionId)).find(
    (r) => r.guestId === guestId
  );
}

export async function removeRsvp(
  tx: Tx,
  sessionId: string,
  guestId: string,
  by: ChangeContext
): Promise<void> {
  const rsvp = await findRsvp(tx, sessionId, guestId);
  if (!rsvp) return;
  await tx.rsvps.deleteBySessionAndGuest(sessionId, guestId);
  const session = await tx.sessions.findById(sessionId);
  if (!session) throw new Error(`RSVP ${rsvp.id} has no session`);
  tx.record(
    changes.rsvpRemoved(rsvp.id, sessionId, guestId, session.eventId, by)
  );
  tx.record(changes.sessionAttendanceChanged(session, session.numRsvps, by));
}
