import { changes, type ChangeContext } from "@schellingboard/domain/change";
import type { Location } from "@schellingboard/domain/location";
import type { Tx } from "@/server/kernel/unit-of-work";

/** One change per event: a location belongs to several, each with its own feed. */
export async function recordLocationChanged(
  tx: Tx,
  locationId: string,
  eventIds: string[],
  by: ChangeContext
): Promise<void> {
  const location = await tx.locations.findById(locationId);
  if (!location) throw new Error(`Location ${locationId} is gone`);
  for (const eventId of eventIds)
    tx.record(changes.locationChanged(location, eventId, by));
}

export function recordLocationRemoved(
  tx: Tx,
  location: Location,
  eventIds: string[],
  by: ChangeContext
): void {
  for (const eventId of eventIds)
    tx.record(changes.locationRemoved(location, eventId, by));
}
