import type { ApiClient } from "@schellingboard/api-client";
import { createPagedQuery, type PagedState } from "./paged-query";

export type AdminSession = {
  id: string;
  title: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  capacity: number;
  adminManaged: boolean;
  blocker: boolean;
  closed: boolean;
  hosts: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  numRsvps: number;
  version: number;
};

export type AdminSessionsState = PagedState<"sessions", AdminSession>;

export type AdminSessionsQuery = ReturnType<typeof createAdminSessionsQuery>;

/** Every session of an event, scheduled or not; `load` again after a change. */
export function createAdminSessionsQuery({
  api,
  eventId,
}: {
  api: ApiClient;
  eventId: string;
}) {
  return createPagedQuery({
    key: "sessions",
    fetchPage: (cursor) =>
      api.GET("/api/v1/sessions", {
        params: { query: { eventId, limit: 1000, cursor } },
      }),
    map: (s): AdminSession => ({
      id: s.id,
      title: s.title,
      description: s.description,
      startTime: s.startTime,
      endTime: s.endTime,
      capacity: s.capacity,
      adminManaged: s.adminManaged,
      blocker: s.blocker,
      closed: s.closed,
      hosts: s.hosts.map((h) => ({ id: h.id, name: h.name })),
      locations: s.locations.map((l) => ({ id: l.id, name: l.name })),
      numRsvps: s.numRsvps,
      version: s.version,
    }),
  });
}

export type ScheduledSession = {
  title: string;
  startTime: string;
  endTime: string;
};

/** The sessions with a time, which deleting a day would take with it. */
export function scheduledOf(sessions: AdminSession[]): ScheduledSession[] {
  return sessions.flatMap((s) =>
    s.startTime && s.endTime
      ? [{ title: s.title, startTime: s.startTime, endTime: s.endTime }]
      : []
  );
}

/** The ids of the guests who RSVPed; null when the list could not be read. */
export async function loadSessionRsvpGuests(
  api: ApiClient,
  sessionId: string
): Promise<string[] | null> {
  try {
    const { data } = await api.GET("/api/v1/sessions/{id}/rsvps", {
      params: { path: { id: sessionId } },
    });
    return data ? data.rsvps.map((r) => r.guestId) : null;
  } catch {
    return null;
  }
}
