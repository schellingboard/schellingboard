import { changes } from "@schellingboard/domain/change";
import type { SessionMark } from "@schellingboard/domain/session";
import { actingAsNamedGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { forbidden, notFound, ok, type Result } from "@/server/kernel/result";
import type { Tx } from "@/server/kernel/unit-of-work";
import type { SessionDeps } from "../ports";

export type MarkInput = Pick<SessionMark, "sessionId" | "guestId">;

async function checkMark(
  tx: Tx,
  actor: Actor,
  { sessionId, guestId }: MarkInput
): Promise<Result<{ eventId: string }>> {
  const acting = await actingAsNamedGuest(actor, guestId, tx.guests);
  if (!acting.ok) return acting;
  const session = await tx.sessions.findById(sessionId);
  if (!session) return notFound("session.notFound", "Session not found");
  const members = await tx.guests.listByEvent(session.eventId);
  if (!members.some((g) => g.id === guestId))
    return forbidden("guest.notInEvent", "Guest is not part of this event");
  return ok({ eventId: session.eventId });
}

export const setSessionMark =
  ({ uow }: SessionDeps) =>
  async (actor: Actor, input: SessionMark, now: Date): Promise<Result<void>> =>
    uow.run(async (tx) => {
      const checked = await checkMark(tx, actor, input);
      if (!checked.ok) return checked;
      await tx.sessionMarks.upsert(input, now);
      tx.record(
        changes.markSet(input, checked.value.eventId, {
          actor: { type: "guest", id: input.guestId },
          at: now,
        })
      );
      return ok(undefined);
    });

export const clearSessionMark =
  ({ uow }: SessionDeps) =>
  async (actor: Actor, input: MarkInput, now: Date): Promise<Result<void>> =>
    uow.run(async (tx) => {
      const checked = await checkMark(tx, actor, input);
      if (!checked.ok) return checked;
      const { sessionId, guestId } = input;
      if (await tx.sessionMarks.delete(sessionId, guestId))
        tx.record(
          changes.markCleared(sessionId, guestId, checked.value.eventId, {
            actor: { type: "guest", id: guestId },
            at: now,
          })
        );
      return ok(undefined);
    });
