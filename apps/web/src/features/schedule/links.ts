export type ScheduleLinks = {
  schedule: string;
  proposals: string;
  /** Opens the session over the schedule, keeping the view and filters. */
  session: (current: URLSearchParams, sessionId: string) => string;
  meeting: (current: URLSearchParams, meetingId: string) => string;
  addSession: (slot: { location: string; day: string; time: string }) => string;
  guest: (guestId: string) => string;
  editSession: (sessionId: string) => string;
  proposal: (proposalId: string) => string;
  /** Where a free 1-on-1 slot, by its start, is arranged. */
  bookMeeting: (slotStart: string) => string;
};

/**
 * Where the schedule's links go until the add-session form
 * and the pages around the session modal are SPA screens: the one place to switch.
 * The session and 1-on-1 modals are the SPA's own, over `/{slug}`.
 */
export function legacyScheduleLinks(eventSlug: string): ScheduleLinks {
  const schedule = `/legacy/${eventSlug}`;
  return {
    schedule,
    proposals: `/${eventSlug}/proposals`,
    session: (current, id) => {
      const params = new URLSearchParams(current);
      params.set("viewSession", id);
      return `/${eventSlug}?${params.toString()}`;
    },
    meeting: (current, id) => {
      const params = new URLSearchParams(current);
      params.set("viewMeeting", id);
      return `/${eventSlug}?${params.toString()}`;
    },
    guest: (guestId) => `/guests/${guestId}`,
    editSession: (sessionId) =>
      `${schedule}/edit-session?${new URLSearchParams({ sessionID: sessionId })}`,
    proposal: (proposalId) =>
      `/${eventSlug}/proposals?${new URLSearchParams({ viewProposal: proposalId })}`,
    addSession: ({ location, day, time }) =>
      `${schedule}/add-session?${new URLSearchParams({ location, time, day })}`,
    bookMeeting: (slotStart) =>
      `/${eventSlug}?${new URLSearchParams({ bookMeeting: slotStart })}`,
  };
}
