export const CONTACT_TYPES = [
  "email",
  "phone",
  "whatsapp",
  "signal",
  "telegram",
  "discord",
  "website",
  "other",
] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
  signal: "Signal",
  telegram: "Telegram",
  discord: "Discord",
  website: "Website",
  other: "Other",
};

// Entry caps keep profiles and the edit form scannable.
export const MAX_LANGUAGES = 10;
export const MAX_CONTACTS = 10;

// When the guest wants to be emailed.
export type EmailSettings = {
  /** A session the guest RSVP'd to changed time or location. */
  rsvpChange: boolean;
  /** A session the guest is hosting changed time or location. */
  hostChange: boolean;
  /** The guest was added as a co-host of a session. */
  cohostAdd: boolean;
  /** Someone joined a proposal the guest is hosting as a co-host. */
  proposalJoin: boolean;
  /** Someone commented on a proposal the guest is hosting. */
  proposalComment: boolean;
  /** Someone commented on a session the guest is hosting. */
  sessionComment: boolean;
  /** Someone commented on the guest's own profile. */
  profileComment: boolean;
  /**
   * Someone commented on a proposal, session or profile the guest has
   * commented on.
   */
  commentThread: boolean;
  /** Someone asked the guest for a 1-on-1 meeting. */
  meetingRequest: boolean;
  /** A 1-on-1 the guest asked for was accepted, declined or canceled. */
  meetingResponse: boolean;
  /** The heads-up an hour before a session the guest is hosting starts. */
  sessionHeadsUp: boolean;
  /**
   * The follow-up after a session the guest is hosting ends, asking for the
   * attendee count. Like every other key here, both of these gate the mail
   * alone: the reminders still reach the guest in the app.
   */
  attendeeCountReminder: boolean;
};

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  rsvpChange: true,
  hostChange: true,
  cohostAdd: true,
  proposalJoin: true,
  proposalComment: true,
  sessionComment: true,
  profileComment: true,
  commentThread: false,
  // On by default, unlike the comment-thread digest: this mail is addressed
  // personally to the guest and is waiting on their answer.
  meetingRequest: true,
  meetingResponse: true,
  sessionHeadsUp: true,
  attendeeCountReminder: true,
};

type GuestPrivateInfo = {
  email: string;
  // These aren't very private, but still no reason to expose them to other
  // guests.
  emailSettings: EmailSettings;
};

/** An answered profile prompt, e.g. { prompt: "Ask me about", answer: "…" }. */
export type ProfilePrompt = { prompt: string; answer: string };

/**
 * A public contact entry. Deliberately separate from the private system email
 * (GuestPrivateInfo.email): filling one in is the guest's opt-in to showing it.
 * `label` is the guest-supplied name for type "other".
 */
export type ProfileContact = {
  type: ContactType;
  label?: string;
  value: string;
};

export type Guest<PI extends GuestPrivateInfo | void = void> = {
  id: string;
  name: string;
  // Public: shown on the guest's profile to anyone who can view it.
  aboutMe?: string | null;
  avatarUrl?: string | null;
  pronouns?: string | null;
  basedIn?: string | null;
  prompts?: ProfilePrompt[] | null;
  languages?: string[] | null;
  contacts?: ProfileContact[] | null;
  // When a public field above was last changed; null for a profile that was
  // never edited (see the `guests` table in db/schema.ts). Drives the
  // "recently updated" sort.
  profileUpdatedAt?: Date | null;
  // Public (the name switcher must know to ask for credentials); the
  // password hash itself is server-only, see GuestAuthCredentials in db/.
  authProtected?: boolean;
  info: PI;
};

export type CompleteGuest = Guest<GuestPrivateInfo>;

/** A guest with information used in the attendees list */
export type Attendee = Guest & {
  isHost: boolean;
  /** Bookable for 1-on-1s somewhere on the site — the directory is global. */
  openToMeetings: boolean;
};

/**
 * A guest as one event's list of people shows them. `Attendee`'s
 * `openToMeetings` is absent on purpose: it is a site-wide question, and
 * probing it for everyone is most of what makes that query expensive.
 */
export type EventAttendee = Pick<
  Guest,
  "id" | "name" | "avatarUrl" | "pronouns" | "basedIn"
> & { isHost: boolean };

export function sanitizeGuest(guest: CompleteGuest): Guest {
  const out = { ...guest, info: undefined };
  delete out.info;
  return out;
}
