export type ReminderKind = "headsUp" | "followUp";

export type ReminderKey = {
  sessionId: string;
  guestId: string;
  kind: ReminderKind;
};

/** One (session, host, kind) the dispatcher may owe a reminder for. */
export type DueReminderCandidate = ReminderKey & {
  dueTime: Date;

  sessionTitle: string;
  sessionStartTime: Date;
  sessionEndTime: Date;
  sessionLocationNames: string[];
  /**
   * Whether a count is already recorded — a flag, not the number, which is
   * host-only. Suppressing the follow-up (FR-011) is the dispatcher's decision.
   */
  hasRecordedCount: boolean;

  eventSlug: string;
  eventTimezone: string;

  /**
   * Null when the host has no address on file. That skips the mail only — the
   * in-app notification still goes out and a row is still written.
   */
  guestEmail: string | null;
  /**
   * The EmailSettings key for *this* kind — `sessionHeadsUp` or
   * `attendeeCountReminder` — which gates the **email** alone (FR-017). It has
   * no bearing on the notification.
   */
  reminderOptIn: boolean;

  storedDueTime: Date | null;
  storedClaimedAt: Date | null;
  storedNotifiedAt: Date | null;
};
