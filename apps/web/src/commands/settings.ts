import type { ApiClient } from "@schellingboard/api-client";
import type { emailSettingsSchema } from "@schellingboard/contracts/guest";
import type { pushSubscriptionSchema } from "@schellingboard/contracts/push";

export type EmailSettingsBody = (typeof emailSettingsSchema)["_input"];
export type PushSubscriptionBody = (typeof pushSubscriptionSchema)["_input"];

/** The settings page waits for every answer, so none of these is a command. */
export function settingsCalls(api: ApiClient) {
  const keyed = (key: string) => ({ "Idempotency-Key": key });
  return {
    saveEmailSettings: (body: EmailSettingsBody, key: string) =>
      api.PUT("/api/v1/me/email-settings", { body, headers: keyed(key) }),
    subscribe: (body: PushSubscriptionBody, key: string) =>
      api.POST("/api/v1/me/push-subscriptions", {
        body,
        headers: keyed(key),
      }),
    unsubscribe: (endpoint: string, key: string) =>
      api.POST("/api/v1/me/push-subscriptions/remove", {
        body: { endpoint },
        headers: keyed(key),
      }),
    isEnabledHere: (endpoint: string, key: string) =>
      api.POST("/api/v1/me/push-subscriptions/check", {
        body: { endpoint },
        headers: keyed(key),
      }),
  };
}

export type SettingsCalls = ReturnType<typeof settingsCalls>;
