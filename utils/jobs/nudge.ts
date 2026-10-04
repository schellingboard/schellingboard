// Requests and notification code nudge the jobs loop through this module, which
// imports nothing: the loop loads the jobs that call it, so importing the loop
// from them would make a cycle. The loop installs the handler when it starts.

const g = globalThis as typeof globalThis & { __jobsNudge?: () => void };

/**
 * Asks for a pass as soon as possible, after something the loop should act on
 * was committed. A no-op where no loop runs.
 */
export function nudgeJobs(): void {
  g.__jobsNudge?.();
}

export function setNudgeHandler(handler: (() => void) | undefined): void {
  g.__jobsNudge = handler;
}
