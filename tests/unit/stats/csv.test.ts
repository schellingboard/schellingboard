import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { encodeCsv } from "@schellingboard/domain/stats/csv";

const cols = [{ label: "Title" }, { label: "RSVPs" }];

describe("encodeCsv", { tags: ["021-US2"] }, () => {
  it("starts with a BOM and ends rows with CRLF", () => {
    expect(encodeCsv(cols, [["Talk", 3]])).toBe(
      "\uFEFFTitle,RSVPs\r\nTalk,3\r\n"
    );
  });

  it("quotes commas, quotes and newlines (RFC 4180)", () => {
    expect(encodeCsv([{ label: "A" }], [['say "hi", ok'], ["a\nb"]])).toBe(
      '\uFEFFA\r\n"say ""hi"", ok"\r\n"a\nb"\r\n'
    );
  });

  it("writes nulls as empty cells and booleans as true/false", () => {
    expect(encodeCsv(cols, [[null, true]])).toBe(
      "\uFEFFTitle,RSVPs\r\n,true\r\n"
    );
  });

  it("guards text that a spreadsheet would run as a formula", () => {
    const out = encodeCsv(
      [{ label: "A" }],
      [["=SUM(A1)"], ["+1"], ["-1"], ["@x"], ["\tx"], ["\rx"]]
    );
    expect(out).toBe(
      "\uFEFFA\r\n'=SUM(A1)\r\n'+1\r\n'-1\r\n'@x\r\n'\tx\r\n\"'\rx\"\r\n"
    );
  });

  it("leaves negative numbers alone", () => {
    expect(encodeCsv([{ label: "A" }], [[-3]])).toBe("\uFEFFA\r\n-3\r\n");
  });

  it("guards header labels too", () => {
    expect(encodeCsv([{ label: "=x" }], [])).toBe("\uFEFF'=x\r\n");
  });

  it("property: a plain cell never starts with a formula character", () => {
    const plain = fc.stringMatching(/^[a-z=+@-]{1,6}$/);
    fc.assert(
      fc.property(fc.array(plain, { minLength: 1, maxLength: 5 }), (cells) => {
        const rows = encodeCsv(
          [{ label: "H" }],
          cells.map((c) => [c])
        )
          .slice(1)
          .split("\r\n");
        for (const cell of rows.slice(1, -1))
          expect(cell).not.toMatch(/^[=+@-]/);
      })
    );
  });
});
