import { nowScrollTop } from "./grid-layout";

export const NOW_LINE_ID = "now-line";
export const SCROLLER_ID = "schedule-scroll";

/**
 * The red line marking the current time on the grid. A day draws one segment
 * per column, the time gutter plus every room, which line up into one line.
 */
export function NowLine({
  offsetPx,
  anchor,
}: {
  offsetPx: number;
  /**
   * Marks the gutter's segment, the one "jump to now" scrolls to and the one
   * tests address: the gutter sticks to the left edge, so it is on screen
   * however far the grid is scrolled sideways.
   */
  anchor?: boolean;
}) {
  return (
    <div
      data-testid={anchor ? NOW_LINE_ID : undefined}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-danger"
      style={{ top: offsetPx }}
    />
  );
}

/**
 * Scrolls the schedule so the now line sits a third from the top. A no-op when
 * the line isn't rendered, i.e. the event isn't running.
 */
export function scrollNowLineIntoView(root: ParentNode = document) {
  const container = root.querySelector<HTMLElement>(
    `[data-testid="${SCROLLER_ID}"]`
  );
  const line = root.querySelector(`[data-testid="${NOW_LINE_ID}"]`);
  if (!container || !line) return;
  container.scrollTo({
    top: nowScrollTop({
      scrollTop: container.scrollTop,
      containerTop: container.getBoundingClientRect().top,
      lineTop: line.getBoundingClientRect().top,
      clientHeight: container.clientHeight,
    }),
    behavior: "smooth",
  });
}
