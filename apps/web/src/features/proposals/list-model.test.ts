// @module-tag 004-US5
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { VoteChoice } from "@schellingboard/domain/vote";
import { describe, expect, it } from "vitest";
import type { Standing } from "../../queries/proposal-standings";
import { iso, snapshot } from "../../replica/snapshot-fixture";
import {
  defaultSort,
  listRows,
  phaseTexts,
  rowsFrom,
  sortOptions,
  type ListInput,
} from "./list-model";

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

const standings = new Map<string, Standing>();
const input = (
  proposals: Snapshot["proposals"],
  patch: Partial<ListInput> = {}
): ListInput => ({
  rows: rowsFrom({ ...snapshot, proposals }),
  guestId: "mia",
  votes: new Map(),
  standings,
  query: "",
  filter: undefined,
  sort: { key: "title", direction: "asc" },
  ...patch,
});
const ids = (i: ListInput) => listRows(i).map((r) => r.id);

describe("filtering", () => {
  const proposals = [
    proposal("mine", { hosts: [{ id: "mia", name: "Mia" }] }),
    proposal("voted", { hosts: [{ id: "x", name: "X" }] }),
    proposal("unvoted", {
      hosts: [{ id: "x", name: "X" }],
      cohostWanted: true,
    }),
    proposal("nohost"),
  ];
  const votes = new Map([["voted", VoteChoice.maybe]]);

  it("splits the proposals into mine, voted and unvoted", () => {
    const f = (filter: ListInput["filter"]) =>
      ids(input(proposals, { filter, votes }));
    expect(f("mine")).toEqual(["mine"]);
    expect(f("voted")).toEqual(["voted"]);
    expect(f("unvoted")).toEqual(["nohost", "unvoted"]);
    expect(f(undefined)).toHaveLength(4);
  });

  it("keeps only proposals wanting a host, and lets a signed-out viewer use that one only", () => {
    expect(ids(input(proposals, { filter: "hostWanted" }))).toEqual([
      "nohost",
      "unvoted",
    ]);
    expect(
      ids(input(proposals, { filter: "mine", guestId: null }))
    ).toHaveLength(4);
    expect(
      ids(input(proposals, { filter: "hostWanted", guestId: null }))
    ).toHaveLength(2);
  });
});

describe("searching", () => {
  const proposals = [
    proposal("a", { title: "Rust intro", description: "**Ownership** basics" }),
    proposal("b", { title: "Cooking", hosts: [{ id: "x", name: "Rustam" }] }),
    proposal("c", { title: "Gardening" }),
  ];

  it("matches title, host names and the plain text of the description", () => {
    expect(ids(input(proposals, { query: "rust" })).sort()).toEqual(["a", "b"]);
    expect(ids(input(proposals, { query: "Ownership basics" }))).toEqual(["a"]);
  });

  it("orders a search by relevance, not by the chosen sort", () => {
    const sort = { key: "title", direction: "desc" } as const;
    expect(ids(input(proposals, { query: "rust", sort }))[0]).toBe("a");
  });
});

describe("sorting", () => {
  const proposals = [
    proposal("a", { title: "B", durationMinutes: 60, updatedTime: iso(3) }),
    proposal("b", {
      title: "a",
      durationMinutes: null,
      updatedTime: iso(2),
      hosts: [{ id: "x", name: "Zed" }],
    }),
    proposal("c", {
      title: "C",
      durationMinutes: 30,
      updatedTime: iso(4),
      hosts: [{ id: "y", name: "Amy" }],
    }),
  ];
  const sorted = (
    key: ListInput["sort"]["key"],
    direction: "asc" | "desc" = "asc",
    patch: Partial<ListInput> = {}
  ) => ids(input(proposals, { sort: { key, direction }, ...patch }));

  it("sorts by title, ignoring case", () => {
    expect(sorted("title")).toEqual(["b", "a", "c"]);
    expect(sorted("title", "desc")).toEqual(["c", "a", "b"]);
  });

  it("sorts by duration, none counting as zero, and by update time", () => {
    expect(sorted("durationMinutes")).toEqual(["b", "c", "a"]);
    expect(sorted("updatedTime", "desc")).toEqual(["c", "a", "b"]);
  });

  it("puts proposals without hosts first when sorting by host", () => {
    expect(sorted("hosts")).toEqual(["a", "c", "b"]);
  });

  it("sorts by the viewer's vote, no vote last", () => {
    const votes = new Map([
      ["a", VoteChoice.skip],
      ["c", VoteChoice.interested],
    ]);
    expect(sorted("userVote", "asc", { votes })).toEqual(["c", "a", "b"]);
  });

  it("sorts by the vote count, or by the tally weighted by interest", () => {
    const s = new Map<string, Standing>([
      ["a", { tally: { interested: 2, maybe: 1 }, total: null }],
      ["b", { tally: { interested: 0, maybe: 1 }, total: null }],
      ["c", { tally: { interested: 1, maybe: 0 }, total: null }],
    ]);
    expect(sorted("votes", "asc", { standings: s })).toEqual(["b", "c", "a"]);
    const t = new Map<string, Standing>([
      ["a", { tally: null, total: 1 }],
      ["b", { tally: null, total: 5 }],
      ["c", { tally: null, total: 3 }],
    ]);
    expect(sorted("votesCount", "asc", { standings: t })).toEqual([
      "a",
      "c",
      "b",
    ]);
  });
});

describe("the sort the list starts with and offers", () => {
  const event = (patch: Partial<Snapshot["event"]>) => ({
    ...snapshot.event,
    ...patch,
  });
  const voting = event({
    votingPhaseStart: iso(0),
    votingPhaseEnd: iso(20),
    schedulingPhaseStart: iso(20),
  });
  const scheduling = event({
    votingPhaseStart: iso(0),
    votingPhaseEnd: iso(5),
    schedulingPhaseStart: iso(5),
  });
  const at = new Date(iso(10));

  it("starts with fewest votes while voting and recently updated otherwise", () => {
    expect(defaultSort(voting, at)).toEqual({
      key: "votesCount",
      direction: "asc",
    });
    expect(defaultSort(scheduling, at)).toEqual({
      key: "updatedTime",
      direction: "desc",
    });
  });

  it("offers fewest votes only while voting and votes only while scheduling", () => {
    const values = (e: Snapshot["event"]) =>
      sortOptions(e, at).map((o) => o.value);
    expect(values(voting)).toContain("votesCount-asc");
    expect(values(voting)).not.toContain("votes-asc");
    expect(values(scheduling)).toContain("votes-desc");
    expect(values(scheduling)).not.toContain("votesCount-asc");
    expect(sortOptions(voting, at)[0]).toEqual({
      value: "updatedTime-desc",
      label: "Recently updated",
    });
  });
});

describe("the phase texts", () => {
  const event = (patch: Partial<Snapshot["event"]>) => ({
    ...snapshot.event,
    ...patch,
  });
  const proposing = event({
    proposalPhaseStart: iso(0),
    votingPhaseStart: iso(20),
    schedulingPhaseStart: iso(30),
  });
  const at = new Date(iso(10));

  it("explains why voting is unavailable", () => {
    expect(phaseTexts(proposing, at, true, "UTC").voting).toMatch(
      /^Voting will be enabled at /
    );
    expect(
      phaseTexts(
        event({ votingPhaseStart: iso(0), schedulingPhaseStart: iso(5) }),
        at,
        true,
        "UTC"
      ).voting
    ).toBe("The voting phase is over");
    expect(
      phaseTexts(
        event({
          votingPhaseStart: iso(0),
          votingPhaseEnd: iso(20),
          schedulingPhaseStart: iso(20),
        }),
        at,
        false,
        "UTC"
      ).voting
    ).toBe("Select a user first");
  });

  it("explains why scheduling and proposing are unavailable", () => {
    expect(phaseTexts(proposing, at, true, "UTC").scheduling).toMatch(
      /^Scheduling will be enabled at /
    );
    expect(phaseTexts(proposing, at, false, "UTC").proposing).toBe(
      "Select a user first"
    );
    expect(
      phaseTexts(event({ schedulingPhaseStart: iso(5) }), at, true, "UTC")
        .proposing
    ).toBe("Proposal and voting phases are over");
  });
});
