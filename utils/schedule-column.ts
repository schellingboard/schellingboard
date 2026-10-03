import type { Session } from "@schellingboard/domain/session";
import { gridBlockPx } from "@/utils/slots";

export type ColumnItem =
  | { kind: "session"; session: Session; topPx: number; heightPx: number }
  | { kind: "free"; start: Date; topPx: number; heightPx: number };

type Scheduled = Session & { startTime: Date; endTime: Date };

type Interval = { start: Date; end: Date };

const MS_PER_MINUTE = 60 * 1000;

/**
 * Whether a session booked into the slot at `slotStart` could run for one
 * slot: the room is free from the end of the slot's break to its end.
 */
export function slotIsFree(
  sessions: Pick<Session, "startTime" | "endTime">[],
  slotStart: Date,
  incrementMinutes: number,
  breakMinutes: number
): boolean {
  const from = slotStart.getTime() + breakMinutes * MS_PER_MINUTE;
  const until = slotStart.getTime() + incrementMinutes * MS_PER_MINUTE;
  return !sessions.some(
    (s) =>
      !!s.startTime &&
      !!s.endTime &&
      s.startTime.getTime() < until &&
      s.endTime.getTime() > from
  );
}

/**
 * One room's day on the schedule grid: each session placed by the minute, and
 * a cell for each slot a session could still be booked into.
 */
export function locationColumn(input: {
  sessions: Session[];
  unavailable?: Interval[];
  day: { start: Date; end: Date };
  incrementMinutes: number;
  breakMinutes: number;
}): ColumnItem[] {
  const {
    sessions,
    unavailable = [],
    day,
    incrementMinutes,
    breakMinutes,
  } = input;
  const block = (from: Date, to: Date) =>
    gridBlockPx(day.start, from, to, incrementMinutes);
  const scheduled = sessions.filter(
    (s): s is Scheduled => !!s.startTime && !!s.endTime
  );
  const items: ColumnItem[] = scheduled.map((session) => ({
    kind: "session",
    session,
    ...block(session.startTime, session.endTime),
  }));

  const occupied = [
    ...scheduled,
    ...unavailable.map((u) => ({ startTime: u.start, endTime: u.end })),
  ];
  const slotMs = incrementMinutes * MS_PER_MINUTE;
  for (let t = day.start.getTime(); t < day.end.getTime(); t += slotMs) {
    const start = new Date(t);
    if (!slotIsFree(occupied, start, incrementMinutes, breakMinutes)) continue;
    // A session may run into the slot's break; the cell starts where it ends.
    const top = Math.max(
      t,
      ...occupied
        .map((s) => s.endTime.getTime())
        .filter((end) => end > t && end < t + slotMs)
    );
    items.push({
      kind: "free",
      start,
      ...block(new Date(top), new Date(t + slotMs)),
    });
  }
  return items.sort((a, b) => a.topPx - b.topPx);
}
