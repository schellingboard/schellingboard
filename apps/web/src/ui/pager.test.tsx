import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pager, pageWindow } from "./pager";

afterEach(cleanup);

describe("pageWindow", { tags: ["016-US1"] }, () => {
  it("lists every page when there are few", () => {
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageWindow(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("keeps the first and last page and the neighbours of the current one", () => {
    expect(pageWindow(1, 20)).toEqual([1, 2, 3, 4, 5, "…", 20]);
    expect(pageWindow(4, 20)).toEqual([1, 2, 3, 4, 5, "…", 20]);
    expect(pageWindow(10, 20)).toEqual([1, "…", 9, 10, 11, "…", 20]);
    expect(pageWindow(17, 20)).toEqual([1, "…", 16, 17, 18, 19, 20]);
    expect(pageWindow(20, 20)).toEqual([1, "…", 16, 17, 18, 19, 20]);
  });
});

describe("Pager", { tags: ["016-US1"] }, () => {
  const setup = (props: Partial<Parameters<typeof Pager>[0]> = {}) => {
    const onPage = vi.fn();
    const onPageSize = vi.fn();
    render(
      <Pager
        page={5}
        totalPages={20}
        pageSize={10}
        total={200}
        onPage={onPage}
        onPageSize={onPageSize}
        {...props}
      />
    );
    return { onPage, onPageSize };
  };

  it("jumps to the first, last and a numbered page", async () => {
    const user = userEvent.setup();
    const { onPage } = setup({ page: 10 });

    await user.click(screen.getByRole("button", { name: "First page" }));
    await user.click(screen.getByRole("button", { name: "Last page" }));
    await user.click(screen.getByRole("button", { name: "Page 11" }));

    expect(onPage.mock.calls).toEqual([[1], [20], [11]]);
    expect(
      screen
        .getByRole("button", { name: "Page 10" })
        .getAttribute("aria-current")
    ).toBe("page");
  });

  it("disables going back on the first page and forward on the last", () => {
    const disabled = (name: string) =>
      screen.getByRole("button", { name }).hasAttribute("disabled");
    setup({ page: 1 });
    expect(["First page", "Previous page"].map(disabled)).toEqual([true, true]);
    expect(["Next page", "Last page"].map(disabled)).toEqual([false, false]);
    cleanup();

    setup({ page: 20 });
    expect(["First page", "Previous page"].map(disabled)).toEqual([
      false,
      false,
    ]);
    expect(["Next page", "Last page"].map(disabled)).toEqual([true, true]);
  });

  it("changes the page size, including to all rows", async () => {
    const user = userEvent.setup();
    const { onPageSize } = setup();

    const size = screen.getByRole("combobox", { name: "Rows per page" });
    await user.selectOptions(size, "50");
    await user.selectOptions(size, "All");

    expect(onPageSize.mock.calls).toEqual([[50], ["all"]]);
  });

  it("shows the whole list as one page when all rows are chosen", () => {
    setup({ pageSize: "all", page: 1, totalPages: 1 });

    expect(screen.getByText("Page 1 of 1")).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "Rows per page" })
    ).toHaveProperty("value", "all");
  });
});
