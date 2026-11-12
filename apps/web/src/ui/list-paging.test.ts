import { describe, expect, it, vi } from "vitest";
import { pageOf, tableHandlers } from "./list-paging";

const rows = Array.from({ length: 120 }, (_, i) => i);
const at = (query: string) => pageOf(rows, new URLSearchParams(query));

describe("pageOf", { tags: ["016-US1"] }, () => {
  it("shows 25 rows unless a page size is asked for", () => {
    expect(at("").visible).toHaveLength(25);
    expect(at("pageSize=50").visible).toHaveLength(50);
    expect(at("pageSize=50&page=3").visible[0]).toBe(100);
    expect(at("pageSize=all").visible).toHaveLength(120);
    expect(at("pageSize=all&page=4").page).toBe(1);
  });

  it("ignores a page size that is not offered", () => {
    expect(at("pageSize=7").pageSize).toBe(25);
    expect(at("pageSize=nope").pageSize).toBe(25);
  });
});

describe("tableHandlers", { tags: ["016-US1"] }, () => {
  it("puts the page size in the address, omits the default and goes back to page 1", () => {
    const onParams = vi.fn();
    const { onPageSize } = tableHandlers(onParams);

    onPageSize(50);
    onPageSize(25);
    onPageSize("all");

    expect(onParams.mock.calls).toEqual([
      [{ pageSize: "50", page: null }, { push: true }],
      [{ pageSize: null, page: null }, { push: true }],
      [{ pageSize: "all", page: null }, { push: true }],
    ]);
  });
});
