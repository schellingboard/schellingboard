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

  it("closes only the topmost of nested dialogs on Escape", async () => {
    const outer = vi.fn();
    const inner = vi.fn();
    const ui = (innerOpen: boolean) => (
      <Dialog open onClose={outer} title="Outer">
        <Dialog open={innerOpen} onClose={inner} title="Inner">
          body
        </Dialog>
      </Dialog>
    );
    const { rerender } = render(ui(false));
    rerender(ui(true));
    await userEvent.keyboard("{Escape}");
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
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

describe("Dialog with unsaved text", { tags: ["010-US7"] }, () => {
  const setup = () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog open onClose={onClose} title="Hello">
        <textarea aria-label="Comment" />
      </Dialog>
    );
    return { onClose, user };
  };

  it("closes at once while nothing was typed", async () => {
    const { onClose, user } = setup();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      "Escape",
      (u: ReturnType<typeof userEvent.setup>) => u.keyboard("{Escape}"),
    ],
    [
      "the close button",
      (u: ReturnType<typeof userEvent.setup>) =>
        u.click(screen.getByRole("button", { name: "Close" })),
    ],
    [
      "a backdrop click",
      (u: ReturnType<typeof userEvent.setup>) =>
        u.click(screen.getByTestId("dialog-backdrop")),
    ],
  ])("asks before %s discards typed text", async (_name, dismiss) => {
    const { onClose, user } = setup();
    await user.type(screen.getByLabelText("Comment"), "draft");

    await dismiss(user);

    expect(onClose).not.toHaveBeenCalled();
    expect(
      screen.getByRole("alertdialog", { name: "Discard what you have typed?" })
    ).toBeTruthy();
  });

  it("keeps the dialog and the text on Keep editing", async () => {
    const { onClose, user } = setup();
    await user.type(screen.getByLabelText("Comment"), "draft");
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "Keep editing" }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.getByLabelText<HTMLTextAreaElement>("Comment").value).toBe(
      "draft"
    );
  });

  it("closes on Discard", async () => {
    const { onClose, user } = setup();
    await user.type(screen.getByLabelText("Comment"), "draft");
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "Discard" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes at once once the typed text is gone", async () => {
    const { onClose, user } = setup();
    const field = screen.getByLabelText("Comment");
    await user.type(field, "draft");
    await user.clear(field);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not ask about a pre-filled field the user left alone", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog open onClose={onClose} title="Hello">
        <textarea aria-label="Edit" defaultValue="saved text" />
        <input aria-label="Other" />
      </Dialog>
    );
    await user.type(screen.getByLabelText("Other"), "x");
    await user.clear(screen.getByLabelText("Other"));

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("asks when a pre-filled field was changed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog open onClose={onClose} title="Hello">
        <textarea aria-label="Edit" defaultValue="saved text" />
      </Dialog>
    );
    await user.type(screen.getByLabelText("Edit"), " more");

    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });

  it("does not ask about a search box", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog open onClose={onClose} title="Hello">
        <input role="combobox" aria-label="Name" />
      </Dialog>
    );
    await user.type(screen.getByLabelText("Name"), "ali");

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape on the question keeps editing and returns focus", async () => {
    const { onClose, user } = setup();
    const field = screen.getByLabelText("Comment");
    await user.type(field, "draft");
    await user.keyboard("{Escape}");

    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(document.activeElement).toBe(field);
  });

  it("keeps the focus target when the backdrop is clicked during the question", async () => {
    const { onClose, user } = setup();
    const field = screen.getByLabelText("Comment");
    await user.type(field, "draft");
    await user.keyboard("{Escape}");
    await user.click(screen.getByTestId("dialog-backdrop"));

    await user.click(screen.getByRole("button", { name: "Keep editing" }));

    expect(onClose).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(field);
  });
});
