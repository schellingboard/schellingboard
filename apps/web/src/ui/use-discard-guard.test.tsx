import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { useDiscardGuard } from "./use-discard-guard";

function Form({
  onClose,
  beforeUnload,
  dirty,
}: {
  onClose: () => void;
  beforeUnload?: boolean;
  dirty?: () => boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const guard = useDiscardGuard(ref, onClose, { beforeUnload });
  const { track } = guard;
  useEffect(() => (dirty ? track(dirty) : undefined), [track, dirty]);
  return (
    <div ref={ref} onFocus={guard.noteField} onPointerDown={guard.noteField}>
      <label>
        Title <input defaultValue="Draft" />
      </label>
      <label>
        Room
        <select defaultValue="a">
          <option value="a">Alpha</option>
          <option value="b">Beta</option>
        </select>
      </label>
      <label>
        <input type="checkbox" /> Open to all
      </label>
      <label>
        Day <input type="date" defaultValue="2026-05-01" />
      </label>
      <label>
        Sort
        <select data-discard-ignore defaultValue="a">
          <option value="a">A</option>
          <option value="b">B</option>
        </select>
      </label>
      <fieldset>
        <label>
          <input type="radio" name="kind" value="a" defaultChecked /> Talk
        </label>
        <label>
          <input type="radio" name="kind" value="b" /> Workshop
        </label>
      </fieldset>
      <button onClick={() => guard.requestClose()}>Close</button>
      {guard.prompt}
    </div>
  );
}

const asked = () => screen.queryByRole("alertdialog");

describe("the discard guard", { tags: ["010-US7"] }, () => {
  it.each([
    [
      "a chosen option",
      async () => userEvent.selectOptions(screen.getByLabelText("Room"), "b"),
    ],
    [
      "a ticked box",
      async () => userEvent.click(screen.getByLabelText("Open to all")),
    ],
    [
      "a changed date",
      async () => {
        await userEvent.click(screen.getByLabelText("Day"));
        fireEvent.change(screen.getByLabelText("Day"), {
          target: { value: "2026-05-02" },
        });
      },
    ],
  ])("asks first after %s", async (_, edit) => {
    const onClose = vi.fn();
    render(<Form onClose={onClose} />);
    await edit();

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(asked()).not.toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("does not ask when a control is put back as it was", async () => {
    const onClose = vi.fn();
    render(<Form onClose={onClose} />);
    const box = screen.getByLabelText("Open to all");
    await userEvent.click(box);
    await userEvent.click(box);

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("counts a press on a label's text, not only on the control", async () => {
    const onClose = vi.fn();
    render(<Form onClose={onClose} />);
    await userEvent.click(screen.getByText("Open to all"));

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not ask when a radio group is put back as it was", async () => {
    const onClose = vi.fn();
    render(<Form onClose={onClose} />);
    await userEvent.click(screen.getByText("Workshop"));
    await userEvent.click(screen.getByText("Talk"));

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("asks after another radio of the group is picked", async () => {
    render(<Form onClose={() => {}} />);
    await userEvent.click(screen.getByText("Workshop"));

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(asked()).not.toBeNull();
  });

  it("asks when a registered check says the form changed, and not once it is unregistered", async () => {
    const onClose = vi.fn();
    let changed = true;
    const dirty = () => changed;
    const { rerender } = render(<Form onClose={onClose} dirty={dirty} />);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(asked()).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Keep editing" }));

    changed = false;
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    changed = true;
    rerender(<Form onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("ignores a control marked data-discard-ignore", async () => {
    const onClose = vi.fn();
    render(<Form onClose={onClose} />);
    await userEvent.selectOptions(screen.getByLabelText("Sort"), "b");

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalled();
  });

  describe("on leaving the page", () => {
    const leave = () => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };

    it("warns when asked to and something is unsaved", async () => {
      render(<Form onClose={() => {}} beforeUnload />);
      expect(leave()).toBe(false);

      await userEvent.click(screen.getByLabelText("Open to all"));

      expect(leave()).toBe(true);
    });

    it("never warns unless asked to", async () => {
      render(<Form onClose={() => {}} />);
      await userEvent.click(screen.getByLabelText("Open to all"));

      expect(leave()).toBe(false);
    });
  });
});
