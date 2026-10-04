import type { Job } from "@/utils/jobs/loop";
import { deliveries } from "@/utils/jobs/deliveries";
import { REACTIONS } from "@/utils/jobs/reactions";

const START = new Date("2026-01-01T00:00:00.000Z");

async function runUntilIdle(jobs: Job[], now: Date): Promise<void> {
  for (let round = 0; round < 100; round++) {
    let handled = 0;
    for (const job of jobs) handled += await job.run(now);
    if (handled === 0) return;
  }
  throw new Error("Jobs still had work after 100 rounds");
}

/**
 * Does what the jobs loop would do after a request: tests start no loop, so
 * anything a request leaves to it happens when the test calls this.
 */
export async function runJobs(now = START): Promise<void> {
  await runUntilIdle([...REACTIONS, deliveries], now);
}

/**
 * Sends what notification code has queued, without reacting to the change
 * log: for tests that call a notify function themselves.
 */
export async function deliverQueued(now = START): Promise<void> {
  await runUntilIdle([deliveries], now);
}
