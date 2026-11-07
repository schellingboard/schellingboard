export interface EventFacts {
  event: { id: string; name: string; slug: string };
  timezone: string;
  breakMinutes: number;
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
  meetingOffererIds: string[];
}
