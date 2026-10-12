export type ScheduleLinks = {
  schedule: string;
  proposals: string;
  /** Opens the session over the schedule, keeping the view and filters. */
  session: (current: URLSearchParams, sessionId: string) => string;
  meeting: (current: URLSearchParams, meetingId: string) => string;
  addSession: (slot: { location: string; day: string; time: string }) => string;
  /** Where a free 1-on-1 slot, by its start, is arranged. */
  bookMeeting: (slotStart: string) => string;
};

/**
 * Where the schedule's links go until the session modal, the meeting modal and
 * the add-session form are SPA screens: the one place to switch.
 */
export function legacyScheduleLinks(eventSlug: string): ScheduleLinks {
  const schedule = `/legacy/${eventSlug}`;
  const over = (key: string) => (current: URLSearchParams, id: string) => {
    const params = new URLSearchParams(current);
    params.set(key, id);
    return `${schedule}?${params.toString()}`;
  };
  return {
    schedule,
    proposals: `${schedule}/proposals`,
    session: over("viewSession"),
    meeting: over("viewMeeting"),
    addSession: ({ location, day, time }) =>
      `${schedule}/add-session?${new URLSearchParams({ location, time, day })}`,
    bookMeeting: (slotStart) =>
      `${schedule}?${new URLSearchParams({ bookMeeting: slotStart })}`,
  };
}
