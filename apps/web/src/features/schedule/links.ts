export type ScheduleLinks = {
  schedule: string;
  proposals: string;
  /** A session's own address, which opens its side panel. */
  session: (sessionId: string) => string;
  /** A 1-on-1's own address, which opens its side panel. */
  meeting: (meetingId: string) => string;
  addSession: (slot: { location: string; day: string; time: string }) => string;
  guest: (guestId: string) => string;
  editSession: (sessionId: string) => string;
  proposal: (proposalId: string) => string;
  /** Where a free 1-on-1 slot, by its start, is arranged. */
  bookMeeting: (slotStart: string) => string;
};

/** Every address is the SPA's own; the booking dialog sits over `/{slug}/schedule`. */
export function scheduleLinks(eventSlug: string): ScheduleLinks {
  const schedule = `/${eventSlug}/schedule`;
  return {
    schedule,
    proposals: `/${eventSlug}/proposals`,
    session: (id) => `/${eventSlug}/sessions/${encodeURIComponent(id)}`,
    meeting: (id) => `/${eventSlug}/meetings/${encodeURIComponent(id)}`,
    guest: (guestId) => `/guests/${guestId}`,
    editSession: (sessionId) =>
      `/${eventSlug}/edit-session?${new URLSearchParams({ sessionID: sessionId })}`,
    proposal: (proposalId) =>
      `/${eventSlug}/proposals/${encodeURIComponent(proposalId)}`,
    addSession: ({ location, day, time }) =>
      `/${eventSlug}/add-session?${new URLSearchParams({ location, time, day })}`,
    bookMeeting: (slotStart) =>
      `${schedule}?${new URLSearchParams({ bookMeeting: slotStart })}`,
  };
}
