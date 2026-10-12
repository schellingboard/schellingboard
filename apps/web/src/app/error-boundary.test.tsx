import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "./error-boundary";
import { hardReload } from "./hard-navigate";

vi.mock("./hard-navigate", () => ({
  hardNavigate: vi.fn(),
  hardReload: vi.fn(),
}));

let broken = true;
function Screen() {
  if (broken) throw new Error("boom");
  return <p>all fine</p>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    broken = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("shows the content when nothing is wrong", () => {
    broken = false;
    render(
      <ErrorBoundary>
        <Screen />
      </ErrorBoundary>
    );
    expect(screen.getByText("all fine")).toBeTruthy();
  });

  it("replaces a crashed screen with a message and a way out", () => {
    render(
      <ErrorBoundary>
        <Screen />
      </ErrorBoundary>
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Something went wrong"
    );
    expect(screen.queryByText("all fine")).toBeNull();
    expect(
      screen
        .getByRole("link", { name: "Open the classic site" })
        .getAttribute("href")
    ).toBe("/legacy");
  });

  it("tries again without reloading", async () => {
    render(
      <ErrorBoundary>
        <Screen />
      </ErrorBoundary>
    );
    broken = false;

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("all fine")).toBeTruthy();
  });

  it("recovers by itself when the screen it guards changes", () => {
    const { rerender } = render(
      <ErrorBoundary resetKey="/a">
        <Screen />
      </ErrorBoundary>
    );
    broken = false;

    rerender(
      <ErrorBoundary resetKey="/b">
        <Screen />
      </ErrorBoundary>
    );

    expect(screen.getByText("all fine")).toBeTruthy();
  });

  it("reloads the page on request", async () => {
    render(
      <ErrorBoundary>
        <Screen />
      </ErrorBoundary>
    );

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Reload" }));

    expect(hardReload).toHaveBeenCalled();
  });
});
