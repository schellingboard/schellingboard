import type { Repositories } from "@/db/container";

export const allGuests = (q: Pick<Repositories, "guests">) => q.guests.list();

export const guestById = async (q: Pick<Repositories, "guests">, id: string) =>
  (await q.guests.findById(id)) ?? null;

export const attendees = (q: Pick<Repositories, "guests">, now: Date) =>
  q.guests.listAttendees(now);

type Guests = Pick<Repositories, "guests">;
type GuestRepo = Repositories["guests"];

export const searchGuests = (
  q: Guests,
  opts: Parameters<GuestRepo["search"]>[0]
) => q.guests.search(opts);

export const guestsOfEvent = (q: Guests, eventId: string) =>
  q.guests.listByEvent(eventId);

export const eventsOfGuests = (q: Guests, guestIds: string[]) =>
  q.guests.listEventsByGuests(guestIds);

export const guestsForEventAssignment = (
  q: Guests,
  eventId: string,
  opts: Parameters<GuestRepo["searchForEventAssignment"]>[1]
) => q.guests.searchForEventAssignment(eventId, opts);
