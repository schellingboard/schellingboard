import type { ApiClient } from "@schellingboard/api-client";
import type { eventLabelBodySchema } from "@schellingboard/contracts/event-label";

export type LabelBody = (typeof eventLabelBodySchema)["_input"];

/** The admin label calls; they wait for each answer, so none is a command. */
export function adminLabelCalls(api: ApiClient) {
  return {
    createLabel: (eventId: string, body: LabelBody, key: string) =>
      api.POST("/api/v1/admin/events/{id}/labels", {
        params: { path: { id: eventId } },
        body,
        headers: { "Idempotency-Key": key },
      }),
    updateLabel: (id: string, body: LabelBody, key: string) =>
      api.PUT("/api/v1/admin/labels/{id}", {
        params: { path: { id } },
        body,
        headers: { "Idempotency-Key": key },
      }),
    deleteLabel: (id: string, key: string) =>
      api.DELETE("/api/v1/admin/labels/{id}", {
        params: { path: { id } },
        headers: { "Idempotency-Key": key },
      }),
    setGuestLabels: (
      eventId: string,
      guestId: string,
      labelIds: string[],
      key: string
    ) =>
      api.PUT("/api/v1/admin/events/{id}/guests/{guestId}/labels", {
        params: { path: { id: eventId, guestId } },
        body: { labelIds },
        headers: { "Idempotency-Key": key },
      }),
  };
}

export type AdminLabelCalls = ReturnType<typeof adminLabelCalls>;
