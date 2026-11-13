import { t } from "@lingui/core/macro";
import type { ApiClient } from "@schellingboard/api-client";
import {
  MAX_ATTENDEE_COUNT,
  MIN_ATTENDEE_COUNT,
} from "@schellingboard/domain/attendee-count";

import { problemCode } from "../commands/problem";

export type AttendeeCountResult =
  | { ok: true; count: number | null }
  | { ok: false; message: string; invalid?: true };

export type AttendeeCountApi = ReturnType<typeof attendeeCountApi>;

const rangeMessage = () =>
  t`Enter a whole number between ${MIN_ATTENDEE_COUNT} and ${MAX_ATTENDEE_COUNT}`;
const loadFailed = () => t`Could not load the count — try again`;
const saveFailed = () => t`Could not save — try again`;

/** A host's count of who came: not in the replica, which every visitor receives. */
export function attendeeCountApi(api: ApiClient, newKey: () => string) {
  const params = (id: string) => ({ params: { path: { id } } });
  return {
    async load(sessionId: string): Promise<AttendeeCountResult> {
      try {
        const { data } = await api.GET(
          "/api/v1/sessions/{id}/attendee-count",
          params(sessionId)
        );
        return data
          ? { ok: true, count: data.count }
          : { ok: false, message: loadFailed() };
      } catch {
        return { ok: false, message: loadFailed() };
      }
    },
    async save(
      sessionId: string,
      count: number | null
    ): Promise<AttendeeCountResult> {
      try {
        const { data, error, response } = await api.PUT(
          "/api/v1/sessions/{id}/attendee-count",
          {
            ...params(sessionId),
            body: { count },
            headers: { "Idempotency-Key": newKey() },
          }
        );
        if (data) return { ok: true, count: data.count };
        return problemCode(error, response.status) === "attendeeCount.invalid"
          ? { ok: false, message: rangeMessage(), invalid: true }
          : { ok: false, message: saveFailed() };
      } catch {
        return { ok: false, message: saveFailed() };
      }
    },
  };
}
