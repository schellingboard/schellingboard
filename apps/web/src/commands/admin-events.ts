import type { ApiClient } from "@schellingboard/api-client";
import type { adminSessionUpdateSchema } from "@schellingboard/contracts/session";
import type {
  dayBodySchema,
  eventPhasesBodySchema,
  eventSettingsBodySchema,
} from "@schellingboard/contracts/event";

export type EventSettingsBody = (typeof eventSettingsBodySchema)["_input"];
export type DayBody = (typeof dayBodySchema)["_input"];
export type AdminSessionBody = Omit<
  (typeof adminSessionUpdateSchema)["_input"],
  "expectedVersion"
>;
export type EventPhasesBody = (typeof eventPhasesBodySchema)["_input"];

/** The admin events screens' calls; they wait for each answer, so none is a command. */
export function adminEventCalls(api: ApiClient) {
  return {
    create: (body: EventSettingsBody, key: string) =>
      api.POST("/api/v1/admin/events", {
        body,
        headers: { "Idempotency-Key": key },
      }),
    update: (
      id: string,
      body: EventSettingsBody,
      expectedVersion: number,
      key: string
    ) =>
      api.PUT("/api/v1/admin/events/{id}", {
        params: { path: { id } },
        body: { ...body, expectedVersion },
        headers: { "Idempotency-Key": key },
      }),
    updatePhases: (
      id: string,
      body: EventPhasesBody,
      expectedVersion: number,
      key: string
    ) =>
      api.PUT("/api/v1/admin/events/{id}/phases", {
        params: { path: { id } },
        body: { ...body, expectedVersion },
        headers: { "Idempotency-Key": key },
      }),
    remove: (id: string, key: string) =>
      api.DELETE("/api/v1/admin/events/{id}", {
        params: { path: { id } },
        headers: { "Idempotency-Key": key },
      }),
    updateMeetings: (
      id: string,
      body: { meetingsEnabled: boolean; maxOpenMeetingRequests?: number },
      expectedVersion: number,
      key: string
    ) =>
      api.PUT("/api/v1/admin/events/{id}/meetings", {
        params: { path: { id } },
        body: { ...body, expectedVersion },
        headers: { "Idempotency-Key": key },
      }),
    createPoint: (
      eventId: string,
      body: { name: string; description: string },
      key: string
    ) =>
      api.POST("/api/v1/admin/events/{id}/meeting-points", {
        params: { path: { id: eventId } },
        body,
        headers: { "Idempotency-Key": key },
      }),
    updatePoint: (
      eventId: string,
      id: string,
      body: { name: string; description: string },
      expectedVersion: number,
      key: string
    ) =>
      api.PUT("/api/v1/admin/events/{eventId}/meeting-points/{id}", {
        params: { path: { eventId, id } },
        body: { ...body, expectedVersion },
        headers: { "Idempotency-Key": key },
      }),
    deletePoint: (eventId: string, id: string, key: string) =>
      api.DELETE("/api/v1/admin/events/{eventId}/meeting-points/{id}", {
        params: { path: { eventId, id } },
        headers: { "Idempotency-Key": key },
      }),
    createDay: (eventId: string, body: DayBody, key: string) =>
      api.POST("/api/v1/admin/events/{id}/days", {
        params: { path: { id: eventId } },
        body,
        headers: { "Idempotency-Key": key },
      }),
    updateDay: (
      id: string,
      body: DayBody,
      expectedVersion: number,
      key: string
    ) =>
      api.PUT("/api/v1/admin/days/{id}", {
        params: { path: { id } },
        body: { ...body, expectedVersion },
        headers: { "Idempotency-Key": key },
      }),
    assignGuests: (eventId: string, guestIds: string[], key: string) =>
      api.POST("/api/v1/admin/events/{id}/guests/assign", {
        params: { path: { id: eventId } },
        body: { guestIds },
        headers: { "Idempotency-Key": key },
      }),
    removeGuests: (eventId: string, guestIds: string[], key: string) =>
      api.POST("/api/v1/admin/events/{id}/guests/remove", {
        params: { path: { id: eventId } },
        body: { guestIds },
        headers: { "Idempotency-Key": key },
      }),
    assignLocations: (eventId: string, locationIds: string[], key: string) =>
      api.POST("/api/v1/admin/events/{id}/locations/assign", {
        params: { path: { id: eventId } },
        body: { locationIds },
        headers: { "Idempotency-Key": key },
      }),
    removeLocations: (eventId: string, locationIds: string[], key: string) =>
      api.POST("/api/v1/admin/events/{id}/locations/remove", {
        params: { path: { id: eventId } },
        body: { locationIds },
        headers: { "Idempotency-Key": key },
      }),
    addUnavailability: (
      eventId: string,
      body: { locationIds: string[]; start: string; end: string },
      key: string
    ) =>
      api.POST("/api/v1/admin/events/{id}/location-unavailability", {
        params: { path: { id: eventId } },
        body,
        headers: { "Idempotency-Key": key },
      }),
    deleteUnavailability: (id: string, key: string) =>
      api.DELETE("/api/v1/admin/location-unavailability/{id}", {
        params: { path: { id } },
        headers: { "Idempotency-Key": key },
      }),
    updateProposal: (
      id: string,
      body: {
        title: string;
        description: string;
        durationMinutes: number | null;
        hostIds: string[];
      },
      expectedVersion: number,
      key: string
    ) =>
      api.PUT("/api/v1/admin/proposals/{id}", {
        params: { path: { id } },
        body: { ...body, expectedVersion },
        headers: { "Idempotency-Key": key },
      }),
    deleteProposal: (id: string, key: string) =>
      api.DELETE("/api/v1/admin/proposals/{id}", {
        params: { path: { id } },
        headers: { "Idempotency-Key": key },
      }),
    createSession: (
      body: AdminSessionBody & { eventId: string },
      key: string
    ) =>
      api.POST("/api/v1/admin/sessions", {
        body,
        headers: { "Idempotency-Key": key },
      }),
    updateSession: (
      id: string,
      body: AdminSessionBody,
      expectedVersion: number,
      key: string
    ) =>
      api.PUT("/api/v1/admin/sessions/{id}", {
        params: { path: { id } },
        body: { ...body, expectedVersion },
        headers: { "Idempotency-Key": key },
      }),
    deleteSession: (id: string, key: string) =>
      api.DELETE("/api/v1/admin/sessions/{id}", {
        params: { path: { id } },
        headers: { "Idempotency-Key": key },
      }),
    removeRsvp: (sessionId: string, guestId: string, key: string) =>
      api.DELETE("/api/v1/admin/sessions/{id}/rsvps/{guestId}", {
        params: { path: { id: sessionId, guestId } },
        headers: { "Idempotency-Key": key },
      }),
    deleteDay: (id: string, key: string) =>
      api.DELETE("/api/v1/admin/days/{id}", {
        params: { path: { id } },
        headers: { "Idempotency-Key": key },
      }),
  };
}

export type AdminEventCalls = ReturnType<typeof adminEventCalls>;
