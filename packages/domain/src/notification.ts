import type { EmailSettings } from "./guest";

/**
 * What happened, as one of the guest's email-setting keys. The two channels
 * share a taxonomy: the setting decides whether mail goes out, never whether
 * the in-app notification is recorded.
 */
export type NotificationType = keyof EmailSettings;

export type Notification = {
  id: string;
  guestId: string;
  type: NotificationType;
  /** One line, in the past tense: "Anna commented on your session". */
  text: string;
  /** Site-relative path to whatever happened, e.g. `/eventslug?viewSession=x`. */
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
