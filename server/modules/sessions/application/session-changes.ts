import { changes, type ChangeContext } from "@schellingboard/domain/change";
import type { Session } from "@schellingboard/domain/session";
import type { Tx } from "@/server/kernel/unit-of-work";
import type { SessionDeps } from "../ports";

type SessionPatch = Parameters<SessionDeps["repos"]["sessions"]["update"]>[1];

/** Updates the session and records the change, if there is one. */
export async function changeSession(
  tx: Tx,
  id: string,
  patch: SessionPatch,
  by: ChangeContext
): Promise<Session | undefined> {
  const before = await tx.sessions.findById(id);
  if (!before) return undefined;
  const after = await tx.sessions.update(id, patch);
  if (after && after.version !== before.version)
    tx.record(changes.sessionChanged(before, after, by));
  return after;
}

export async function removeSession(
  tx: Tx,
  id: string,
  by: ChangeContext
): Promise<void> {
  const session = await tx.sessions.findById(id);
  if (!session) return;
  const rsvps = await tx.rsvps.listBySession(id);
  await tx.sessions.delete(id);
  tx.record(
    changes.sessionDeleted(
      session,
      rsvps.map((r) => r.guestId),
      by
    )
  );
}
