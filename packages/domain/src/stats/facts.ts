export interface EventFacts {
  event: { id: string; name: string; slug: string };
  members: string[];
  locations: { id: string; name: string }[];
  hosts: { id: string; name: string }[];
  proposals: { id: string; hostIds: string[] }[];
  votes: { proposalId: string; guestId: string }[];
  sessions: {
    id: string;
    blocker: boolean;
    proposalId: string | null;
    adminManaged: boolean;
    hostIds: string[];
    locationIds: string[];
    attendeeReported: boolean;
  }[];
  rsvps: { sessionId: string; guestId: string }[];
  commenterIds: string[];
  meetingOffererIds: string[];
}
