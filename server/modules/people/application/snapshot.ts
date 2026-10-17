import type { Repositories } from "@/db/container";

export function eventGuests(q: Pick<Repositories, "guests">, eventId: string) {
  return q.guests.listShownByEvent(eventId);
}
