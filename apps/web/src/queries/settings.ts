import type { ApiClient } from "@schellingboard/api-client";
import type { emailSettingsSchema } from "@schellingboard/contracts/guest";
import type { availabilityFormsSchema } from "@schellingboard/contracts/meeting";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type EmailSettings = (typeof emailSettingsSchema)["_output"];
export type AvailabilityForms =
  (typeof availabilityFormsSchema)["_output"]["forms"];

export type SettingsState =
  | { status: "loading" }
  /** `code` says why: a refusal such as "guest.unselected", or a status. */
  | { status: "error"; code: string }
  | {
      status: "ready";
      emailSettings: EmailSettings;
      forms: AvailabilityForms;
      publicKey: string;
    };

export type SettingsQuery = ReturnType<typeof createSettingsQuery>;

/** What the settings page shows, read together so it never renders half. */
export function createSettingsQuery({ api }: { api: ApiClient }) {
  const state = createObservable<SettingsState>({ status: "loading" });
  let latest = 0;
  let destroyed = false;
  return {
    get: state.get,
    subscribe: state.subscribe,
    destroy() {
      destroyed = true;
    },
    async load() {
      const mine = ++latest;
      try {
        const [email, availability, key] = await Promise.all([
          api.GET("/api/v1/me/email-settings"),
          api.GET("/api/v1/meeting-availability"),
          api.GET("/api/v1/push/key"),
        ]);
        if (destroyed || mine !== latest) return;
        if (!email.data || !availability.data || !key.data) {
          const failed = [email, availability, key].find((r) => !r.data);
          state.set({
            status: "error",
            code: failed
              ? problemCode(failed.error, failed.response.status)
              : "unknown",
          });
          return;
        }
        state.set({
          status: "ready",
          emailSettings: email.data,
          forms: availability.data.forms,
          publicKey: key.data.publicKey,
        });
      } catch {
        if (!destroyed && mine === latest)
          state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
