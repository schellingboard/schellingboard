import type { NextRequest } from "next/server";
import { getRepositories } from "@/db/container";
import { inSchedPhase } from "@schellingboard/domain/phase";
import { requestNow } from "@/utils/dev-clock";
import {
  notifyCohostsAdded,
  notifySessionChanged,
} from "@/utils/notifications";
import { verifiedCurrentUser } from "@/utils/acting-guest";
import { sessionBookingWindowError } from "@schellingboard/domain/day-window";
import { sessionDurationError } from "@schellingboard/domain/slots";
import { locationUnavailableError } from "@schellingboard/domain/location-unavailability";
import {
  bookedSlot,
  prepareToInsert,
  sessionCapacityError,
  sessionHasStarted,
  validateSession,
} from "../session-form-utils";
import type { SessionParams } from "../session-form-utils";

export const dynamic = "force-dynamic"; // defaults to auto

export async function POST(req: NextRequest) {
  const params = (await req.json()) as SessionParams;
  if (!params.id) {
    console.error("Session ID is required for update.");
    return new Response("Session ID is required", { status: 400 });
  }
  const repos = getRepositories();
  // Anything but a string reaches the query as an unbindable parameter, which
  // fails as a server error rather than a rejected request.
  const day =
    typeof params.dayId === "string"
      ? await repos.days.findById(params.dayId)
      : undefined;
  if (!day) {
    return Response.json(
      { error: "That day is no longer part of this event" },
      { status: 400 }
    );
  }
  const allSessions = (await repos.sessions.listScheduled()).filter(
    (s) => s.eventId === day.eventId
  );
  const prevSession = allSessions.find((ses) => ses.id === params.id);
  if (prevSession === undefined) {
    const msg = `Cannot find session with ID ${params.id}`;
    return new Response(msg, { status: 404 });
  }
  const event = await repos.events.findById(prevSession.eventId);
  const now = requestNow(req);
  if (!event || !inSchedPhase(event, now)) {
    return new Response(
      "Sessions can only be edited during the scheduling phase",
      { status: 403 }
    );
  }
  const input = prepareToInsert(params, day, event.breakMinutes);
  const slot = bookedSlot(params);
  if (prevSession.adminManaged || prevSession.blocker) {
    return new Response("Cannot edit via web app", { status: 400 });
  }
  const actor = await verifiedCurrentUser(req.cookies);
  if (!actor || !prevSession.hosts.some((h) => h.id === actor)) {
    return Response.json(
      { error: "Only a host may edit this session" },
      { status: 403 }
    );
  }
  const startChanged =
    input.startTime!.getTime() !== prevSession.startTime?.getTime();
  const endChanged =
    input.endTime!.getTime() !== prevSession.endTime?.getTime();
  if (startChanged && sessionHasStarted(prevSession, now)) {
    return Response.json(
      {
        error: "This session has already started, so it can no longer be moved",
      },
      { status: 403 }
    );
  }
  // Only what the host is changing is theirs to answer for. An organizer may
  // have placed the session somewhere a host could not book it — outside the
  // day's bookable hours, off the slot grid, longer than the maximum, in a
  // room nobody may self-book — and leaving that as it stands is not an edit.
  const windowError = sessionBookingWindowError(
    day,
    slot.start,
    slot.end,
    event.slotIncrementMinutes,
    { start: startChanged, end: endChanged }
  );
  if (windowError) {
    return Response.json({ error: windowError }, { status: 400 });
  }
  if (startChanged || endChanged) {
    const durationError = sessionDurationError(
      slot.start,
      slot.end,
      event.slotIncrementMinutes,
      event.maxSessionDuration
    );
    if (durationError) {
      return Response.json({ error: durationError }, { status: 400 });
    }
  }
  const eventGuestIds = new Set(
    (await repos.guests.listByEvent(event.id)).map((g) => g.id)
  );
  if (!input.hostIds.every((id) => eventGuestIds.has(id))) {
    return Response.json(
      { error: "A host is not part of this event" },
      { status: 403 }
    );
  }
  // Exactly the set the session form offers: assigned to the event and open
  // to self-booking.
  const bookable = new Map(
    (await repos.locations.listBookableByEvent(event.id)).map((l) => [l.id, l])
  );
  // Plus the rooms the session is already in — an organizer may have picked
  // ones attendees cannot book, and staying put is not a booking.
  const currentLocationIds = prevSession.locations.map((l) => l.id);
  for (const id of currentLocationIds) {
    if (bookable.has(id)) continue;
    const current = await repos.locations.findById(id);
    if (current) bookable.set(current.id, current);
  }
  const requestedIds = [
    ...new Set(
      Array.isArray(params.locationIds) ? params.locationIds : input.locationIds
    ),
  ];
  const chosen = requestedIds.flatMap((id) => bookable.get(id) ?? []);
  // Several rooms are an organizer's to give: a host may keep the ones a
  // session has, or settle on one room, but not put together another set.
  const keepsRooms = requestedIds.every((id) =>
    currentLocationIds.includes(id)
  );
  if (
    chosen.length !== requestedIds.length ||
    chosen.length === 0 ||
    (chosen.length > 1 && !keepsRooms)
  ) {
    return Response.json(
      { error: "A location cannot be booked for this event" },
      { status: 403 }
    );
  }
  input.locationIds = chosen.map((l) => l.id);
  const capacityError = sessionCapacityError(params.capacity);
  if (capacityError) {
    return Response.json({ error: capacityError }, { status: 400 });
  }
  // The payload's location is the client's copy, so the room's own maximum
  // comes from the stored row; a number the host chose themselves wins.
  input.capacity =
    params.capacity ??
    (chosen.length > 1 ? prevSession.capacity : chosen[0].capacity);
  const unavailability = await repos.locationUnavailability.listByEvent(
    event.id
  );
  for (const { id: locationId } of chosen) {
    const unavailableError = locationUnavailableError(
      unavailability,
      { locationId, start: input.startTime!, end: input.endTime! },
      currentLocationIds.includes(locationId) &&
        prevSession.startTime &&
        prevSession.endTime
        ? {
            locationId,
            start: prevSession.startTime,
            end: prevSession.endTime,
          }
        : undefined
    );
    if (unavailableError) {
      return Response.json({ error: unavailableError }, { status: 400 });
    }
  }
  const existingSessions = allSessions.filter((ses) => ses.id !== params.id);
  const sessionValid = validateSession(input, existingSessions, now, {
    allowPastStart: !startChanged,
  });
  if (sessionValid) {
    let updated;
    try {
      updated = await repos.sessions.update(params.id, input);
      console.log(updated.id);
    } catch (err) {
      console.error(err);
      return Response.error();
    }

    await notifyCohostsAdded({
      now,
      session: updated,
      previousHostIds: prevSession.hosts.map((h) => h.id),
      changedById: actor,
    });
    await notifySessionChanged({
      now,
      before: prevSession,
      after: updated,
      changedById: actor,
    });
    return Response.json({ success: true });
  } else {
    return Response.error();
  }
}
