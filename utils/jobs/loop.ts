// The jobs loop: one per process, started from instrumentation.ts, doing
// everything that happens after a request has answered. See ADR 0011.
//
// The database and the jobs are imported inside a pass, not at the top of
// this module: Next compiles instrumentation.ts for the Edge runtime as well,
// and a static import would pull db/container — and with it better-sqlite3,
// `path` and `process.cwd()` — into a bundle that supports none of them. Each
// function holding such an import starts with the NEXT_RUNTIME check: Next
// inlines that variable per bundle, which makes the import dead code there.

import { nanoid } from "nanoid";
import {
  PRUNE_CHANGES,
  PRUNE_EVERY_MS,
  SESSION_NOTIFICATIONS,
  type Job,
} from "./job";

export type { Job };

const HEARTBEAT_MS = 5_000;
const LEASE_TTL_MS = 30_000;
const LEASE = "jobs";
const DEFAULT_REMINDER_INTERVAL_MS = 60_000;

export function defaultJobs(): Job[] {
  if (process.env.NEXT_RUNTIME !== "nodejs") return [];
  const configured = process.env.REMINDER_DISPATCH_INTERVAL_MS;
  const reminderMs =
    configured === undefined || configured === ""
      ? DEFAULT_REMINDER_INTERVAL_MS
      : Number(configured);
  const jobs: Job[] = [
    lazy(SESSION_NOTIFICATIONS, undefined, async () => {
      const { sessionNotifications } = await import("./reactions");
      return sessionNotifications;
    }),
    lazy(PRUNE_CHANGES, PRUNE_EVERY_MS, async () => {
      const { pruneChanges } = await import("./reactions");
      return pruneChanges;
    }),
  ];
  // 0 switches the reminders off, which is how a self-hoster turns them off
  // and how both E2E tiers keep stray reminders out of the mailbox.
  if (Number.isFinite(reminderMs) && reminderMs > 0) {
    jobs.push({
      name: "reminders",
      everyMs: reminderMs,
      run: async (now) => {
        const { dispatchDueReminders } =
          await import("@/utils/reminder-dispatch");
        const summary = await dispatchDueReminders(now);
        return summary.notified + summary.sent;
      },
    });
  }
  return jobs;
}

function lazy(
  name: string,
  everyMs: number | undefined,
  load: () => Promise<Job>
): Job {
  return { name, everyMs, run: async (now) => (await load()).run(now) };
}

type Loop = {
  jobs: Job[];
  heartbeatMs: number;
  owner: string;
  lastRun: Map<string, number>;
  timer: ReturnType<typeof setInterval>;
  running: boolean;
  nudged: boolean;
};

// Singletons need to be assigned to globalThis, not simply module-level
// variables. See https://github.com/vercel/next.js/discussions/68572.
const g = globalThis as typeof globalThis & { __jobsLoop?: Loop };

export function startJobsLoop(jobs: Job[] = defaultJobs()): void {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (g.__jobsLoop || jobs.length === 0) return;

  // eslint-disable-next-line no-restricted-syntax -- the loop runs outside any request, so there is no time-override cookie to read; the dev toolbar's button is how reminders meet the fake clock
  const started = Date.now();
  const periods = jobs.flatMap((job) => (job.everyMs ? [job.everyMs] : []));
  const heartbeatMs = Math.min(HEARTBEAT_MS, ...periods);
  const timer = setInterval(() => void pass(), heartbeatMs);
  timer.unref();
  g.__jobsLoop = {
    jobs,
    heartbeatMs,
    owner: nanoid(),
    lastRun: new Map(jobs.map((job) => [job.name, started])),
    timer,
    running: false,
    nudged: false,
  };
}

/**
 * Asks for a pass as soon as possible, after a request has committed
 * something the loop should act on. A no-op where no loop runs.
 */
export function nudgeJobs(): void {
  const loop = g.__jobsLoop;
  if (!loop) return;
  if (loop.running) {
    // The running pass may have read the log before this change was written.
    loop.nudged = true;
    return;
  }
  setTimeout(() => void pass(), 0);
}

/** For tests only. */
export function stopJobsLoop(): void {
  if (g.__jobsLoop) clearInterval(g.__jobsLoop.timer);
  delete g.__jobsLoop;
}

async function pass(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const loop = g.__jobsLoop;
  // A heartbeat during a slow pass is dropped: a slow mail server must not
  // stack passes.
  if (!loop || loop.running) return;
  loop.running = true;
  try {
    const { getRepositories } = await import("@/db/container");
    const { jobs } = getRepositories();
    for (const job of loop.jobs) {
      // eslint-disable-next-line no-restricted-syntax -- see startJobsLoop
      const now = new Date();
      const last = loop.lastRun.get(job.name) ?? 0;
      // Half a heartbeat of slack: timers and the wall clock drift apart, and
      // a tick a millisecond early must not cost a whole period.
      const due =
        now.getTime() - last + loop.heartbeatMs / 2 >= (job.everyMs ?? 0);
      if (!due) continue;
      // Renewed before every job, so a long pass cannot outlive its lease.
      if (!(await jobs.acquireLease(LEASE, loop.owner, now, LEASE_TTL_MS))) {
        return;
      }
      loop.lastRun.set(job.name, now.getTime());
      try {
        // Work done may mean more is waiting: a backlog drains pass after
        // pass rather than one batch per heartbeat.
        if ((await job.run(now)) > 0) loop.nudged = true;
      } catch (err) {
        console.error(`Job ${job.name} failed:`, err);
      }
    }
  } catch (err) {
    console.error("Jobs loop pass failed:", err);
  } finally {
    loop.running = false;
    if (loop.nudged) {
      loop.nudged = false;
      setTimeout(() => void pass(), 0);
    }
  }
}
