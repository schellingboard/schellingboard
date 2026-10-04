import createClient, { type ClientOptions } from "openapi-fetch";
import type { paths } from "./schema.ts";

export type { paths, components, operations } from "./schema.ts";

export function createApiClient(options: ClientOptions = {}) {
  return createClient<paths>(options);
}

export type ApiClient = ReturnType<typeof createApiClient>;
