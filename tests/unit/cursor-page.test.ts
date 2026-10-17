import { describe, expect, it } from "vitest";
import { pageOf } from "@/server/http/pagination";

const items = [
  { id: "b", n: 2 },
  { id: "a", n: 1 },
];
const cursorOf = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");
const read = (cursor: string) =>
  pageOf(items, { limit: 10, cursor }, "things", (i) => [i.n, i.id]);

describe("pageOf", () => {
  it("continues after a cursor of its own list and key shape", () => {
    expect(read(cursorOf(["things", 1, "a"]))).toEqual({
      ok: true,
      value: { items: [items[0]], nextCursor: null },
    });
  });

  it.each([
    ["another list", ["others", 1, "a"]],
    ["a shorter key", ["things", 1]],
    ["other types", ["things", "1", "a"]],
    ["no list", [1, "a"]],
  ])("refuses a cursor with %s", (_case, value) => {
    expect(read(cursorOf(value))).toMatchObject({
      ok: false,
      error: { code: "cursor.invalid" },
    });
  });
});
