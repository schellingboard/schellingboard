import { getRepositories } from "@/db/container";
import {
  searchGuests,
  guestsOfEvent,
  eventsOfGuests,
  guestsForEventAssignment,
} from "@/server/modules/people/module";
import {
  searchSessions,
  scheduledSessions,
  rsvpsOfSessions,
  unavailabilityOfEvent,
} from "@/server/modules/sessions/module";
import { searchProposals } from "@/server/modules/proposals/module";
import {
  allLocations,
  locationIdsOfEvent,
  eventIdsOfLocations,
  sessionLinkCounts,
  locationsForEventAssignment,
} from "@/server/modules/venue/module";
import { meetingPointsOfEvent } from "@/server/modules/meetings/module";

// Admin-only data with no check of its own: callers must have passed
// requireAdminPage() first.
export function adminReads() {
  const repos = getRepositories();
  return {
    searchGuests: (opts: Parameters<typeof searchGuests>[1]) =>
      searchGuests(repos, opts),
    guestsOfEvent: (eventId: string) => guestsOfEvent(repos, eventId),
    eventsOfGuests: (guestIds: string[]) => eventsOfGuests(repos, guestIds),
    guestsForEventAssignment: (
      eventId: string,
      opts: Parameters<typeof guestsForEventAssignment>[2]
    ) => guestsForEventAssignment(repos, eventId, opts),
    searchSessions: (
      eventId: string,
      opts: Parameters<typeof searchSessions>[2]
    ) => searchSessions(repos, eventId, opts),
    scheduledSessions: (eventId: string) => scheduledSessions(repos, eventId),
    rsvpsOfSessions: (sessionIds: string[]) =>
      rsvpsOfSessions(repos, sessionIds),
    unavailabilityOfEvent: (eventId: string) =>
      unavailabilityOfEvent(repos, eventId),
    searchProposals: (
      eventId: string,
      opts: Parameters<typeof searchProposals>[2]
    ) => searchProposals(repos, eventId, opts),
    allLocations: () => allLocations(repos),
    locationIdsOfEvent: (eventId: string) => locationIdsOfEvent(repos, eventId),
    eventIdsOfLocations: (locationIds: string[]) =>
      eventIdsOfLocations(repos, locationIds),
    sessionLinkCounts: (locationIds: string[]) =>
      sessionLinkCounts(repos, locationIds),
    locationsForEventAssignment: (
      eventId: string,
      opts: Parameters<typeof locationsForEventAssignment>[2]
    ) => locationsForEventAssignment(repos, eventId, opts),
    meetingPointsOfEvent: (eventId: string) =>
      meetingPointsOfEvent(repos, eventId),
  };
}
