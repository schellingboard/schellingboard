import { createApiClient, type ApiClient } from "@schellingboard/api-client";
import {
  createReplicaPersistence,
  type ReplicaPersistence,
} from "../replica/persistence";
import { sendToSiteLoginWhenGated } from "./site-gate";

/** What the screens reach the outside world through, so tests can fake it. */
export type AppServices = {
  api: ApiClient;
  persistence: Pick<ReplicaPersistence, "load" | "discardOthers" | "save">;
  createSource: (url: string) => EventSource;
};

export function defaultServices(): AppServices {
  const api = createApiClient({ baseUrl: window.location.origin });
  sendToSiteLoginWhenGated(api);
  return {
    api,
    persistence: createReplicaPersistence(),
    createSource: (url) => new EventSource(url),
  };
}
