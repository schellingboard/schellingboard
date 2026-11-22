import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Fragment } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "./dialog";
import { PANEL_WIDTH_KEY, SidePanel } from "./side-panel";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.style.removeProperty("--side-panel-inset");
});

const tick = () => new Promise((resolve) => setTimeout(resolve));

const panel = (props: Partial<Parameters<typeof SidePanel>[0]> = {}) => (
  <SidePanel label="Details" title="A title" onClose={() => {}} {...props}>
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

  it(
    "keeps one panel open: one without an address gives way to any other",
    { tags: ["004-US8"] },
    () => {
      const routed = vi.fn();
      const transient = vi.fn();
      const routedPanel = panel({ onClose: routed });
      const transientPanel = panel({ onClose: transient, transient: true });
      const { rerender } = render(<Fragment key="r">{routedPanel}</Fragment>);
      rerender(
        <>
          <Fragment key="r">{routedPanel}</Fragment>
          <Fragment key="t">{transientPanel}</Fragment>
        </>
      );
      expect(routed).toHaveBeenCalledTimes(1);
      expect(transient).not.toHaveBeenCalled();

      rerender(
        <>
          <Fragment key="t">{transientPanel}</Fragment>
          <Fragment key="r2">{panel({ label: "Another" })}</Fragment>
        </>
      );
      expect(transient).toHaveBeenCalledTimes(1);
    }
  );

  it("shows the Back arrow only when asked", async () => {
    const onBack = vi.fn();
    const { rerender } = render(panel());
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
    rerender(panel({ onBack }));
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalled();
  });

  it("leaves Escape to a text field in the page behind", async () => {
    const onClose = vi.fn();
    const field = document.createElement("input");
    document.body.append(field);
    render(panel({ onClose }));
    field.focus();
    await userEvent.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
    field.remove();
  });

  it("closes on Escape with focus on a button in the page behind", async () => {
    const onClose = vi.fn();
    const button = document.createElement("button");
    document.body.append(button);
    render(panel({ onClose }));
    button.focus();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    button.remove();
  });

  it("closes on a press on an empty part of the page behind", async () => {
    const onClose = vi.fn();
    const page = document.createElement("div");
    page.textContent = "page";
    document.body.append(page);
    render(panel({ onClose }));
    await userEvent.click(screen.getByText("body"));
    await tick();
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(page);
    await tick();
    expect(onClose).toHaveBeenCalledTimes(1);
    page.remove();
  });

  it("leaves a press on a control in the page behind to that control", async () => {
    const onClose = vi.fn();
    const link = document.createElement("a");
    link.href = "#other";
    link.textContent = "Other session";
    document.body.append(link);
    render(panel({ onClose }));
    await userEvent.click(link);
    await tick();
    expect(onClose).not.toHaveBeenCalled();
    link.remove();
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

  describe("leaving over unsaved changes", { tags: ["010-US7"] }, () => {
    const form = (props: Partial<Parameters<typeof SidePanel>[0]> = {}) =>
      render(
        <SidePanel
          label="Details"
          title="A title"
          onClose={() => {}}
          {...props}
        >
          <input type="checkbox" aria-label="Open to all" />
        </SidePanel>
      );

    it("asks before the Back arrow goes back", async () => {
      const onBack = vi.fn();
      const user = userEvent.setup();
      form({ onBack });
      await user.click(screen.getByRole("checkbox", { name: "Open to all" }));

      await user.click(screen.getByRole("button", { name: "Back" }));

      expect(onBack).not.toHaveBeenCalled();
      await user.click(screen.getByRole("button", { name: "Discard" }));
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("asks once when Close and Back are both pressed", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      form({ onBack: () => {}, onClose });
      await user.click(screen.getByRole("checkbox", { name: "Open to all" }));

      await user.click(screen.getByRole("button", { name: "Close" }));
      await user.click(screen.getByRole("button", { name: "Back" }));

      expect(screen.getAllByRole("alertdialog")).toHaveLength(1);
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("alertdialog")).toBeNull();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
