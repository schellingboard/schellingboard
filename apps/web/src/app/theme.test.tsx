import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, ThemeSelect, readThemeCookie } from "./theme";

const clear = () => {
  document.cookie = "sb-theme=; path=/; max-age=0";
  document.documentElement.className = "";
};

describe("theme", () => {
  beforeEach(clear);
  afterEach(clear);

  it("starts from the cookie the page script already applied", () => {
    document.cookie = "sb-theme=dark; path=/";
    expect(readThemeCookie()).toBe("dark");
    render(
      <ThemeProvider>
        <ThemeSelect />
      </ThemeProvider>
    );
    expect(
      screen.getByRole("button", { name: "Dark" }).getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("follows the system when there is no cookie or a bad one", () => {
    document.cookie = "sb-theme=purple; path=/";
    expect(readThemeCookie()).toBe("system");
  });

  it("persists a choice in the cookie and on the page", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeSelect />
      </ThemeProvider>
    );

    await user.click(screen.getByRole("button", { name: "Light" }));
    expect(document.cookie).toContain("sb-theme=light");
    expect(document.documentElement.classList.contains("light")).toBe(true);

    await user.click(screen.getByRole("button", { name: "Dark" }));
    expect(document.documentElement.classList.contains("light")).toBe(false);
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await user.click(screen.getByRole("button", { name: "System" }));
    expect(document.cookie).toContain("sb-theme=system");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("colours the window chrome to match", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeSelect />
      </ThemeProvider>
    );

    await user.click(screen.getByRole("button", { name: "Dark" }));

    const metas = [...document.querySelectorAll('meta[name="theme-color"]')];
    expect(metas.map((m) => m.getAttribute("content"))).toEqual(["#16181d"]);
  });
});
