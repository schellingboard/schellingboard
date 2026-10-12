import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("opens once the pointer has rested on the trigger, and closes on leaving", () => {
    render(
      <Tooltip content="More">
        <a href="/x">Trigger</a>
      </Tooltip>
    );
    const trigger = screen.getByRole("link").parentElement!;
    fireEvent.mouseEnter(trigger);
    act(() => void vi.advanceTimersByTime(300));
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => void vi.advanceTimersByTime(300));
    expect(screen.getByRole("tooltip").textContent).toBe("More");
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("opens on keyboard focus at once", () => {
    render(
      <Tooltip content="More">
        <a href="/x">Trigger</a>
      </Tooltip>
    );
    act(() => screen.getByRole("link").focus());
    expect(screen.getByRole("tooltip")).toBeTruthy();
  });

  it("is only its children without content", () => {
    render(
      <Tooltip>
        <span>Plain</span>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText("Plain").parentElement!);
    act(() => void vi.advanceTimersByTime(1000));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});

describe("Tooltip toggleable", () => {
  it("opens on a tap and closes on Escape or a press elsewhere", async () => {
    render(
      <>
        <Tooltip toggleable content="Details">
          Room
        </Tooltip>
        <p>Elsewhere</p>
      </>
    );
    const button = screen.getByRole("button", { name: "Room" });
    await userEvent.click(button);
    expect(screen.getByRole("tooltip").textContent).toBe("Details");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).toBeNull();
    await userEvent.click(button);
    await userEvent.click(screen.getByText("Elsewhere"));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
