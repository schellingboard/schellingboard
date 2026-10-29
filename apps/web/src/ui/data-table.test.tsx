import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DataTable,
  searchParamUpdates,
  type DataTableProps,
} from "./data-table";

afterEach(cleanup);

type Row = { id: string; name: string };
const rows: Row[] = [
  { id: "a", name: "Ada" },
  { id: "b", name: "Bo" },
];

const setup = (props: Record<string, unknown> = {}) => {
  const onSearch = vi.fn();
  const onPage = vi.fn();
  const all = {
    rows,
    rowKey: (r: Row) => r.id,
    total: 2,
    page: 1,
    pageSize: 10,
    searchQuery: "",
    onSearch,
    onPage,
    columns: [{ header: "Name", cell: (r: Row) => r.name }],
    mobileCard: (r: Row) => <span>{r.name} card</span>,
    ...props,
  };
  render(<DataTable {...(all as DataTableProps<Row>)} />);
  return { onSearch, onPage };
};

describe("DataTable", { tags: ["015-US1"] }, () => {
  it("shows a column per field and a card per row for narrow screens", () => {
    setup();

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Ada" })).toBeTruthy();
    expect(screen.getByText("Bo card")).toBeTruthy();
    expect(screen.getByText("2 results")).toBeTruthy();
    expect(screen.getByText("Page 1 of 1")).toBeTruthy();
  });

  it("shows the empty message when there are no rows", () => {
    setup({ rows: [], total: 0, emptyMessage: "No guests." });

    expect(screen.getByText("No guests.")).toBeTruthy();
    expect(screen.getByText("0 results")).toBeTruthy();
  });

  it("searches after a pause, trimmed", async () => {
    const user = userEvent.setup();
    const { onSearch } = setup();

    await user.type(screen.getByRole("searchbox", { name: "Search" }), " ad ");
    expect(onSearch).not.toHaveBeenCalled();

    await waitFor(() =>
      expect(onSearch).toHaveBeenCalledWith("ad", { replace: false })
    );
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it("replaces the history entry when refining a search, not when starting or clearing", async () => {
    const user = userEvent.setup();
    const { onSearch } = setup({ searchQuery: "ad" });

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "a");
    await waitFor(() =>
      expect(onSearch).toHaveBeenLastCalledWith("ada", { replace: true })
    );
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onSearch).toHaveBeenLastCalledWith("", { replace: false });
    expect(searchParamUpdates("")).toEqual({ q: null, page: null });
    expect(searchParamUpdates("x")).toEqual({ q: "x", page: null });
  });

  it("pages with Prev and Next, disabled at the ends", async () => {
    const user = userEvent.setup();
    const { onPage } = setup({ total: 25, page: 2, pageSize: 10 });

    await user.click(screen.getByRole("button", { name: "Next page" }));
    await user.click(screen.getByRole("button", { name: "Previous page" }));

    expect(onPage.mock.calls).toEqual([[3], [1]]);
    cleanup();
    setup({ total: 25, page: 3, pageSize: 10 });
    expect(
      screen.getByRole("button", { name: "Next page" }).hasAttribute("disabled")
    ).toBe(true);
  });

  it("selects rows and all rows on the page", async () => {
    const user = userEvent.setup();
    const onToggleRow = vi.fn();
    const onToggleAllOnPage = vi.fn();
    setup({
      selection: {
        selectedKeys: new Set(["a"]),
        onToggleRow,
        onToggleAllOnPage,
        rowLabel: (r: Row) => r.name,
      },
    });

    await user.click(screen.getAllByRole("checkbox", { name: "Select Bo" })[0]);
    await user.click(screen.getByRole("checkbox", { name: "Select all" }));

    expect(onToggleRow).toHaveBeenCalledWith("b");
    expect(onToggleAllOnPage).toHaveBeenCalledWith(["a", "b"], true);
  });

  it("renders list items on every viewport in list mode, and hides the footer when asked", () => {
    setup({
      columns: undefined,
      mobileCard: undefined,
      listItem: (r: Row) => <span>{r.name} item</span>,
      paginationFooter: "when-paginated",
    });

    expect(screen.getByText("Ada item")).toBeTruthy();
    expect(screen.queryByText("2 results")).toBeNull();
  });
});
