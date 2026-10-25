import { useState, type ReactNode, type RefObject } from "react";
import type { Location } from "@schellingboard/domain/location";
import { DayFoldBar } from "./day-fold-bar";
import { DayGrid } from "./day-grid";
import { gridDayFold, type ScheduleEntry } from "./model";
import { SCROLLER_ID } from "./now-line";

export function GridView({
  entries,
  locations,
  timezone,
  toolbar,
  filterBar,
  footer,
  stepper,
  scrollerRef,
  defaultFolded,
  unfolded,
  onToggleFold,
  filtering,
  statusHeight,
  matching,
}: {
  entries: ScheduleEntry[];
  /** The rooms drawn, after `?loc=`. */
  locations: Location[];
  timezone: string;
  toolbar: ReactNode;
  filterBar: ReactNode;
  footer: ReactNode;
  /** Floats over the frame, so it is not part of the scrolling content. */
  stepper?: ReactNode;
  scrollerRef: RefObject<HTMLDivElement | null>;
  defaultFolded: ReadonlySet<string>;
  unfolded: ReadonlySet<string>;
  onToggleFold: (dayId: string) => void;
  filtering: boolean;
  /** Height of the pinned search status line the room headers sit below. */
  statusHeight: number;
  matching: number;
}) {
  // Days without a match, opened anyway while searching or filtering.
  const [openedEmpty, setOpenedEmpty] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const toggleEmpty = (dayId: string) =>
    setOpenedEmpty((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });

  return (
    <>
      <div
        data-testid={SCROLLER_ID}
        ref={scrollerRef}
        // `grid` with a single minmax(max-content, 1fr) column rather than
        // block flow, so the toolbar, fold bars and footer stretch to the
        // widest day's grid when it overflows yet still fill the viewport when
        // it is narrower. `cursor` inherits, so links and buttons are reset to
        // theirs rather than showing the grab hand.
        className="grid w-full flex-1 cursor-grab content-start overflow-auto [&_a]:cursor-pointer [&_button]:cursor-pointer"
        style={{ gridTemplateColumns: "minmax(max-content, 1fr)" }}
      >
        {toolbar}
        {filterBar}
        {entries.map(({ day, sessions, meetings }) => {
          const { foldable, folded } = gridDayFold({
            dayId: day.id,
            filtering,
            empty: filtering && sessions.length + meetings.length === 0,
            defaultFolded,
            unfolded,
            openedEmpty,
          });
          return (
            <div key={day.id} className="contents">
              {foldable && (
                <DayFoldBar
                  day={day}
                  timezone={timezone}
                  folded={folded}
                  onToggle={() =>
                    filtering ? toggleEmpty(day.id) : onToggleFold(day.id)
                  }
                  reason={filtering ? "no matches" : undefined}
                />
              )}
              {!folded && (
                <DayGrid
                  day={day}
                  locations={locations}
                  stickyTop={statusHeight}
                />
              )}
            </div>
          );
        })}
        {footer}
        {/* Room to scroll the last row and the footer out from under the stepper. */}
        {matching > 0 && <div aria-hidden className="h-16" />}
      </div>
      {matching > 0 && stepper}
    </>
  );
}
