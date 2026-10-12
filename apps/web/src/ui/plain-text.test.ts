import { describe, it, expect } from "vitest";
import { plainText } from "./plain-text";

describe("plainText", () => {
  it("drops markdown markup, keeping the words", () => {
    expect(
      plainText(
        "# Title\n\nSome **bold** and _soft_ [link](https://x.org) `code`"
      )
    ).toBe("Title\nSome bold and soft link code");
  });

  it("keeps list items on their own lines without bullets", () => {
    expect(plainText("- one\n- two\n1. three")).toBe("one\ntwo\nthree");
  });

  it("is empty for nothing", () => {
    expect(plainText("")).toBe("");
  });
});
