import type { Repositories } from "@/db/container";

export function eventLocations(
  q: Pick<Repositories, "locations">,
  eventId: string
) {
  return q.locations.listByEvent(eventId);
}
