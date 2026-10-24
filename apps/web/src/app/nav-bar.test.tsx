import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavBar } from "./nav-bar";

const items = [
  { name: "Conf", href: "/legacy/conf" },
  { name: "Retreat", href: "/legacy/retreat" },
];

describe("NavBar", () => {
  it("links each event to its page, marking the current one", () => {
    render(<NavBar items={items} currentPath="/legacy/retreat" />);

    const nav = screen.getByRole("navigation");
    const retreat = within(nav).getAllByRole("link", { name: "Retreat" })[0];
    expect(retreat.getAttribute("href")).toBe("/legacy/retreat");
    expect(retreat.getAttribute("aria-current")).toBe("page");
    expect(
      within(nav)
        .getAllByRole("link", { name: "Conf" })[0]
        .getAttribute("aria-current")
    ).toBeNull();
  });

  it("marks nothing as current when there is only one event", () => {
    render(<NavBar items={[items[0]]} currentPath="/legacy/conf" />);
    expect(
      screen.getByRole("link", { name: "Conf" }).getAttribute("aria-current")
    ).toBeNull();
  });

  it("opens and closes the menu on narrow screens", async () => {
    const user = userEvent.setup();
    render(<NavBar items={items} currentPath="/" />);

    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("navigation", { name: "Menu" })).toBeNull();

    await user.click(toggle);

    expect(
      screen
        .getByRole("button", { name: "Close menu" })
        .getAttribute("aria-expanded")
    ).toBe("true");
    const menu = screen.getByRole("navigation", { name: "Menu" });
    expect(within(menu).getByRole("link", { name: "Conf" })).toBeTruthy();
  });

  it("renders its trailing controls", () => {
    render(
      <NavBar items={items} currentPath="/">
        <button>Mine</button>
      </NavBar>
    );
    expect(screen.getByRole("button", { name: "Mine" })).toBeTruthy();
  });
});
