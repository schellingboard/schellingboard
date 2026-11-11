import { describe, expect, it, vi } from "vitest";
import { pageOf, showsPager, tableHandlers } from "./list-paging";

const rows = Array.from({ length: 120 }, (_, i) => i);
const at = (query: string) => pageOf(rows, new URLSearchParams(query));

describe("pageOf", { tags: ["016-US1"] }, () => {
  it("shows 50 rows unless a page size is asked for", () => {
    expect(at("").visible).toHaveLength(50);
    expect(at("pageSize=25").visible).toHaveLength(25);
    expect(at("pageSize=25&page=3").visible[0]).toBe(50);
    expect(at("pageSize=all").visible).toHaveLength(120);
    expect(at("pageSize=all&page=4").page).toBe(1);
  });

  it("clamps a page beyond the end and one below the start", () => {
    expect(at("page=99").page).toBe(3);
    expect(at("page=99").visible[0]).toBe(100);
    expect(at("page=0").page).toBe(1);
    expect(at("page=-2").page).toBe(1);
    expect(pageOf([], new URLSearchParams("page=5")).page).toBe(1);
  });

  it("ignores a page size that is not offered", () => {
    expect(at("pageSize=7").pageSize).toBe(50);
    expect(at("pageSize=nope").pageSize).toBe(50);
    expect(at("pageSize=10").pageSize).toBe(50);
  });
});

describe("tableHandlers", { tags: ["016-US1"] }, () => {
  it("puts the page size in the address, omits the default and goes back to page 1", () => {
    const onParams = vi.fn();
    const { onPageSize } = tableHandlers(onParams);

    onPageSize(25);
    onPageSize(50);
    onPageSize("all");

    expect(onParams.mock.calls).toEqual([
      [{ pageSize: "25", page: null }, { push: true }],
      [{ pageSize: null, page: null }, { push: true }],
      [{ pageSize: "all", page: null }, { push: true }],
    ]);
  });
});

describe("showsPager", { tags: ["016-US1"] }, () => {
  it("needs rows, and more than one page or a chosen size", () => {
    expect(showsPager(at(""))).toBe(true);
    expect(showsPager(pageOf([1, 2], new URLSearchParams()))).toBe(false);
    expect(showsPager(pageOf([1, 2], new URLSearchParams("pageSize=25")))).toBe(
      true
    );
    expect(showsPager(pageOf([], new URLSearchParams("pageSize=25")))).toBe(
      false
    );
  });
});
