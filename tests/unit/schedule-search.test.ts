import { describe, it, expect } from "vitest";

import { matchesInReadingOrder } from "@/utils/schedule-search";

describe("matchesInReadingOrder", () => {
  it("runs top to bottom, then left to right", () => {
    const found = [
      { id: "b", top: 100, left: 0 },
      { id: "c", top: 100, left: 200 },
      { id: "a", top: 0, left: 400 },
    ];
    expect(matchesInReadingOrder(found).map((f) => f.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("counts a session drawn in several rooms once, at its first room", () => {
    const found = [
      { id: "keynote", top: 0, left: 200 },
      { id: "keynote", top: 0, left: 0 },
      { id: "talk", top: 100, left: 0 },
    ];
    expect(matchesInReadingOrder(found)).toEqual([
      { id: "keynote", top: 0, left: 0 },
      { id: "talk", top: 100, left: 0 },
    ]);
  });
});
