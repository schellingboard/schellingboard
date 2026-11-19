import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Footer } from "./footer";
import { ThemeProvider } from "./theme";
import type { UpdateStatus } from "./updates";

vi.mock("@schellingboard/domain/release-notes", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  SHOWN_RELEASES: 3,
  releaseNotes: [
    { version: "Unreleased", highlights: ["**Dragon taming**: in progress."] },
    {
      version: "2.2.2",
      date: "2031-03-07",
      highlights: ["**Teleporting rooms**: sessions move themselves."],
    },
    { version: "2.2.1", date: "2030-12-25", highlights: ["**Snow mode**."] },
    { version: "2.2.0", date: "2030-01-01", highlights: ["**Too old**."] },
  ],
}));

const show = (version: string | undefined, update?: UpdateStatus | null) =>
  render(
    <ThemeProvider>
      <Footer version={version} update={update} />
    </ThemeProvider>
  );

const behind: UpdateStatus = {
  current: { version: "v4.0.0", date: "2026-10-04" },
  latest: { version: "v4.1.0", date: "2026-10-12" },
  updateAvailable: true,
};

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
    show("2.2.2");

    await user.click(screen.getByRole("button", { name: /Version 2\.2\.2/ }));

    const dialog = screen.getByRole("dialog", { name: "What's new" });
    expect(dialog.textContent).toContain("This site is running 2.2.2.");
    expect(
      within(dialog)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent)
    ).toEqual([
      "Unreleased",
      "2.2.2 — 7 March 2031",
      "2.2.1 — 25 December 2030",
    ]);
    expect(
      within(dialog).getByText(
        "In this build, but not in a released version yet."
      )
    ).toBeTruthy();
    expect(within(dialog).getByText("Teleporting rooms")).toBeTruthy();
    expect(
      within(dialog).getByRole("link", { name: "Full changelog on GitHub" })
    ).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  describe("when a newer release is out", () => {
    it("marks the version, and says both releases and how to update @014-US6", async () => {
      const user = userEvent.setup();
      show("v4.0.0", behind);

      await user.click(
        screen.getByRole("button", { name: /Version v4.0.0.*update available/ })
      );

      const dialog = screen.getByRole("dialog", { name: "What's new" });
      expect(dialog.textContent).toContain("v4.1.0");
      expect(dialog.textContent).toContain("12 October 2026");
      expect(dialog.textContent).toContain("v4.0.0");
      expect(
        within(dialog)
          .getByRole("link", { name: "How to update" })
          .getAttribute("href")
      ).toBe(
        "https://docs.schellingboard.org/self-hosting/deployment/#updating"
      );
    });

    it("shows no mark when the release is the latest", () => {
      show("v4.1.0", { ...behind, updateAvailable: false });
      expect(screen.queryByLabelText(/update available/)).toBeNull();
    });

    it("shows no mark when nothing is known", () => {
      show("v4.1.0", null);
      expect(screen.queryByLabelText(/update available/)).toBeNull();
    });
  });
});
