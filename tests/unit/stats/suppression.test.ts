import { describe, expect, it } from "vitest";
import { suppressSmall } from "@schellingboard/domain/stats/suppression";

describe("suppressSmall", { tags: ["021-US1"] }, () => {
  it("keeps values shared by at least k people and folds the rest into Other", () => {
    expect(
      suppressSmall(["Berlin", "Berlin", "Berlin", "Paris", "Paris", "Oslo"], 3)
    ).toEqual([
      { value: "Berlin", count: 3 },
      { value: "Other", count: 3 },
    ]);
  });

  it("counts values case-insensitively and trimmed, showing the first spelling", () => {
    expect(suppressSmall(["Berlin", " berlin", "BERLIN"], 3)).toEqual([
      { value: "Berlin", count: 3 },
    ]);
  });

  it("sorts by count, then by value", () => {
    const out = suppressSmall(
      ["b", "b", "b", "a", "a", "a", "c", "c", "c", "c"],
      3
    );
    expect(out.map((o) => o.value)).toEqual(["c", "a", "b"]);
  });

  it("uses 3 as the default minimum group", () => {
    expect(suppressSmall(["a", "a", "b"])).toEqual([
      { value: "Other", count: 3 },
    ]);
  });

  it("folds a real value called other into the Other row and drops blanks", () => {
    expect(suppressSmall(["other", "other", "other", "x", " ", ""], 3)).toEqual(
      [{ value: "Other", count: 4 }]
    );
  });

  it("returns nothing for no values", () => {
    expect(suppressSmall([], 3)).toEqual([]);
  });
});
