// @module-tag 011-US3
import { describe, expect, it } from "vitest";
import type { DirectoryEntry } from "../../queries/directory";
import { cardsFrom, directoryView, withParams } from "./directory-model";

const entry = (
  name: string,
  patch: Partial<DirectoryEntry> = {}
): DirectoryEntry => ({
  id: name.toLowerCase(),
  name,
  aboutMe: null,
  avatarUrl: null,
  pronouns: null,
  basedIn: null,
  prompts: null,
  languages: null,
  contacts: null,
  profileUpdatedAt: null,
  version: 1,
  isHost: false,
  openToMeetings: false,
  ...patch,
});

const now = new Date("2026-05-10T10:00:00Z");
const cards = cardsFrom(
  [
    entry("Cy", { aboutMe: "Into **bees**", isHost: true }),
    entry("Al", { openToMeetings: true }),
    entry("Bo", { profileUpdatedAt: new Date("2026-05-09T10:00:00Z") }),
  ],
  now
);
const view = (query: string, meetingsEnabled = true) =>
  directoryView({
    cards,
    params: new URLSearchParams(query),
    meetingsEnabled,
    seed: "s",
  });
const names = (query: string, meetingsEnabled?: boolean) =>
  view(query, meetingsEnabled).rows.map((r) => r.name);

describe("the directory view", () => {
  it("derives the excerpt, the profile flag and the update time", () => {
    const [cy, , bo] = cards;
    expect(cy).toMatchObject({ hasProfile: true, excerpt: "Into bees" });
    expect(bo.profileUpdated).toBe("yesterday");
  });

  it("lists by name unless asked otherwise", () => {
    expect(names("")).toEqual(["Al", "Bo", "Cy"]);
    expect(names("sort=updated")).toEqual(["Bo", "Al", "Cy"]);
    expect(names("sort=nonsense")).toEqual(["Al", "Bo", "Cy"]);
  });

  it("narrows by search and by every active filter", () => {
    expect(names("q=bees")).toEqual(["Cy"]);
    expect(names("filter=isHost")).toEqual(["Cy"]);
    expect(names("filter=hasProfile")).toEqual(["Cy"]);
    expect(names("filter=openToMeetings")).toEqual(["Al"]);
    expect(names("filter=isHost,openToMeetings")).toEqual([]);
  });

  it("offers the 1-on-1 filter only while meetings are on", () => {
    expect(view("", false).available.map((f) => f.value)).toEqual([
      "isHost",
      "hasProfile",
    ]);
    expect(names("filter=openToMeetings", false)).toEqual(["Al", "Bo", "Cy"]);
  });
});

describe("withParams", () => {
  it("sets, replaces and removes keys", () => {
    const next = withParams(new URLSearchParams("q=a&sort=updated"), {
      q: "b",
      sort: null,
      filter: "isHost",
    });
    expect(next.toString()).toBe("q=b&filter=isHost");
  });
});
