import type { Repositories } from "@/db/container";

type Locations = Pick<Repositories, "locations">;

export const allLocations = (q: Locations) => q.locations.list();

export const locationIdsOfEvent = (q: Locations, eventId: string) =>
  q.locations.listLocationIdsByEvent(eventId);

export const eventIdsOfLocations = (q: Locations, locationIds: string[]) =>
  q.locations.listEventIdsByLocations(locationIds);

export const sessionLinkCounts = (q: Locations, locationIds: string[]) =>
  q.locations.countSessionLinksByLocations(locationIds);

export const locationsForEventAssignment = (
  q: Locations,
  eventId: string,
  opts: Parameters<Repositories["locations"]["searchForEventAssignment"]>[1]
) => q.locations.searchForEventAssignment(eventId, opts);
