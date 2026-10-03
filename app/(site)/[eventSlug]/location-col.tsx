import type { Session } from "@/db/repositories/interfaces";
import type { Location } from "@schellingboard/domain/location";
import type { Guest } from "@schellingboard/domain/guest";
import type { DayWithSessions } from "@/app/(site)/context";
import { useContext } from "react";
import {
  EventContext,
  useBreakMinutes,
  useSlotIncrement,
} from "@/app/(site)/context";
import { SessionBlock } from "./session-block";
import { NowLine } from "./now-line";
import { getNumSlots, SLOT_HEIGHT_PX } from "@/utils/slots";
import { locationColumn } from "@/utils/schedule-column";

export function LocationCol(props: {
  sessions: Session[];
  location: Location;
  day: DayWithSessions;
  guests: Guest[];
  /** Now-line offset from the top of the slot grid; null hides it. */
  nowOffsetPx?: number | null;
}) {
  const { sessions, location, day, guests, nowOffsetPx } = props;
  const slotIncrement = useSlotIncrement();
  const breakMinutes = useBreakMinutes();
  const { unavailability } = useContext(EventContext);
  const items = locationColumn({
    sessions,
    unavailable: unavailability.filter((u) => u.locationId === location.id),
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
          guests={guests}
        />
      ))}
      {/* Each column draws its own segment of the now line; together with the
          gutter's segment (see DayGrid) they form one continuous line across
          the day. */}
      {nowOffsetPx != null && <NowLine offsetPx={nowOffsetPx} />}
    </div>
  );
}
