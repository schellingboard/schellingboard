import type { ApiClient } from "@schellingboard/api-client";
import type { meetingAvailabilitySchema } from "@schellingboard/contracts/meeting";

export type MeetingAvailabilityBody =
  (typeof meetingAvailabilitySchema)["_input"];

/** The availability form waits for the answer, so this is not a command. */
export function meetingAvailabilityCalls(api: ApiClient) {
  return {
    save: (body: MeetingAvailabilityBody, key: string) =>
      api.PUT("/api/v1/meeting-availability", {
        body,
        headers: { "Idempotency-Key": key },
      }),
  };
}

export type MeetingAvailabilityCalls = ReturnType<
  typeof meetingAvailabilityCalls
>;
