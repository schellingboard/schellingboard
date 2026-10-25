import { DateTime } from "luxon";
import type { Location } from "@schellingboard/domain/location";
import { getNumSlots } from "@schellingboard/domain/slots";
import { TIME_FORMAT } from "@schellingboard/domain/time";
import { InformationCircleIcon } from "../../ui/icons";
import { Tooltip } from "../../ui/tooltip";
import { cx } from "../../ui/cx";
import { useSchedule } from "./context";
import { getNowOffsetPx } from "./grid-layout";
import { LocationCol } from "./location-col";
import { meetingsForDay, takesPartInMeetings } from "./meeting-column";
import { MeetingsCol } from "./meetings-col";
import type { DayWithSessions } from "./model";
import { NowLine } from "./now-line";
import { OneOnOnePicture } from "./one-on-one-picture";

// Width of the left time-axis gutter. The body rows show `HH:mm` labels and the
// header corner shows the day's date, so it has to fit a short date.
const GUTTER = "2.5rem";

/**
 * One day is a single CSS grid: column 1 is the time gutter, the rest are the
 * rooms. The room-name row sticks to the top and the gutter to the left, so
 * both stay visible while the schedule scrolls; no scroll listeners.
 */
export function DayGrid({
  day,
  locations,
  stickyTop,
}: {
  day: DayWithSessions;
  locations: Location[];
  /** Where the room headers stick: below whatever is pinned above them. */
  stickyTop: number;
}) {
  const { data, timezone, slotIncrement } = useSchedule();
  const numSlots = getNumSlots(day.start, day.end, slotIncrement);
  const firstImageIndex = locations.findIndex((loc) => loc.imageUrl);
  const date = DateTime.fromJSDate(day.start).setZone(timezone);
  // Null on any day that isn't today. `now` is the server's clock, the dev
  // fake clock included.
  const nowOffsetPx = getNowOffsetPx(day, data.now, slotIncrement);
  // Decided for the whole event rather than day by day, and outside the
  // ?loc= narrowing: the column is not a room, so the rooms line up from one
  // day to the next whatever is shown (issue #392, section 2.6).
  const showMeetings = takesPartInMeetings(data.meetings, data.availability);

  return (
    <div
      className="grid bg-surface"
      style={{
        // The grid lays out at these widths and scrolls, so every pixel the
        // 1-on-1 column takes is one the rooms lose.
        gridTemplateColumns: `${GUTTER} ${
          showMeetings ? "minmax(96px, 160px) " : ""
        }repeat(${locations.length}, minmax(120px, 240px))`,
      }}
    >
      {/* The corner cell carries the day's date, so the next day's replaces
          it as that day scrolls into view. */}
      <div
        style={{ top: stickyTop }}
        className="sticky left-0 z-21 flex flex-col justify-end border-b border-r border-line-subtle bg-surface p-1 leading-tight"
      >
        <span className="text-[11px] font-bold">{date.toFormat("EEE")}</span>
        <span className="text-[10px] text-fg-subtle">
          {date.toFormat("MMM d")}
        </span>
      </div>
      {showMeetings && (
        <div
          style={{ top: stickyTop }}
          className="sticky z-20 border-b border-l border-line-subtle bg-surface p-1"
        >
          <h3 className="text-xs font-semibold sm:text-sm">1-on-1s</h3>
        </div>
      )}
      {locations.map((loc) => (
        <RoomHeader key={loc.id} location={loc} stickyTop={stickyTop} />
      ))}
      <div
        style={{ top: stickyTop }}
        className="sticky z-20 border-r border-line-subtle bg-surface"
      />
      {showMeetings && (
        <div className="border-l border-line-subtle p-1">
          <p className="text-[10px] text-fg-subtle">Only you see these</p>
        </div>
      )}
      {locations.map((loc) => (
        <div key={loc.id} className="border-l border-line-subtle p-1">
          <p className="text-[10px] text-fg-subtle">
            {loc.areaDescription ?? <br />}
          </p>
          <p className="text-[10px] text-fg-subtle">
            {loc.capacity ? `max ${loc.capacity}` : <br />}
          </p>
        </div>
      ))}
      {firstImageIndex !== -1 && (
        <>
          <div className="sticky left-0 z-20 border-r border-line-subtle bg-surface" />
          {showMeetings && (
            <div className="border-l border-line-subtle p-1">
              <OneOnOnePicture />
            </div>
          )}
          {locations.map((loc, i) => (
            <div key={loc.id} className="border-l border-line-subtle p-1">
              {loc.imageUrl && (
                <img
                  src={loc.imageUrl}
                  alt={loc.name}
                  loading={i === firstImageIndex ? "eager" : "lazy"}
                  className="aspect-[4/3] w-full object-cover"
                  style={{ maxHeight: 200 }}
                  width={500}
                  height={375}
                />
              )}
            </div>
          ))}
        </>
      )}
      {/* The time gutter sticks to the left; every column places its blocks
          in pixels on the same 44px-per-slot scale. */}
      <div
        className="sticky left-0 z-20 grid border-r border-line-subtle bg-surface"
        style={{ gridTemplateRows: `repeat(${numSlots}, 44px)` }}
      >
        {Array.from({ length: numSlots }).map((_, i) => (
          <div
            key={i}
            className="h-[44px] border-b border-line-subtle p-1 text-[10px]"
          >
            {DateTime.fromMillis(
              day.start.getTime() + i * slotIncrement * 60 * 1000
            )
              .setZone(timezone)
              .toFormat(TIME_FORMAT)}
          </div>
        ))}
        {nowOffsetPx !== null && <NowLine offsetPx={nowOffsetPx} anchor />}
      </div>
      {showMeetings && (
        <MeetingsCol
          meetings={meetingsForDay(data.meetings, day)}
          availability={data.availability}
          day={day}
          nowOffsetPx={nowOffsetPx}
        />
      )}
      {locations.map((location) => (
        <LocationCol
          key={location.id}
          sessions={day.sessions.filter((session) =>
            session.locations.some((l) => l.id === location.id)
          )}
          day={day}
          location={location}
          nowOffsetPx={nowOffsetPx}
        />
      ))}
    </div>
  );
}

function RoomHeader({
  location: loc,
  stickyTop,
}: {
  location: Location;
  stickyTop: number;
}) {
  const whereAndSize = [
    loc.areaDescription,
    loc.capacity ? `max ${loc.capacity}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const hasDetails = !!(loc.description || whereAndSize);
  return (
    <div
      style={{ top: stickyTop }}
      className="sticky z-20 border-b border-l border-line-subtle bg-surface p-1"
    >
      {/* What a room offers is behind its name; the ⓘ is the only hint that
          there is anything to open. */}
      <h3 className="text-xs font-semibold sm:text-sm">
        <Tooltip
          toggleable
          content={
            hasDetails ? (
              <div className="space-y-1 p-2">
                <p className="text-xs font-semibold text-fg-muted">
                  {loc.name}
                </p>
                {whereAndSize && (
                  <p className="text-xs text-fg-subtle">{whereAndSize}</p>
                )}
                {loc.description && (
                  <p className="text-sm">{loc.description}</p>
                )}
              </div>
            ) : undefined
          }
          triggerClassName={cx(
            "flex items-start gap-0.5 rounded-sm text-left",
            hasDetails &&
              "hover:text-brand-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          )}
        >
          {loc.name}
          {hasDetails && (
            <InformationCircleIcon
              className="mt-px h-3 w-3 shrink-0 text-fg-subtle sm:h-3.5 sm:w-3.5"
              aria-hidden
            />
          )}
        </Tooltip>
      </h3>
    </div>
  );
}
