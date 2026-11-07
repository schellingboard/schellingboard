export interface EventFacts {
  event: { id: string; name: string; slug: string };
  timezone: string;
  breakMinutes: number;
  slotIncrementMinutes: number;
  meetingsEnabled: boolean;
  days: { startBookings: string; endBookings: string }[];
  unavailability: { locationId: string; start: string; end: string }[];
  locationDetails: { id: string; capacity: number; bookable: boolean }[];
  members: string[];
  locations: { id: string; name: string }[];
  hosts: { id: string; name: string }[];
  proposalHosts: { id: string; name: string }[];
  proposals: {
    id: string;
    title: string;
    createdTime: string;
    durationMinutes: number | null;
    cohostWanted: boolean;
    commentCount: number;
    hostIds: string[];
  }[];
  votes: { proposalId: string; guestId: string; choice: string }[];
  sessions: {
    id: string;
    title: string;
    startTime: string | null;
    endTime: string | null;
    capacity: number;
    closed: boolean;
    attendeeCount: number | null;
    followUpSent: boolean;
    commentCount: number;
    blocker: boolean;
    proposalId: string | null;
    adminManaged: boolean;
    hostIds: string[];
    locationIds: string[];
  }[];
  rsvps: { sessionId: string; guestId: string }[];
  commenterIds: string[];
  meetingSlotCounts: { guestId: string; slots: number }[];
  meetingPoints: string[];
  meetings: {
    requesterId: string;
    recipientId: string;
    status: "pending" | "accepted" | "declined" | "canceled";
    slotStart: string;
    slotEnd: string;
    createdAt: string;
    respondedAt: string | null;
    meetingPoint: string;
  }[];
  profiles: {
    guestId: string;
    photo: boolean;
    aboutMe: boolean;
    pronouns: boolean;
    basedIn: string;
    languages: string[];
    prompts: number;
    contactTypes: string[];
  }[];
  comments: {
    kind: "proposal" | "session" | "profile";
    targetId: string;
    authorId: string | null;
    replyTo: string | null;
    createdTime: string;
    edited: boolean;
    deleted: boolean;
    likerIds: string[];
  }[];
  emailSettings: { guestId: string; hasEmail: boolean; on: string[] }[];
  pushGuestIds: string[];
  notifications: { guestId: string; type: string; read: boolean }[];
}
