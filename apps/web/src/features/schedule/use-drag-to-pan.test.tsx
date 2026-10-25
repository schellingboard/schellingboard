// @module-tag 007-US1
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { useDragToPan } from "./use-drag-to-pan";

function Pannable({
  enabled = true,
  onClick,
}: {
  enabled?: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDragToPan(ref, enabled);
  return (
    <div ref={ref} data-testid="pan">
      <a href="#x" onClick={onClick}>
        Session
      </a>
      <button type="button">Fold</button>
    </div>
  );
}

const drag = (
  target: Element,
  from: [number, number],
  to: [number, number]
) => {
  fireEvent.mouseDown(target, {
    button: 0,
    clientX: from[0],
    clientY: from[1],
  });
  fireEvent.mouseMove(window, {
    buttons: 1,
    clientX: to[0],
    clientY: to[1],
  });
  fireEvent.mouseUp(window);
};

describe("useDragToPan", () => {
  it("scrolls the container opposite to the drag", () => {
    render(<Pannable onClick={() => {}} />);
    const pan = screen.getByTestId("pan");
    pan.scrollLeft = 200;
    pan.scrollTop = 300;
    drag(pan, [100, 100], [60, 90]);
    expect(pan.scrollLeft).toBe(240);
    expect(pan.scrollTop).toBe(310);
  });

  it("swallows the click that ends a real drag, keeps a plain click", () => {
    const onClick = vi.fn();
    render(<Pannable onClick={onClick} />);
    const link = screen.getByRole("link", { name: "Session" });
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
    drag(link, [100, 100], [60, 60]);
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("treats movement under the threshold as a click", () => {
    const onClick = vi.fn();
    render(<Pannable onClick={onClick} />);
    const link = screen.getByRole("link", { name: "Session" });
    drag(link, [100, 100], [102, 101]);
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("leaves presses on form controls alone", () => {
    render(<Pannable onClick={() => {}} />);
    const pan = screen.getByTestId("pan");
    pan.scrollLeft = 10;
    drag(screen.getByRole("button", { name: "Fold" }), [100, 100], [50, 50]);
    expect(pan.scrollLeft).toBe(10);
  });

  it("does nothing when disabled", () => {
    render(<Pannable enabled={false} onClick={() => {}} />);
    const pan = screen.getByTestId("pan");
    pan.scrollLeft = 10;
    drag(pan, [100, 100], [50, 50]);
    expect(pan.scrollLeft).toBe(10);
  });
});
