import type { ApiClient } from "@schellingboard/api-client";
import type { meetingRequestSchema } from "@schellingboard/contracts/meeting";

export type MeetingRequestBody = (typeof meetingRequestSchema)["_input"];

/** The 1-on-1 request form waits for the answer, so this is not a command. */
export function meetingRequestCalls(api: ApiClient) {
  return {
    request: (body: MeetingRequestBody, key: string) =>
      api.POST("/api/v1/meetings", {
        body,
        headers: { "Idempotency-Key": key },
      }),
    askToOpenUp: (guestId: string, eventId: string, key: string) =>
      api.POST("/api/v1/guests/{id}/open-up-requests", {
        params: { path: { id: guestId } },
        body: { eventId },
        headers: { "Idempotency-Key": key },
      }),
  };
}

export type MeetingRequestCalls = ReturnType<typeof meetingRequestCalls>;

/** What booking a slot needs; the rest of the calls belong to the profile. */
export type MeetingBookingCalls = Pick<MeetingRequestCalls, "request">;
