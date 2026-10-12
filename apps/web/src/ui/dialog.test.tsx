import { describe, expect, it, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "./dialog";

describe("Dialog", () => {
  it("shows nothing while closed", () => {
    render(
      <Dialog open={false} onClose={() => {}} title="Hello">
        body
      </Dialog>
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("is a named modal dialog with its content", () => {
    render(
      <Dialog open onClose={() => {}} title="Hello">
        body text
      </Dialog>
    );
    const dialog = screen.getByRole("dialog", { name: "Hello" });
    expect(dialog).toHaveProperty(
      "textContent",
      expect.stringContaining("body text")
    );
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });

  it("closes on Escape, on the close button and on a backdrop click", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog open onClose={onClose} title="Hello">
        body
      </Dialog>
    );

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.click(screen.getByTestId("dialog-backdrop"));

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("does not close when its own content is clicked", async () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="Hello">
        <p>inside</p>
      </Dialog>
    );
    await userEvent.setup().click(screen.getByText("inside"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("focuses the dialog, but leaves a child that asked for focus alone", () => {
    const { rerender } = render(
      <Dialog open onClose={() => {}} title="Hello">
        <button>first</button>
      </Dialog>
    );
    expect(document.activeElement).toBe(screen.getByRole("dialog"));
    rerender(
      <Dialog open={false} onClose={() => {}} title="Hello">
        <button>first</button>
      </Dialog>
    );

    rerender(
      <Dialog open onClose={() => {}} title="Hello">
        <input aria-label="search" autoFocus />
      </Dialog>
    );
    expect(document.activeElement).toBe(screen.getByLabelText("search"));
  });

  it("keeps Tab inside the dialog", async () => {
    const user = userEvent.setup();
    render(
      <Dialog open onClose={() => {}} title="Hello">
        <button>one</button>
        <button>two</button>
      </Dialog>
    );
    const close = screen.getByRole("button", { name: "Close" });
    const two = screen.getByRole("button", { name: "two" });

    two.focus();
    await user.tab();
    expect(document.activeElement).toBe(close);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(two);
  });

  it("gives the focus back to its opener once, and not on re-renders", () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();
    const focus = vi.spyOn(opener, "focus");
    const { rerender } = render(
      <Dialog open onClose={() => {}} title="Hello">
        x
      </Dialog>
    );

    rerender(
      <Dialog open onClose={() => {}} title="Hello">
        x
      </Dialog>
    );
    expect(focus).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByRole("dialog"));

    rerender(
      <Dialog open={false} onClose={() => {}} title="Hello">
        x
      </Dialog>
    );
    expect(focus).toHaveBeenCalledTimes(1);
    opener.remove();
    act(() => {});
  });
});
