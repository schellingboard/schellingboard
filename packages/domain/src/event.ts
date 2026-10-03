export type Event = {
  id: string;
  name: string;
  /**
   * URL segment for the event. Derived from the name at creation and stable
   * afterwards (renames don't change it), so shared links keep working.
   */
  slug: string;
  description: string;
  website: string;
  /** The event's dates are those of its first and last days, unset without days. */
  firstDayStart?: Date;
  lastDayStart?: Date;
  proposalPhaseStart?: Date;
  proposalPhaseEnd?: Date;
  votingPhaseStart?: Date;
  votingPhaseEnd?: Date;
  schedulingPhaseStart?: Date;
  schedulingPhaseEnd?: Date;
  maxSessionDuration: number;
  breakMinutes: number;
  slotIncrementMinutes: number;
  timezone: string;
  /** When true, a session's capacity (> 0) rejects further RSVPs once reached. */
  rsvpCapacityHardLimit: boolean;
  icon?: string | null;
  /** Whether attendees can book 1-on-1 meetings with each other. */
  meetingsEnabled: boolean;
  /** How many unanswered requests one attendee may have outstanding. */
  maxOpenMeetingRequests: number;
};

/**
 * The organizer's 1-on-1 settings, configured from the admin Meetings section
 * after the event exists, never at creation.
 */
export type EventMeetingSettings = Pick<
  Event,
  "meetingsEnabled" | "maxOpenMeetingRequests"
>;

export type Day = {
  id: string;
  start: Date;
  end: Date;
  startBookings: Date;
  endBookings: Date;
  eventId: string;
};
