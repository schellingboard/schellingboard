import { inSchedPhase } from "@schellingboard/domain/phase";
import type { Rsvp, Session } from "@schellingboard/domain/session";
import { actingAsNamedGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import {
  conflict,
  forbidden,
  notFound,
  ok,
  type Result,
} from "@/server/kernel/result";
import type { SessionDeps } from "../ports";

export interface RsvpInput {
  sessionId: string;
  guestId: string;
}

const sessionNotFound = () => notFound("session.notFound", "Session not found");

async function rsvpTarget(
  { repos }: SessionDeps,
  actor: Actor,
  { sessionId, guestId }: RsvpInput,
  now: Date
): Promise<Result<{ session: Session; rsvpCapacityHardLimit: boolean }>> {
  const acting = await actingAsNamedGuest(actor, guestId, repos.guests);
  if (!acting.ok) return acting;
  const session = await repos.sessions.findById(sessionId);
  if (!session) return sessionNotFound();
  const event = await repos.events.findById(session.eventId);
  const eventGuests = event ? await repos.guests.listByEvent(event.id) : [];
  if (!eventGuests.some((g) => g.id === guestId))
    return forbidden("guest.notInEvent", "Guest is not part of this event");
  if (!event || !inSchedPhase(event, now))
    return forbidden(
      "event.notSchedulingPhase",
      "RSVPs can only be changed during the scheduling phase"
    );
  return ok({
    session,
    rsvpCapacityHardLimit: event.rsvpCapacityHardLimit,
  });
}

export const rsvp =
  (deps: SessionDeps) =>
  async (actor: Actor, input: RsvpInput, now: Date): Promise<Result<Rsvp>> => {
    const target = await rsvpTarget(deps, actor, input, now);
    if (!target.ok) return target;
    const { session, rsvpCapacityHardLimit } = target.value;
    if (session.hosts.some((h) => h.id === input.guestId))
      return forbidden(
        "rsvp.ownSession",
        "Hosts cannot RSVP to their own session"
      );

    return addRsvp(deps.repos, input, session, rsvpCapacityHardLimit);
  };

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
  (deps: SessionDeps) =>
  async (actor: Actor, input: RsvpInput, now: Date): Promise<Result<void>> => {
    const target = await rsvpTarget(deps, actor, input, now);
    if (!target.ok) return target;
    await deps.repos.rsvps.deleteBySessionAndGuest(
      input.sessionId,
      input.guestId
    );
    return ok(undefined);
  };

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
  ({ repos }: SessionDeps) =>
  async (actor: Actor, input: RsvpInput): Promise<Result<Session>> => {
    if (!actor.admin) return forbidden("admin.required", "Unauthorized");
    const session = await repos.sessions.findById(input.sessionId);
    if (!session) return sessionNotFound();
    await repos.rsvps.deleteBySessionAndGuest(input.sessionId, input.guestId);
    return ok(session);
  };

// For seeding scripts: no phase gate and hosts may RSVP to their own session,
// but a hard capacity limit still holds. Re-adding an RSVP changes nothing.
export const adminAddRsvp =
  ({ uow }: SessionDeps) =>
  async (
    actor: Actor,
    input: RsvpInput
  ): Promise<Result<{ rsvp: Rsvp; created: boolean }>> => {
    if (!actor.admin) return forbidden("admin.required", "Unauthorized");
    return uow.run(async (tx) => {
      const session = await tx.sessions.findById(input.sessionId);
      if (!session) return sessionNotFound();
      if (!(await tx.guests.findById(input.guestId)))
        return notFound("guest.notFound", "Guest not found");

      const existing = (await tx.rsvps.listBySession(input.sessionId)).find(
        (r) => r.guestId === input.guestId
      );
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
      }
      await tx.guests.assignToEvent(session.eventId, [input.guestId]);
      return ok({ rsvp, created: !existing });
    });
  };
