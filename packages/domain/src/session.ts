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
