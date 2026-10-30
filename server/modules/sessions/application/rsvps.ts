import { byAdmin } from "@/server/kernel/change-context";
import type { ChangeContext } from "@schellingboard/domain/change";
import {
  rsvpRefusal,
  type RsvpRefusal,
} from "@schellingboard/domain/rsvp-rule";
import type { Event } from "@schellingboard/domain/event";
import type { Rsvp, Session } from "@schellingboard/domain/session";
import { actingAsNamedGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { recordingShownGuests } from "@/server/kernel/shown-guests";
import {
  conflict,
  forbidden,
  notFound,
  ok,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { Tx } from "@/server/kernel/unit-of-work";
import type { SessionDeps } from "../ports";
import { findRsvp, recordRsvpAdded, removeRsvp } from "./session-changes";

export interface RsvpInput {
  sessionId: string;
  guestId: string;
}

const sessionNotFound = () => notFound("session.notFound", "Session not found");

const REFUSALS: Record<RsvpRefusal, () => Failure> = {
  "guest.notInEvent": () =>
    forbidden("guest.notInEvent", "Guest is not part of this event"),
  "event.notSchedulingPhase": () =>
    forbidden(
      "event.notSchedulingPhase",
      "RSVPs can only be changed during the scheduling phase"
    ),
  "rsvp.ownSession": () =>
    forbidden("rsvp.ownSession", "Hosts cannot RSVP to their own session"),
  "session.full": () => conflict("session.full", "This session is full"),
};

async function checkRsvp(
  repos: Tx,
  actor: Actor,
  { sessionId, guestId }: RsvpInput,
  intent: "add" | "withdraw",
  now: Date
): Promise<
  Result<{
    session: Session;
    event: Event | undefined;
    existing: Rsvp | undefined;
  }>
> {
  const acting = await actingAsNamedGuest(actor, guestId, repos.guests);
  if (!acting.ok) return acting;
  const session = await repos.sessions.findById(sessionId);
  if (!session) return sessionNotFound();
  const event = await repos.events.findById(session.eventId);
  const eventGuests = event ? await repos.guests.listByEvent(event.id) : [];
  const existing =
    intent === "add" ? await findRsvp(repos, sessionId, guestId) : undefined;
  const refusal = rsvpRefusal({
    intent,
    event,
    now,
    guestId,
    guestInEvent: eventGuests.some((g) => g.id === guestId),
    session,
    alreadyRsvped: !!existing,
  });
  if (refusal) return REFUSALS[refusal]();
  return ok({ session, event, existing });
}

export const rsvp =
  ({ uow }: SessionDeps) =>
  async (actor: Actor, input: RsvpInput, now: Date): Promise<Result<Rsvp>> =>
    uow.run(async (tx) => {
      const checked = await checkRsvp(tx, actor, input, "add", now);
      if (!checked.ok) return checked;
      const { session, event, existing } = checked.value;
      if (existing) return ok(existing);

      const added = await addRsvp(
        tx,
        input,
        session,
        event?.rsvpCapacityHardLimit ?? false
      );
      if (added.ok)
        await recordRsvpAdded(tx, added.value, byGuest(input.guestId, now));
      return added;
    });

const byGuest = (id: string, at: Date): ChangeContext => ({
  actor: { type: "guest", id },
  at,
});

async function addRsvp(
  { rsvps }: SessionDeps["repos"],
  input: RsvpInput,
  session: Session,
  rsvpCapacityHardLimit: boolean
): Promise<Result<Rsvp>> {
  if (!rsvpCapacityHardLimit || session.capacity <= 0)
    return ok(await rsvps.create(input));
  const created = await rsvps.createIfUnderCapacity({
    ...input,
    capacity: session.capacity,
  });
  return created
    ? ok(created)
    : conflict("session.full", "This session is full");
}

export const withdrawRsvp =
  ({ uow }: SessionDeps) =>
  async (actor: Actor, input: RsvpInput, now: Date): Promise<Result<void>> =>
    uow.run(async (tx) => {
      const checked = await checkRsvp(tx, actor, input, "withdraw", now);
      if (!checked.ok) return checked;
      await removeRsvp(
        tx,
        input.sessionId,
        input.guestId,
        byGuest(input.guestId, now)
      );
      return ok(undefined);
    });

// Who RSVPed to a session is shown to everyone in the session details.
export const listSessionRsvps =
  ({ repos }: SessionDeps) =>
  async (
    _actor: Actor,
    { sessionId }: { sessionId: string }
  ): Promise<Result<Rsvp[]>> => {
    if (!(await repos.sessions.findById(sessionId))) return sessionNotFound();
    return ok(await repos.rsvps.listBySession(sessionId));
  };

// A guest's RSVPs across sessions are private to a protected guest.
export const listGuestRsvps =
  ({ repos }: SessionDeps) =>
  async (
    actor: Actor,
    { guestId }: { guestId: string }
  ): Promise<Result<Rsvp[]>> => {
    const acting = await actingAsNamedGuest(actor, guestId, repos.guests);
    if (!acting.ok) return acting;
    return ok(await repos.rsvps.listByGuest(guestId));
  };

export const adminRemoveRsvp =
  ({ uow }: SessionDeps) =>
  async (
    actor: Actor,
    input: RsvpInput,
    now: Date
  ): Promise<Result<Session>> => {
    if (!actor.admin) return forbidden("admin.required", "Unauthorized");
    return uow.run(async (tx) => {
      const session = await tx.sessions.findById(input.sessionId);
      if (!session) return sessionNotFound();
      await removeRsvp(tx, input.sessionId, input.guestId, byAdmin(actor, now));
      return ok(session);
    });
  };

// For seeding scripts: no phase gate and hosts may RSVP to their own session,
// but a hard capacity limit still holds. Re-adding an RSVP changes nothing.
export const adminAddRsvp =
  ({ uow }: SessionDeps) =>
  async (
    actor: Actor,
    input: RsvpInput,
    now: Date
  ): Promise<Result<{ rsvp: Rsvp; created: boolean }>> => {
    if (!actor.admin) return forbidden("admin.required", "Unauthorized");
    return uow.run(async (tx) => {
      const session = await tx.sessions.findById(input.sessionId);
      if (!session) return sessionNotFound();
      if (!(await tx.guests.findById(input.guestId)))
        return notFound("guest.notFound", "Guest not found");

      const existing = await findRsvp(tx, input.sessionId, input.guestId);
      let rsvp = existing;
      if (!rsvp) {
        const event = await tx.events.findById(session.eventId);
        const added = await addRsvp(
          tx,
          input,
          session,
          event?.rsvpCapacityHardLimit ?? false
        );
        if (!added.ok) return added;
        rsvp = added.value;
        await recordRsvpAdded(tx, rsvp, byAdmin(actor, now));
      }
      await recordingShownGuests(
        tx,
        [session.eventId],
        () => tx.guests.assignToEvent(session.eventId, [input.guestId]),
        byAdmin(actor, now)
      );
      return ok({ rsvp, created: !existing });
    });
  };
