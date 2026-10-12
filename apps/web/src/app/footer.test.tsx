import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Footer } from "./footer";
import { ThemeProvider } from "./theme";

const show = (version: string | undefined) =>
  render(
    <ThemeProvider>
      <Footer version={version} />
    </ThemeProvider>
  );

describe("Footer", () => {
  it("offers the version, help and bug links, and the theme switch", () => {
    show("4.0.0");

    expect(screen.getByRole("button", { name: /Version 4.0.0/ })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Help" }).getAttribute("href")
    ).toBe("https://docs.schellingboard.org");
    expect(screen.getByRole("link", { name: "Report a Bug" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Colour theme" })).toBeTruthy();
  });

  it("says unknown while the server has not told the version", () => {
    show(undefined);
    expect(
      screen.getByRole("button", { name: /Version unknown/ })
    ).toBeTruthy();
  });

  it("opens the release notes with the running version and dates", async () => {
    const user = userEvent.setup();
    show("4.0.0");

    await user.click(screen.getByRole("button", { name: /Version 4.0.0/ }));

    const dialog = screen.getByRole("dialog", { name: "What's new" });
    expect(dialog.textContent).toContain("This site is running 4.0.0.");
    expect(
      within(dialog).getByRole("heading", { name: "Unreleased" })
    ).toBeTruthy();
    expect(
      within(dialog).getByRole("heading", { name: "4.0.0 — 4 October 2026" })
    ).toBeTruthy();
    expect(within(dialog).getByText("A live schedule")).toBeTruthy();
    expect(
      within(dialog).getByRole("link", { name: "Full changelog on GitHub" })
    ).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
