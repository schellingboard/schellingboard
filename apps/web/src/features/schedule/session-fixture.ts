import type { Session } from "@schellingboard/domain/session";

export function newEmptySession(eventId: string): Session {
  return {
    id: "",
    title: "",
    description: "",
    startTime: undefined,
    endTime: undefined,
    hosts: [],
    locations: [],
    capacity: 0,
    numRsvps: 0,
    adminManaged: false,
    blocker: false,
    closed: false,
    proposalId: undefined,
    eventId,
    version: 0,
  };
}
