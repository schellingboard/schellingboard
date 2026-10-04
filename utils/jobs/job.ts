export type Job = {
  name: string;
  /** Run at most once per this many ms; on every pass when unset. */
  everyMs?: number;
  /** How many items it handled: 0 tells the caller it is idle. */
  run: (now: Date) => Promise<number>;
};

// Named here rather than in each job's module, which the loop only imports
// lazily (see loop.ts).
export const SESSION_NOTIFICATIONS = "session-notifications";
export const DELIVERIES = "deliveries";
export const PRUNE_CHANGES = "prune-changes";
export const PRUNE_DELIVERIES = "prune-deliveries";
export const PRUNE_EVERY_MS = 60 * 60 * 1000;
