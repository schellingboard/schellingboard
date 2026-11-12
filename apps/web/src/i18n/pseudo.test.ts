import { describe, expect, it } from "vitest";
import { expandMessages } from "./pseudo";

describe("expandMessages", { tags: ["022-US1"] }, () => {
  it("pads plain text by about a third", () => {
    const out = expandMessages({ a: "Save all sessions" }).a as string;
    expect(out.startsWith("Save all sessions")).toBe(true);
    expect(out.length).toBeGreaterThanOrEqual(22);
  });

  it("keeps placeholders in place and pads the text around them", () => {
    const out = expandMessages({ a: ["Hello ", ["name"], ", welcome"] }).a;
    expect(out).toEqual([
      "Hello ",
      ["name"],
      expect.stringMatching(/^, welcome~+$/),
    ]);
  });
});
