import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { iso, snapshot } from "../replica/snapshot-fixture";
import { open, running } from "./page-test-support";

afterEach(cleanup);

describe("the event address", { tags: ["007-US13"] }, () => {
  const before: Snapshot = {
    ...running,
    event: {
      ...snapshot.event,
      proposalPhaseStart: iso(0),
      proposalPhaseEnd: iso(20),
      schedulingPhaseStart: new Date(Date.UTC(2026, 6, 1)).toISOString(),
    },
  };
  const between: Snapshot = {
    ...before,
    event: { ...before.event, proposalPhaseEnd: iso(5) },
  };
  const phaseless: Snapshot = {
    ...running,
    event: {
      ...snapshot.event,
      proposalPhaseStart: null,
      proposalPhaseEnd: null,
      schedulingPhaseStart: null,
    },
  };

  it("moves to the schedule once scheduling has started, replacing the entry", async () => {
    const { router } = await open({ path: "/conf" });
    await waitFor(() =>
      expect(router.history.location.pathname).toBe("/conf/schedule")
    );
    expect(await screen.findByRole("link", { name: "Talk" })).toBeTruthy();
    expect(router.history.length).toBe(1);
  });

  it("moves to the schedule for an event with no phases", async () => {
    const { router } = await open({ path: "/conf", snapshot: phaseless });
    await waitFor(() =>
      expect(router.history.location.pathname).toBe("/conf/schedule")
    );
  });

  it("moves to the proposals before scheduling starts", async () => {
    const { router } = await open({ path: "/conf", snapshot: before });
    await waitFor(() =>
      expect(router.history.location.pathname).toBe("/conf/proposals")
    );
    expect(router.history.length).toBe(1);
  });

  it("keeps the search params and hash on the schedule, even before scheduling starts", async () => {
    const { router } = await open({
      path: "/conf?view=agenda&filter=hidden#comment-c1",
      snapshot: between,
    });
    await waitFor(() =>
      expect(router.history.location.pathname).toBe("/conf/schedule")
    );
    expect(router.history.location.search).toBe("?view=agenda&filter=hidden");
    expect(router.history.location.hash).toBe("#comment-c1");
  });
});
