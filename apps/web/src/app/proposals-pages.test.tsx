import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { FakeCall } from "../commands/fake-api";
import { iso, snapshot } from "../replica/snapshot-fixture";
import { open, running } from "./page-test-support";

vi.mock("./hard-navigate", () => ({
  hardNavigate: vi.fn(),
  hardReload: vi.fn(),
}));

afterEach(cleanup);
beforeEach(() => {
  Element.prototype.scrollTo = vi.fn() as never;
});

const proposal = (id: string, title: string, hosts: string[] = ["host"]) => ({
  id,
  eventId: "e",
  title,
  description: "About it",
  durationMinutes: 60,
  createdTime: iso(1),
  updatedTime: iso(1),
  hosts: hosts.map((h) => ({ id: h, name: h.toUpperCase() })),
  cohostWanted: false,
  cohostWantedNote: null,
  version: 3,
});

const voting: Snapshot = {
  ...running,
  event: {
    ...snapshot.event,
    proposalPhaseStart: iso(0),
    proposalPhaseEnd: iso(5),
    votingPhaseStart: iso(5),
    votingPhaseEnd: iso(20),
    schedulingPhaseStart: iso(20),
  },
  guests: snapshot.guests.map((g) => ({ ...g, member: true })),
  proposals: [proposal("p", "Rust intro"), proposal("q", "Cooking")],
};

const answers = (call: FakeCall): Response | undefined => {
  if (call.path.startsWith("/api/v1/proposals?"))
    return Response.json({ items: [], nextCursor: null });
  if (call.method === "POST" && call.path === "/api/v1/proposals")
    return Response.json(proposal("new", "Fresh idea", ["mia"]), {
      status: 201,
    });
  return undefined;
};

const phase = (patch: Partial<Snapshot> = {}) => ({
  snapshot: { ...voting, ...patch },
  handler: answers,
});

describe("the proposals pages", { tags: ["004-US4"] }, () => {
  it("lists the proposals", async () => {
    await open({ ...phase(), path: "/conf/proposals" });

    expect(
      await screen.findByRole("heading", { name: "Conf: Session Proposals" })
    ).toBeTruthy();
    expect(screen.getAllByText("Rust intro").length).toBeGreaterThan(0);
  });

  it("opens a proposal on a new history entry, which Back closes", async () => {
    const { router } = await open({ ...phase(), path: "/conf/proposals" });

    await userEvent.click(
      (await screen.findAllByRole("link", { name: "Rust intro" }))[0]
    );

    expect(
      await screen.findByRole("dialog", { name: "Proposal details" })
    ).toBeTruthy();
    expect(router.history.location.search).toBe("?viewProposal=p");
    router.history.back();
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Proposal details" })
      ).toBeNull()
    );
  });

  it("closes a proposal reached by its address in place", async () => {
    const { router } = await open({
      ...phase(),
      path: "/conf/proposals?viewProposal=p",
    });

    await userEvent.click(await screen.findByRole("button", { name: "Close" }));

    await waitFor(() => expect(router.history.location.search).toBe(""));
    expect(router.history.location.pathname).toBe("/conf/proposals");
  });

  it("shows quick voting", async () => {
    await open({ ...phase(), path: "/conf/proposals/quick-voting" });

    expect(await screen.findByText(/Quick Voting/)).toBeTruthy();
  });
});

describe("the proposal form pages", { tags: ["004-US1"] }, () => {
  it("adds a proposal and returns to the list", async () => {
    const { calls, router } = await open({
      ...phase(),
      path: "/conf/proposals",
    });

    await userEvent.click(
      await screen.findByRole("link", { name: /Add Proposal/ })
    );
    await userEvent.type(await screen.findByLabelText(/Title/), "Fresh idea");
    await userEvent.click(screen.getByRole("button", { name: /Submit/ }));

    await waitFor(() =>
      expect(router.history.location.pathname).toBe("/conf/proposals")
    );
    expect(
      calls.some((c) => c.method === "POST" && c.path === "/api/v1/proposals")
    ).toBe(true);
  });

  it(
    "edits the proposal named in the address",
    { tags: ["004-US2"] },
    async () => {
      await open({
        ...phase({ me: { ...snapshot.me!, guestId: "host" } }),
        path: "/conf/proposals/p/edit",
      });

      expect(
        await screen.findByRole("heading", { name: "Edit Session Proposal" })
      ).toBeTruthy();
      expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
        "Rust intro"
      );
    }
  );

  it(
    "keeps one replica and runner across the event's screens",
    { tags: ["005-US2"] },
    async () => {
      const { calls, sources, router } = await open({
        ...phase(),
        path: "/conf/proposals",
      });
      await screen.findByRole("heading", { name: "Conf: Session Proposals" });

      router.history.push("/conf/proposals/quick-voting");
      await screen.findByRole("button", { name: /Interested/ });

      expect(
        calls.filter((c) => c.path === "/api/v1/events/conf/snapshot")
      ).toHaveLength(1);
      expect(sources).toHaveLength(1);
      expect(sources[0].closed).toBe(false);
    }
  );
});
