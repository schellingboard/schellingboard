export type MeetingPoint = {
  id: string;
  eventId: string;
  name: string;
  description: string;
  sortIndex: number;
};

/**
 * Stored meeting states. "expired" is deliberately absent: a pending request
 * whose slot has passed is expired by definition, and deriving that on read
 * needs no scheduler.
 */
export type MeetingStatus = "pending" | "accepted" | "declined" | "canceled";

export type Meeting = {
  id: string;
  eventId: string;
  requesterId: string;
  recipientId: string;
  /** The slot the requester picked. */
  slotStart: Date;
  slotEnd: Date;
  /** Where to meet, as agreed at request time. Never empty. */
  meetingPoint: string;
  message: string;
  /** What the canceller said, if anything. Empty on a meeting still standing. */
  cancelNote: string;
  status: MeetingStatus;
  createdAt: Date;
  respondedAt?: Date;
};
