import { createApiClient, type ApiClient } from "@schellingboard/api-client";
import {
  createReplicaPersistence,
  type ReplicaPersistence,
} from "../replica/persistence";

/** What the screens reach the outside world through, so tests can fake it. */
export type AppServices = {
  api: ApiClient;
  persistence: Pick<ReplicaPersistence, "load" | "discardOthers" | "save">;
  createSource: (url: string) => EventSource;
};

export function defaultServices(): AppServices {
  return {
    api: createApiClient({ baseUrl: window.location.origin }),
    persistence: createReplicaPersistence(),
    createSource: (url) => new EventSource(url),
  };
}
