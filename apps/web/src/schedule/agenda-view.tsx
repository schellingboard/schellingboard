import type { ReactNode, RefObject } from "react";
import type { Location } from "@schellingboard/domain/location";
import { DayAgenda } from "./day-agenda";
import { DayFoldBar } from "./day-fold-bar";
import { agendaDayFold, type ScheduleEntry } from "./model";
import { SCROLLER_ID } from "./now-line";

export function AgendaView({
  entries,
  locations,
  timezone,
  toolbar,
  filterBar,
  footer,
  scrollerRef,
  defaultFolded,
  unfolded,
  onToggleFold,
  filtering,
  statusHeight,
}: {
  entries: ScheduleEntry[];
  locations: Location[];
  timezone: string;
  toolbar: ReactNode;
  filterBar: ReactNode;
  footer: ReactNode;
  scrollerRef: RefObject<HTMLDivElement | null>;
  defaultFolded: ReadonlySet<string>;
  unfolded: ReadonlySet<string>;
  onToggleFold: (dayId: string) => void;
  filtering: boolean;
  statusHeight: number;
}) {
  return (
    <div
      data-testid={SCROLLER_ID}
      ref={scrollerRef}
      className="flex w-full flex-1 flex-col items-stretch overflow-auto"
    >
      {toolbar}
      {filterBar}
      <div className="flex w-full flex-col gap-4 lg:grow">
        {entries.map(({ day, sessions, meetings }) => {
          const { foldable, folded } = agendaDayFold({
            dayId: day.id,
            filtering,
            defaultFolded,
            unfolded,
          });
          return (
            <div key={day.id}>
              {foldable && (
                <div className="mx-auto max-w-3xl">
                  <DayFoldBar
                    day={day}
                    timezone={timezone}
                    folded={folded}
                    onToggle={() => onToggleFold(day.id)}
                  />
                </div>
              )}
              {!folded && (
                <DayAgenda
                  day={day}
                  sessions={sessions}
                  meetings={meetings}
                  locations={locations}
                  filtering={filtering}
                  stickyTop={statusHeight}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="lg:sticky lg:bottom-0">{footer}</div>
    </div>
  );
}
