import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const acquireLease = vi.fn();
vi.mock("@/db/container", () => ({
  getRepositories: () => ({ jobs: { acquireLease } }),
}));
vi.mock("@/utils/reminder-dispatch", () => ({
  dispatchDueReminders: vi.fn(),
}));

import { dispatchDueReminders } from "@/utils/reminder-dispatch";
import {
  defaultJobs,
  nudgeJobs,
  startJobsLoop,
  stopJobsLoop,
  type Job,
} from "@/utils/jobs/loop";

function job(
  name: string,
  everyMs?: number
): Job & { run: ReturnType<typeof vi.fn> } {
  return { name, everyMs, run: vi.fn().mockResolvedValue(0) };
}

describe("jobs loop", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("NEXT_RUNTIME", "nodejs");
    acquireLease.mockReset().mockResolvedValue(true);
  });

  afterEach(() => {
    stopJobsLoop();
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("runs a periodic job once per period", async () => {
    const reminders = job("reminders", 1000);
    startJobsLoop([reminders]);
    expect(reminders.run).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1000);
    expect(reminders.run).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2000);
    expect(reminders.run).toHaveBeenCalledTimes(3);
  });

  it("runs every job right away when nudged", async () => {
    const work = job("work");
    startJobsLoop([work]);

    nudgeJobs();
    await vi.advanceTimersByTimeAsync(0);
    expect(work.run).toHaveBeenCalledTimes(1);
  });

  it("does nothing on a nudge before the loop has started", async () => {
    nudgeJobs();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(acquireLease).not.toHaveBeenCalled();
  });

  it("runs one more pass for nudges that arrive during a pass", async () => {
    let finish = () => {};
    const work = job("work");
    work.run.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = () => resolve(0);
      })
    );
    startJobsLoop([work]);
    nudgeJobs();
    await vi.advanceTimersByTimeAsync(0);

    // The running pass may already have read past these changes.
    nudgeJobs();
    nudgeJobs();
    finish();
    await vi.advanceTimersByTimeAsync(0);
    expect(work.run).toHaveBeenCalledTimes(2);
  });

  it("leaves periodic jobs alone on a nudge until they are due", async () => {
    const reminders = job("reminders", 60_000);
    startJobsLoop([reminders]);

    nudgeJobs();
    await vi.advanceTimersByTimeAsync(0);
    expect(reminders.run).not.toHaveBeenCalled();
  });

  it("starts only one loop however often it is called", async () => {
    const reminders = job("reminders", 1000);
    startJobsLoop([reminders]);
    startJobsLoop([reminders]);
    startJobsLoop([reminders]);

    await vi.advanceTimersByTimeAsync(1000);
    expect(reminders.run).toHaveBeenCalledTimes(1);
  });

  it("starts nothing outside the nodejs runtime", async () => {
    vi.stubEnv("NEXT_RUNTIME", "edge");
    const reminders = job("reminders", 1000);
    startJobsLoop([reminders]);

    await vi.advanceTimersByTimeAsync(10_000);
    expect(reminders.run).not.toHaveBeenCalled();
  });

  it("leaves the work to whichever process holds the lease", async () => {
    acquireLease.mockResolvedValue(false);
    const reminders = job("reminders", 1000);
    startJobsLoop([reminders]);

    await vi.advanceTimersByTimeAsync(5000);
    expect(reminders.run).not.toHaveBeenCalled();
  });

  it("does not stack passes while one is still in flight", async () => {
    let finish = () => {};
    const slow = job("slow", 1000);
    slow.run.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = () => resolve(0);
      })
    );
    startJobsLoop([slow]);

    // A slow mail server must not stack three runs.
    await vi.advanceTimersByTimeAsync(3000);
    expect(slow.run).toHaveBeenCalledTimes(1);

    finish();
    await vi.advanceTimersByTimeAsync(1000);
    expect(slow.run).toHaveBeenCalledTimes(2);
  });

  it("logs a failing job and still runs the others", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const failing = job("failing", 1000);
    failing.run.mockRejectedValue(new Error("database is locked"));
    const other = job("other", 1000);
    startJobsLoop([failing, other]);

    // A throwing job must never take the web server down with it.
    await vi.advanceTimersByTimeAsync(1000);
    expect(logged).toHaveBeenCalled();
    expect(other.run).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(failing.run).toHaveBeenCalledTimes(2);
  });

  describe("defaultJobs", { tags: ["001-US2b"] }, () => {
    it("dispatches reminders every REMINDER_DISPATCH_INTERVAL_MS", async () => {
      vi.stubEnv("REMINDER_DISPATCH_INTERVAL_MS", "1000");
      vi.mocked(dispatchDueReminders).mockResolvedValue({
        notified: 2,
        sent: 1,
        skipped: 5,
        failed: 0,
        abandoned: 0,
      });
      const reminders = defaultJobs().find((j) => j.name === "reminders");
      expect(reminders?.everyMs).toBe(1000);

      const at = new Date("2026-06-01T10:00:00.000Z");
      expect(await reminders?.run(at)).toBe(3);
      expect(dispatchDueReminders).toHaveBeenCalledWith(at);
    });

    it("leaves reminders out when the interval is 0", () => {
      vi.stubEnv("REMINDER_DISPATCH_INTERVAL_MS", "0");
      expect(defaultJobs().map((j) => j.name)).not.toContain("reminders");
    });
  });
});
