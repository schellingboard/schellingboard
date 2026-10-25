// @module-tag 007-US4
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { NowLine, scrollNowLineIntoView } from "./now-line";

describe("scrollNowLineIntoView", () => {
  it("scrolls the schedule so the line sits a third from the top", () => {
    const { container } = render(
      <div data-testid="schedule-scroll">
        <NowLine offsetPx={0} anchor />
      </div>
    );
    const scroller = container.querySelector<HTMLElement>(
      '[data-testid="schedule-scroll"]'
    )!;
    const line = container.querySelector<HTMLElement>(
      '[data-testid="now-line"]'
    )!;
    const scrollTo = vi.fn();
    scroller.scrollTo = scrollTo as never;
    Object.defineProperty(scroller, "clientHeight", { value: 600 });
    scroller.scrollTop = 100;
    scroller.getBoundingClientRect = () => ({ top: 64 }) as DOMRect;
    line.getBoundingClientRect = () => ({ top: 664 }) as DOMRect;

    scrollNowLineIntoView(container);

    expect(scrollTo).toHaveBeenCalledWith({
      top: 500,
      behavior: "smooth",
    });
  });

  it("does nothing without a line", () => {
    const { container } = render(<div data-testid="schedule-scroll" />);
    const scroller = container.firstElementChild as HTMLElement;
    const scrollTo = vi.fn();
    scroller.scrollTo = scrollTo as never;
    scrollNowLineIntoView(container);
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
