import type { Repositories } from "@/db/container";
import { type Event, compareEventsByStart } from "@schellingboard/domain/event";
import { meetingsOpen } from "@/utils/meeting-rules";
import {
  availabilityFormFor,
  type AvailabilityFormData,
} from "@schellingboard/domain/meeting-slot-days";

/**
 * One form per event the guest can still be booked at: attended, offering
 * 1-on-1s right now, and with a day still to come -- or none yet, since the
 * organizer may add some. Ordered by when the event starts.
 */
export async function availabilityFormsFor(
  guestId: string,
  now: Date,
  repos: Pick<
    Repositories,
    "guests" | "events" | "days" | "meetingAvailability"
  >
): Promise<AvailabilityFormData[]> {
  // The assignment lookup carries ids and names only.
  const attending = await Promise.all(
    ((await repos.guests.listEventsByGuests([guestId])).get(guestId) ?? []).map(
      ({ id }) => repos.events.findById(id)
    )
  );
  const offering = attending
    .filter(
      (event): event is Event => event !== undefined && meetingsOpen(event, now)
    )
    .sort(compareEventsByStart);

  const forms = await Promise.all(
    offering.map(async (event) => {
      const [days, declared] = await Promise.all([
        repos.days.listByEvent(event.id),
        repos.meetingAvailability.listByGuestAndEvent(guestId, event.id),
      ]);
      return availabilityFormFor(event, days, declared, now);
    })
  );
  return forms.filter((form) => form !== null);
}
