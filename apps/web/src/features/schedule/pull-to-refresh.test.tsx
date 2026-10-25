// @module-tag 007-US1
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { PullToRefresh } from "./pull-to-refresh";

function setup() {
  const scrollerRef = createRef<HTMLDivElement>();
  const onReload = vi.fn();
  render(
    <>
      <div ref={scrollerRef} data-testid="scroller" />
      <PullToRefresh scrollerRef={scrollerRef} onReload={onReload} />
    </>
  );
  const scroller = screen.getByTestId("scroller");
  const touch = (type: string, x?: number, y?: number) => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, {
      touches: x === undefined ? [] : [{ clientX: x, clientY: y }],
    });
    scroller.dispatchEvent(event);
  };
  return { onReload, touch, scroller };
}

describe("PullToRefresh", () => {
  it("reloads after a deliberate pull from the top", () => {
    const { onReload, touch } = setup();
    touch("touchstart", 100, 100);
    touch("touchmove", 100, 150);
    touch("touchmove", 104, 200);
    touch("touchend");
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("does not reload on a short pull", () => {
    const { onReload, touch } = setup();
    touch("touchstart", 100, 100);
    touch("touchmove", 100, 160);
    touch("touchend");
    expect(onReload).not.toHaveBeenCalled();
  });

  it("leaves a sideways pan alone", () => {
    const { onReload, touch } = setup();
    touch("touchstart", 100, 100);
    touch("touchmove", 300, 130);
    touch("touchmove", 400, 300);
    touch("touchend");
    expect(onReload).not.toHaveBeenCalled();
  });

  it("does not start from a scrolled container", () => {
    const { onReload, touch, scroller } = setup();
    scroller.scrollTop = 40;
    touch("touchstart", 100, 100);
    touch("touchmove", 100, 250);
    touch("touchend");
    expect(onReload).not.toHaveBeenCalled();
  });
});
