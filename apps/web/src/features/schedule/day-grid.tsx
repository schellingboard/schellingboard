import { DateTime } from "luxon";
import { t } from "@lingui/core/macro";
import type { Location } from "@schellingboard/domain/location";
import { getNumSlots } from "@schellingboard/domain/slots";
import { useClockStyle } from "../../app/time-format";
import { InformationCircleIcon } from "../../ui/icons";
import { Tooltip } from "../../ui/tooltip";
import { cx } from "../../ui/cx";
import { LocationPlaceholder } from "../../ui/location-placeholder";
import { useSchedule } from "./context";
import { getNowOffsetPx, GUTTER } from "./grid-layout";
import { LocationCol } from "./location-col";
import { meetingsForDay, takesPartInMeetings } from "./meeting-column";
import { MeetingsCol } from "./meetings-col";
import type { DayWithSessions } from "./model";
import { MomentBands } from "./moment-band";
import { NowLine } from "./now-line";
import { OneOnOnePicture } from "./one-on-one-picture";

const AXIS_24H = "HH:mm";
const AXIS_12H_HOUR = "h a";
const AXIS_12H = "h:mm";

const maxCapacity = (capacity: number) => t`max ${capacity}`;

/**
 * One day is a single CSS grid: column 1 is the time gutter, the rest are the
 * rooms. The room-name row sticks to the top and the gutter to the left, so
 * both stay visible while the schedule scrolls; no scroll listeners.
 */
export function DayGrid({
  day,
  locations,
  stickyTop,
  first,
}: {
  day: DayWithSessions;
  locations: Location[];
  /** The first day has the toolbar above it, so no top line of its own. */
  first: boolean;
  /** Where the room headers stick: below whatever is pinned above them. */
  stickyTop: number;
}) {
  const { data, timezone, slotIncrement } = useSchedule();
  const numSlots = getNumSlots(day.start, day.end, slotIncrement);
  const firstImageIndex = locations.findIndex((loc) => loc.imageUrl);
  const date = DateTime.fromJSDate(day.start).setZone(timezone);
  const clockStyle = useClockStyle();
  const axisFormat = (at: DateTime) =>
    clockStyle === "24h"
      ? AXIS_24H
      : at.minute === 0
        ? AXIS_12H_HOUR
        : AXIS_12H;
  // Null on any day that isn't today. `now` is the server's clock, the dev
  // fake clock included.
  const nowOffsetPx = getNowOffsetPx(day, data.now, slotIncrement);
  // Decided for the whole event rather than day by day, and outside the
  // ?loc= narrowing: the column is not a room, so the rooms line up from one
  // day to the next whatever is shown (issue #392, section 2.6).
  const showMeetings = takesPartInMeetings(data.meetings, data.availability);
  // Rows before the body: header, area text, and room photos if any. The
  // bands are absolute, so they must name their row to stay out of auto-placement.
  const bodyRow = firstImageIndex !== -1 ? 4 : 3;

  return (
    <div
      className="relative grid bg-surface"
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
        className={cx(
          "sticky left-0 z-21 flex flex-col justify-end border-r border-b border-line-subtle bg-surface p-1 leading-tight",
          !first && "border-t"
        )}
      >
        <span className="text-[11px] font-bold">{date.toFormat("EEE")}</span>
        <span className="text-[10px] text-fg-subtle">
          {date.toFormat("MMM d")}
        </span>
      </div>
      {showMeetings && (
        <div
          style={{ top: stickyTop }}
          className={cx(
            "sticky z-20 border-b border-l border-line-subtle bg-surface p-1",
            !first && "border-t"
          )}
        >
          <h3 className="text-xs font-semibold sm:text-sm">{t`1-on-1s`}</h3>
        </div>
      )}
      {locations.map((loc) => (
        <RoomHeader
          key={loc.id}
          location={loc}
          stickyTop={stickyTop}
          first={first}
        />
      ))}
      <div className="sticky left-0 z-20 border-r border-line-subtle bg-surface" />
      {showMeetings && (
        <div className="border-l border-line-subtle p-1">
          <p className="text-[10px] text-fg-subtle">{t`Only you see these`}</p>
        </div>
      )}
      {locations.map((loc) => (
        <div key={loc.id} className="border-l border-line-subtle p-1">
          <p className="text-[10px] text-fg-subtle">
            {loc.areaDescription ?? <br />}
          </p>
          <p className="text-[10px] text-fg-subtle">
            {loc.capacity ? maxCapacity(loc.capacity) : <br />}
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
              {loc.imageUrl ? (
                <img
                  src={loc.imageUrl}
                  alt={loc.name}
                  loading={i === firstImageIndex ? "eager" : "lazy"}
                  className="aspect-[4/3] w-full object-cover"
                  style={{ maxHeight: 200 }}
                  width={500}
                  height={375}
                />
              ) : (
                <LocationPlaceholder
                  className="aspect-[4/3] h-auto w-full"
                  style={{ maxHeight: 200 }}
                  width={500}
                  height={375}
                />
              )}
            </div>
          ))}
        </>
      )}
      <MomentBands day={day} column={showMeetings ? 3 : 2} row={bodyRow} />
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
            {(() => {
              const at = DateTime.fromMillis(
                day.start.getTime() + i * slotIncrement * 60 * 1000
              ).setZone(timezone);
              return at.toFormat(axisFormat(at));
            })()}
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
  first,
}: {
  location: Location;
  stickyTop: number;
  first: boolean;
}) {
  const whereAndSize = [
    loc.areaDescription,
    loc.capacity ? maxCapacity(loc.capacity) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const hasDetails = !!(loc.description || whereAndSize);
  return (
    <div
      style={{ top: stickyTop }}
      className={cx(
        "sticky z-20 border-b border-l border-line-subtle bg-surface p-1",
        !first && "border-t"
      )}
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
