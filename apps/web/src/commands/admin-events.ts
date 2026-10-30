import type { ApiClient } from "@schellingboard/api-client";
import type { eventSettingsBodySchema } from "@schellingboard/contracts/event";

export type EventSettingsBody = (typeof eventSettingsBodySchema)["_input"];

/** The admin events screens' calls; they wait for each answer, so none is a command. */
export function adminEventCalls(api: ApiClient) {
  return {
    create: (body: EventSettingsBody, key: string) =>
      api.POST("/api/v1/admin/events", {
        body,
        headers: { "Idempotency-Key": key },
      }),
  };
}

export type AdminEventCalls = ReturnType<typeof adminEventCalls>;
