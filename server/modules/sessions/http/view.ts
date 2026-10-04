import type { Session } from "@schellingboard/domain/session";
import type { sessionViewSchema } from "@schellingboard/contracts/session";
import type { z } from "zod";

export function toSessionView(s: Session): z.input<typeof sessionViewSchema> {
  return {
    id: s.id,
    eventId: s.eventId,
    title: s.title,
    description: s.description,
    startTime: s.startTime?.toISOString() ?? null,
    endTime: s.endTime?.toISOString() ?? null,
    capacity: s.capacity,
    adminManaged: s.adminManaged,
    blocker: s.blocker,
    closed: s.closed,
    proposalId: s.proposalId ?? null,
    hosts: s.hosts.map(({ id, name }) => ({ id, name })),
    locations: s.locations.map(({ id, name, color }) => ({ id, name, color })),
    numRsvps: s.numRsvps,
  };
}
