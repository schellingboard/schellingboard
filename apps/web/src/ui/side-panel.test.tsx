import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "./dialog";
import { SidePanel, PANEL_WIDTH_KEY } from "./side-panel";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.style.removeProperty("--side-panel-inset");
});

const panel = (props: Partial<Parameters<typeof SidePanel>[0]> = {}) => (
  <SidePanel
    label="Details"
    title="A title"
    onClose={() => {}}
    shareUrl="/conf/sessions/s"
    {...props}
  >
    body
  </SidePanel>
);

describe("SidePanel", () => {
  it("is a named, non-modal dialog with the title and content", () => {
    render(panel());
    const dialog = screen.getByRole("dialog", { name: "Details" });
    expect(dialog.getAttribute("aria-modal")).toBe("false");
    expect(dialog.textContent).toContain("A title");
    expect(dialog.textContent).toContain("body");
  });

  it("closes on Close and on Escape", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(panel({ onClose }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("leaves Escape to a modal dialog open over it", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        {panel({ onClose })}
        <Dialog open onClose={() => {}} title="Sure?">
          x
        </Dialog>
      </>
    );
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows the Back arrow only when asked", async () => {
    const onBack = vi.fn();
    const { rerender } = render(panel());
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
    rerender(panel({ onBack }));
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalled();
  });

  it("leaves Escape alone when focus is in the page behind", async () => {
    const onClose = vi.fn();
    const field = document.createElement("input");
    document.body.append(field);
    render(panel({ onClose }));
    field.focus();
    await userEvent.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
    field.remove();
  });

  it("moves focus in and returns it to the opener", () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();
    const { unmount } = render(panel());
    expect(
      screen
        .getByRole("dialog", { name: "Details" })
        .contains(document.activeElement)
    ).toBe(true);
    unmount();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it("copies the address where the browser cannot share", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(panel());
    await userEvent.click(screen.getByRole("button", { name: "Share" }));
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/conf/sessions/s`
    );
  });

  it("resizes with the arrow keys and remembers the width", async () => {
    const user = userEvent.setup();
    const { unmount } = render(panel());
    const handle = screen.getByRole("separator", { name: "Resize panel" });
    const before = Number(handle.getAttribute("aria-valuenow"));
    handle.focus();
    await user.keyboard("{ArrowLeft}");
    expect(Number(handle.getAttribute("aria-valuenow"))).toBeGreaterThan(
      before
    );
    const stored = localStorage.getItem(PANEL_WIDTH_KEY);
    expect(Number(stored)).toBe(Number(handle.getAttribute("aria-valuenow")));
    unmount();
    render(panel());
    expect(
      screen
        .getByRole("separator", { name: "Resize panel" })
        .getAttribute("aria-valuenow")
    ).toBe(stored);
  });
});
