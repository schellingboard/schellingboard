import type { ApiClient } from "@schellingboard/api-client";
import type {
  eventPhasesBodySchema,
  eventSettingsBodySchema,
} from "@schellingboard/contracts/event";

export type EventSettingsBody = (typeof eventSettingsBodySchema)["_input"];
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
  };
}

export type AdminEventCalls = ReturnType<typeof adminEventCalls>;
