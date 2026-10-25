// @module-tag 004-US5
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { VoteChoice } from "@schellingboard/domain/vote";
import { afterEach, describe, expect, it, vi } from "vitest";
import { iso, snapshot as fixture } from "../../replica/snapshot-fixture";
import { NoticeProvider } from "../../ui/notices";
import { legacyProposalLinks } from "./links";
import { ProposalsScreen } from "./proposals-screen";
import type { Standing } from "../../queries/proposal-standings";

afterEach(cleanup);

const proposal = (
  id: string,
  patch: Partial<Snapshot["proposals"][number]> = {}
): Snapshot["proposals"][number] => ({
  id,
  eventId: "e",
  title: `Idea ${id}`,
  description: null,
  durationMinutes: null,
  createdTime: iso(1),
  updatedTime: iso(1),
  hosts: [],
  cohostWanted: false,
  cohostWantedNote: null,
  version: 1,
  ...patch,
});

const proposals = [
  proposal("a", {
    title: "Rust intro",
    hosts: [{ id: "mia", name: "Mia" }],
    durationMinutes: 90,
  }),
  proposal("b", {
    title: "Cooking",
    hosts: [{ id: "x", name: "Xan" }],
    cohostWanted: true,
  }),
  proposal("c", { title: "Gardening" }),
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

function setup(
  phase: keyof typeof phases,
  patch: Partial<Snapshot> = {},
  standings = new Map<string, Standing>()
) {
  const onVote = vi.fn();
  const snapshot: Snapshot = {
    ...fixture,
    now: iso(10),
    event: { ...fixture.event, ...phases[phase] },
    proposals,
    me: { ...fixture.me!, guestId: "mia", votes: [] },
    guests: fixture.guests.map((g) => ({ ...g, member: true })),
    ...patch,
  };
  render(
    <NoticeProvider>
      <ProposalsScreen
        snapshot={snapshot}
        links={legacyProposalLinks("conf")}
        now={new Date(iso(10))}
        localZone="UTC"
        standings={standings}
        onVote={onVote}
      />
    </NoticeProvider>
  );
  return { onVote, table: screen.queryByRole("table") as HTMLElement };
}

const titles = (table: HTMLElement) =>
  within(table)
    .getAllByRole("row")
    .slice(1)
    .map((r) => within(r).getAllByRole("cell")[0].textContent);

describe("the proposals list", () => {
  it("names the event and links to adding, quick voting and the schedule", () => {
    setup("voting");

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      `${fixture.event.name}: Session Proposals`
    );
    expect(screen.getByRole("link", { name: /Add Proposal/ })).toHaveProperty(
      "pathname",
      "/legacy/conf/proposals/new"
    );
    expect(
      screen.getByRole("link", { name: /Go to Quick Voting!/ })
    ).toHaveProperty("pathname", "/legacy/conf/proposals/quick-voting");
    expect(
      screen.getByRole("link", { name: /View Schedule/ }).getAttribute("href")
    ).toBe("#");
  });

  it("disables the actions a signed-out viewer or the phase rules out", () => {
    setup("scheduling", { me: null });

    expect(
      screen.getByRole("link", { name: /Add Proposal/ }).getAttribute("href")
    ).toBe("#");
    expect(
      screen
        .getByRole("link", { name: /Go to Quick Voting!/ })
        .getAttribute("aria-disabled")
    ).toBe("true");
    expect(
      screen.getByRole("link", { name: /View Schedule/ }).getAttribute("href")
    ).toBe("/conf");
  });

  it("says so when there are no proposals", () => {
    setup("voting", { proposals: [] });

    expect(
      screen.getByRole("heading", { name: "No proposals yet" })
    ).toBeTruthy();
    expect(
      screen.getAllByRole("link", { name: "Add Proposal" }).length
    ).toBeGreaterThan(0);
  });

  it("starts with the fewest votes first while voting", () => {
    const standings = new Map<string, Standing>([
      ["a", { tally: null, total: 5 }],
      ["b", { tally: null, total: 1 }],
      ["c", { tally: null, total: 3 }],
    ]);
    const { table } = setup("voting", {}, standings);

    expect(titles(table)).toEqual(["Cooking", "Gardening", "Rust intro"]);
    expect(screen.getByLabelText<HTMLSelectElement>("Sort by").value).toBe(
      "votesCount-asc"
    );
  });

  it("sorts from the menu and from a column header", async () => {
    const { table } = setup("scheduling");
    await userEvent.selectOptions(screen.getByLabelText("Sort by"), "Title ↓");
    expect(titles(table)).toEqual(["Cooking", "Gardening", "Rust intro"]);

    await userEvent.click(
      within(table).getByRole("columnheader", { name: /Title/ })
    );
    expect(titles(table)).toEqual(["Rust intro", "Gardening", "Cooking"]);
  });

  it("filters to my proposals and clears the filter", async () => {
    const { table } = setup("voting");

    await userEvent.click(
      screen.getByRole("button", { name: "Filter to show only your proposals" })
    );
    expect(titles(table)).toEqual(["Rust intro"]);

    await userEvent.click(
      screen.getByRole("button", { name: "Clear all active filters" })
    );
    expect(titles(table)).toHaveLength(3);
  });

  it("filters to proposals that want a host, without a user too", async () => {
    const { table } = setup("voting", { me: null });

    await userEvent.click(
      screen.getByRole("button", {
        name: "Filter to show only proposals that want a host",
      })
    );

    expect(titles(table).sort()).toEqual(["Cooking", "Gardening"]);
  });

  it("searches, and then ignores the sort menu", async () => {
    const { table } = setup("voting");

    await userEvent.type(
      screen.getByPlaceholderText("Search proposals..."),
      "garden"
    );

    await waitFor(() => expect(titles(table)).toEqual(["Gardening"]));
    expect(screen.getByLabelText<HTMLSelectElement>("Sort by").disabled).toBe(
      true
    );

    await userEvent.type(
      screen.getByPlaceholderText("Search proposals..."),
      "zzzz"
    );
    expect(await within(table).findByText("No proposals found")).toBeTruthy();
  });

  it("counts a filter's proposals before the search narrows them", async () => {
    setup("voting", { me: null });
    await userEvent.click(
      screen.getByRole("button", {
        name: "Filter to show only proposals that want a host",
      })
    );
    await userEvent.type(
      screen.getByPlaceholderText("Search proposals..."),
      "garden"
    );

    await waitFor(() => expect(screen.getByText("(1 result)")).toBeTruthy());
    expect(
      screen.getByRole("button", {
        name: "Filter to show only proposals that want a host",
      }).textContent
    ).toContain("2");
  });

  it("says why a control is unavailable, to a screen reader and on a tap", async () => {
    const { onVote, table } = setup("voting", {
      event: {
        ...fixture.event,
        ...phases.voting,
        proposalPhaseStart: iso(0),
        votingPhaseStart: iso(20),
      },
    });
    const vote = within(
      within(table).getByRole("row", { name: /Cooking/ })
    ).getByRole("button", { name: "❤️" });

    expect(vote.getAttribute("aria-disabled")).toBe("true");
    expect(vote.getAttribute("aria-describedby")).toBeTruthy();
    await userEvent.click(vote);

    expect(onVote).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toMatch(/Voting/);
  });

  it("keeps a filter that has no reason to give inert and silent", async () => {
    setup("scheduling", { me: null });
    const filter = screen.getByRole("button", {
      name: "Filter to show only your proposals",
    });

    await userEvent.click(filter);

    expect(filter.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("status").textContent).toContain(
      "Select a user first"
    );
  });

  it("lets a guest vote, change and withdraw, but not on their own proposal", async () => {
    const own = setup("voting", {
      me: {
        ...fixture.me!,
        guestId: "mia",
        votes: [{ proposalId: "b", choice: VoteChoice.maybe }],
      },
    });
    const rowOf = (title: string) =>
      within(own.table).getByRole("row", { name: new RegExp(title) });

    expect(
      within(rowOf("Rust intro")).queryByRole("button", { name: "❤️" })
    ).toBeNull();
    await userEvent.click(
      within(rowOf("Cooking")).getByRole("button", { name: "❤️" })
    );
    await userEvent.click(
      within(rowOf("Cooking")).getByRole("button", { name: "⭐" })
    );

    expect(own.onVote.mock.calls).toEqual([
      ["b", VoteChoice.interested],
      ["b", null],
    ]);
    expect(
      within(rowOf("Cooking"))
        .getByRole("button", { name: "⭐" })
        .getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("does not vote outside the voting phase", () => {
    const { onVote, table } = setup("scheduling");
    expect(within(table).queryByRole("button", { name: "❤️" })).toBeNull();
    expect(onVote).not.toHaveBeenCalled();
  });

  it("shows the tally and the viewer's vote from the scheduling phase on", () => {
    const standings = new Map<string, Standing>([
      ["b", { tally: { interested: 3, maybe: 1 }, total: null }],
    ]);
    const { table } = setup(
      "scheduling",
      {
        me: {
          ...fixture.me!,
          guestId: "mia",
          votes: [{ proposalId: "b", choice: VoteChoice.maybe }],
        },
      },
      standings
    );

    const row = within(table).getByRole("row", { name: /Cooking/ });
    expect(within(row).getByTitle("3 interested votes")).toBeTruthy();
    expect(within(row).getByTitle("1 maybe vote")).toBeTruthy();
    expect(within(row).getByTitle("Maybe").textContent).toBe("⭐");
    const other = within(table).getByRole("row", { name: /Gardening/ });
    expect(within(other).getByTitle("No vote").textContent).toBe("-");
  });

  it("offers Edit and Schedule to hosts and for proposals nobody hosts", () => {
    const { table } = setup("scheduling");

    const mine = within(table).getByRole("row", { name: /Rust intro/ });
    expect(
      within(mine).getByRole("link", { name: "Edit" }).getAttribute("href")
    ).toBe("/legacy/conf/proposals/a/edit");
    expect(
      within(mine).getByRole("link", { name: "Schedule" }).getAttribute("href")
    ).toBe("/legacy/conf/add-session?proposalID=a");
    expect(
      within(within(table).getByRole("row", { name: /Cooking/ })).queryByRole(
        "link",
        { name: "Edit" }
      )
    ).toBeNull();
    expect(
      within(within(table).getByRole("row", { name: /Gardening/ })).getByRole(
        "link",
        { name: "Edit" }
      )
    ).toBeTruthy();
  });

  it("shows hosts, co-host wanted and the duration without the break", () => {
    const { table } = setup("voting", {
      event: { ...fixture.event, ...phases.voting, breakMinutes: 30 },
    });

    const mine = within(table).getByRole("row", { name: /Rust intro/ });
    expect(
      within(mine).getByRole("link", { name: "Mia" }).getAttribute("href")
    ).toBe("/legacy/guests/mia");
    expect(within(mine).getByText("1h")).toBeTruthy();
    expect(
      within(within(table).getByRole("row", { name: /Cooking/ })).getByText(
        "Co-host wanted"
      )
    ).toBeTruthy();
    expect(
      within(within(table).getByRole("row", { name: /Gardening/ })).getByText(
        "No host yet"
      )
    ).toBeTruthy();
  });
});
