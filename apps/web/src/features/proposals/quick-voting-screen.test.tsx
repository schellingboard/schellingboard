// @module-tag 005-US2
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { VoteChoice } from "@schellingboard/domain/vote";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Standing } from "../../queries/proposal-standings";
import { iso, snapshot as fixture } from "../../replica/snapshot-fixture";
import { NoticeProvider } from "../../ui/notices";
import { comment, fakeComments } from "../comments/comments-test-support";
import { proposalLinks } from "./links";
import { QuickVotingScreen } from "./quick-voting-screen";

afterEach(cleanup);

const proposal = (
  id: string,
  patch: Partial<Snapshot["proposals"][number]> = {}
): Snapshot["proposals"][number] => ({
  id,
  eventId: "e",
  title: `Idea ${id}`,
  description: `About ${id}`,
  durationMinutes: null,
  createdTime: iso(1),
  updatedTime: iso(1),
  hosts: [{ id: "host", name: "HOST" }],
  cohostWanted: false,
  cohostWantedNote: null,
  version: 1,
  ...patch,
});

const proposals = [
  proposal("a"),
  proposal("b"),
  proposal("c"),
  proposal("mine", { hosts: [{ id: "mia", name: "MIA" }] }),
];

const phases = {
  voting: {
    votingPhaseStart: iso(0),
    votingPhaseEnd: iso(20),
    schedulingPhaseStart: iso(20),
  },
  scheduling: {
    votingPhaseStart: iso(0),
    votingPhaseEnd: iso(5),
    schedulingPhaseStart: iso(5),
  },
};

const standing = (total: number): Standing => ({ tally: null, total });

const snapshotOf = (
  phase: keyof typeof phases,
  patch: Partial<Snapshot> = {}
): Snapshot => ({
  ...fixture,
  now: iso(10),
  event: { ...fixture.event, ...phases[phase] },
  proposals,
  me: { ...fixture.me!, guestId: "mia", votes: [] },
  guests: fixture.guests.map((g) => ({ ...g, member: true })),
  ...patch,
});

function setup(
  phase: keyof typeof phases,
  patch: Partial<Snapshot> = {},
  standings = new Map<string, Standing>(),
  standingsStatus: "idle" | "loading" | "ready" | "error" = "ready"
) {
  const onVote = vi.fn();
  const openComments = vi.fn(() => fakeComments([comment("c1")]));
  const element = (snapshot: Snapshot) => (
    <NoticeProvider>
      <QuickVotingScreen
        snapshot={snapshot}
        links={proposalLinks("conf")}
        now={new Date(iso(10))}
        localZone="UTC"
        standings={standings}
        standingsStatus={standingsStatus}
        onVote={onVote}
        comments={openComments}
      />
    </NoticeProvider>
  );
  const { rerender } = render(element(snapshotOf(phase, patch)));
  return {
    onVote,
    openComments,
    update: (next: Partial<Snapshot>) =>
      rerender(element(snapshotOf(phase, { ...patch, ...next }))),
  };
}

const heading = () => screen.getByRole("heading", { level: 1 }).textContent;

describe("quick voting", () => {
  it("names the event, links back and counts what is left", () => {
    setup("voting");

    expect(screen.getByText("Conf Quick Voting")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /Proposals/ }).getAttribute("href")
    ).toBe("/conf/proposals");
    expect(screen.getByText("You have voted on 0 / 3 proposals")).toBeTruthy();
  });

  it("shows the proposal with the fewest votes, never the viewer's own", () => {
    setup(
      "voting",
      {},
      new Map([
        ["a", standing(5)],
        ["b", standing(1)],
        ["c", standing(3)],
        ["mine", standing(0)],
      ])
    );

    expect(heading()).toBe("Idea b");
    expect(
      screen.getByRole("link", { name: "Idea b" }).getAttribute("href")
    ).toBe("/conf/proposals/quick-voting?viewProposal=b");
    expect(
      screen.getAllByRole("link", { name: "HOST" }).length
    ).toBeGreaterThan(0);
    expect(screen.getByText("About b")).toBeTruthy();
  });

  it("votes, then moves on to the next proposal", async () => {
    const { onVote, update } = setup(
      "voting",
      {},
      new Map([
        ["a", standing(1)],
        ["b", standing(2)],
        ["c", standing(3)],
      ])
    );

    await userEvent.click(
      screen.getByRole("button", { name: /❤️ Interested/ })
    );

    expect(onVote).toHaveBeenCalledWith("a", VoteChoice.interested);
    update({
      me: {
        ...fixture.me!,
        guestId: "mia",
        votes: [{ proposalId: "a", choice: VoteChoice.interested }],
      },
    });
    expect(heading()).toBe("Idea b");
    expect(screen.getByText("You have voted on 1 / 3 proposals")).toBeTruthy();
  });

  it("keeps the proposal being read when one with fewer votes arrives", () => {
    const { update } = setup(
      "voting",
      {},
      new Map([
        ["a", standing(1)],
        ["b", standing(2)],
        ["c", standing(3)],
      ])
    );
    expect(heading()).toBe("Idea a");

    update({ proposals: [...proposals, proposal("new")] });

    expect(heading()).toBe("Idea a");
  });

  it("says so when everything is voted on", () => {
    setup("voting", {
      me: {
        ...fixture.me!,
        guestId: "mia",
        votes: ["a", "b", "c"].map((proposalId) => ({
          proposalId,
          choice: VoteChoice.maybe,
        })),
      },
    });

    expect(screen.getByText(/You have voted on all proposals/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /❤️ Interested/ })).toBeNull();
  });

  it("asks a signed-out viewer to choose who they are", () => {
    setup("voting", { me: null });

    expect(screen.getByText("Please choose who you are first.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /❤️ Interested/ })).toBeNull();
  });

  it("explains why voting is unavailable outside the voting phase", async () => {
    const { onVote } = setup("scheduling");

    await userEvent.click(
      screen.getByRole("button", { name: /❤️ Interested/ })
    );

    expect(onVote).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toContain(
      "The voting phase is over"
    );
  });

  it("shows the proposal's comments, read only", async () => {
    const { openComments } = setup("voting");

    const section = within(
      await screen
        .findByRole("heading", { name: "1 comment" })
        .then((h) => h.closest("section")!)
    );
    expect(openComments).toHaveBeenCalledWith("a");
    expect(section.queryByPlaceholderText("Add a comment")).toBeNull();
    expect(section.queryByRole("button", { name: "Reply" })).toBeNull();
    expect(section.queryByRole("button", { name: "Like" })).toBeNull();
  });

  it("waits for the counts before offering a proposal", () => {
    setup("voting", {}, new Map(), "loading");
    expect(screen.queryByRole("button", { name: /❤️ Interested/ })).toBeNull();
    expect(screen.getByText("Loading proposals...")).toBeTruthy();
    cleanup();
    setup("voting", {}, new Map(), "error");
    expect(screen.getByRole("button", { name: /❤️ Interested/ })).toBeTruthy();
  });

  it("shows the comment times as plain text", async () => {
    setup("voting");
    await screen.findByRole("heading", { name: "1 comment" });
    expect(document.querySelector("time")!.closest("a")).toBeNull();
  });
});
