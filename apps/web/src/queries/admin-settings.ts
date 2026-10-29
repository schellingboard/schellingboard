import type { ApiClient } from "@schellingboard/api-client";
import type { siteSettingsSchema } from "@schellingboard/contracts/settings";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type AdminSettings = (typeof siteSettingsSchema)["_output"];

export type AdminSettingsState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | { status: "ready"; settings: AdminSettings };

export type AdminSettingsQuery = ReturnType<typeof createAdminSettingsQuery>;

/** The site's title, description and map; `load` again after a save. */
export function createAdminSettingsQuery({ api }: { api: ApiClient }) {
  const state = createObservable<AdminSettingsState>({ status: "loading" });
  let latest = 0;
  return {
    get: state.get,
    subscribe: state.subscribe,
    async load() {
      const mine = ++latest;
      try {
        const { data, error, response } = await api.GET(
          "/api/v1/admin/settings"
        );
        if (mine !== latest) return;
        state.set(
          data
            ? { status: "ready", settings: data }
            : { status: "error", code: problemCode(error, response.status) }
        );
      } catch {
        if (mine === latest)
          state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
