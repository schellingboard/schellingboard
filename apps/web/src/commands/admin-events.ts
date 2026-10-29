import type { ApiClient } from "@schellingboard/api-client";
import type {
  dayBodySchema,
  eventPhasesBodySchema,
  eventSettingsBodySchema,
} from "@schellingboard/contracts/event";

export type EventSettingsBody = (typeof eventSettingsBodySchema)["_input"];
export type DayBody = (typeof dayBodySchema)["_input"];
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
    deleteDay: (id: string, key: string) =>
      api.DELETE("/api/v1/admin/days/{id}", {
        params: { path: { id } },
        headers: { "Idempotency-Key": key },
      }),
  };
}

export type AdminEventCalls = ReturnType<typeof adminEventCalls>;
