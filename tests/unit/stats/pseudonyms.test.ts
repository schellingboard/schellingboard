import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { pseudonymize } from "@schellingboard/domain/stats/pseudonyms";

describe("pseudonymize", { tags: ["021-US1"] }, () => {
  it("sorts rows by value, highest first, and numbers them", () => {
    expect(
      pseudonymize([
        [1, 9],
        [5, 2],
        [5, 7],
      ])
    ).toEqual([
      { pseudonym: "P001", values: [5, 7] },
      { pseudonym: "P002", values: [5, 2] },
      { pseudonym: "P003", values: [1, 9] },
    ]);
  });

  it("pads to the width of the largest number", () => {
    const rows = Array.from({ length: 1000 }, (_, i) => [i]);
    const out = pseudonymize(rows);
    expect(out[0].pseudonym).toBe("P0001");
    expect(out[999].pseudonym).toBe("P1000");
  });

  it("property: the order does not depend on the input order", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.array(fc.integer({ min: 0, max: 5 }), {
            minLength: 2,
            maxLength: 2,
          }),
          { maxLength: 20 }
        ),
        (rows) => {
          expect(pseudonymize([...rows].reverse())).toEqual(pseudonymize(rows));
        }
      )
    );
  });
});
