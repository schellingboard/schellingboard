import type { Location } from "@schellingboard/domain/location";
import type { Session } from "@schellingboard/domain/session";
import { getNumSlots } from "@schellingboard/domain/slots";
import { locationColumn } from "./column";
import { useSchedule } from "./context";
import { SLOT_HEIGHT_PX } from "./grid-layout";
import { NowLine } from "./now-line";
import type { DayWithSessions } from "./model";
import { SessionBlock } from "./session-block";

export function LocationCol({
  sessions,
  location,
  day,
  nowOffsetPx,
}: {
  sessions: Session[];
  location: Location;
  day: DayWithSessions;
  /** Now-line offset from the top of the slot grid; null hides it. */
  nowOffsetPx?: number | null;
}) {
  const { data, slotIncrement, breakMinutes } = useSchedule();
  const items = locationColumn({
    sessions,
    unavailable: data.unavailability.filter(
      (u) => u.locationId === location.id
    ),
    day,
    incrementMinutes: slotIncrement,
    breakMinutes,
  });
  const numSlots = getNumSlots(day.start, day.end, slotIncrement);
  return (
    <div className="relative" style={{ height: numSlots * SLOT_HEIGHT_PX }}>
      {items.map((item) => (
        <SessionBlock
          day={day}
          key={
            item.kind === "session"
              ? item.session.id
              : `free-${item.start.toISOString()}`
          }
          item={item}
          location={location}
        />
      ))}
      {nowOffsetPx != null && <NowLine offsetPx={nowOffsetPx} />}
    </div>
  );
}
