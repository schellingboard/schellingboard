import type { EmailSettings } from "./guest";

/**
 * What happened, as one of the guest's email-setting keys. The two channels
 * share a taxonomy: the setting decides whether mail goes out, never whether
 * the in-app notification is recorded.
 */
export type NotificationType = keyof EmailSettings;

/**
 * A message the server wrote for the guest, kept as the source text and its
 * values so it can be read in the reader's language. Values are strings,
 * numbers, or a time or places the reader's language formats.
 */
export type NoticeMessage = {
  id: string;
  message?: string;
  context?: string;
  values?: Record<string, unknown>;
};

export type Notification = {
  id: string;
  guestId: string;
  type: NotificationType;
  /** One line, in the past tense: "Anna commented on your session". */
  text: string;
  /** Read in the reader's language; rows from before it was stored have only `text`. */
  message?: NoticeMessage;
  /** Site-relative path to whatever happened, e.g. `/eventslug/sessions/x`. */
  url: string;
  createdAt: Date;
  /** Unset while unread. */
  readAt?: Date;
};

export type DeliveryChannel = "email" | "push";

/** One email or push on its way to a guest. */
export type Delivery = {
  id: string;
  guestId: string;
  channel: DeliveryChannel;
  /** What the channel's sender needs, as notifyGuest queued it. */
  payload: unknown;
  attempts: number;
  firstFailedAt: Date | null;
};
