import type { Guest } from "./guest";
import type { Location } from "./location";

export const COHOST_WANTED_NOTE_MAX = 200;

export type SessionHost = Pick<Guest, "id" | "name">;

export type SessionLocation = Pick<Location, "id" | "name" | "color">;

export type Session = {
  id: string;
  title: string;
  description: string;
  startTime?: Date;
  endTime?: Date;
  capacity: number;
  adminManaged: boolean;
  blocker: boolean;
  closed: boolean;
  proposalId?: string;
  eventId: string;
  hosts: SessionHost[];
  locations: SessionLocation[];
  numRsvps: number;
};

export type Rsvp = {
  id: string;
  sessionId: string;
  guestId: string;
};

export type SessionCreateInput = {
  title: string;
  description: string;
  startTime?: Date;
  endTime?: Date;
  capacity: number;
  adminManaged: boolean;
  blocker: boolean;
  closed: boolean;
  proposalId?: string;
  eventId: string;
  hostIds: string[];
  locationIds: string[];
};

export type ProposalHost = Pick<Guest, "id" | "name">;

export type SessionProposal = {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  createdTime: Date;
  updatedTime: Date;
  hosts: ProposalHost[];
  /** Only ever true while there are hosts: with none, a host is wanted anyway. */
  cohostWanted: boolean;
  cohostWantedNote?: string;
  votesCount: number;
  interestedVotesCount: number;
  maybeVotesCount: number;
  skipVotesCount: number;
  sessionIds: string[];
};
