import { AsyncLocalStorage } from "node:async_hooks";

const current = new AsyncLocalStorage<string>();

/** Runs `work` so that the changes it records carry `key` (ADR 0012, 0014). */
export function withCommandKey<T>(key: string, work: () => T): T {
  return current.run(key, work);
}

export function commandKey(): string | null {
  return current.getStore() ?? null;
}

// Subscribers start work of their own (the jobs pass), which must not carry the
// key of the request that happened to publish.
export function withoutCommandKey<T>(work: () => T): T {
  return current.exit(work);
}
