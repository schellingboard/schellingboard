import type { Job } from "@/utils/jobs/loop";
import { REACTIONS } from "@/utils/jobs/reactions";

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
export async function runJobs(
  now = new Date("2026-01-01T00:00:00.000Z")
): Promise<void> {
  await runUntilIdle(REACTIONS, now);
}
