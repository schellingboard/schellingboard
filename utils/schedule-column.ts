import type { Session } from "@/db/repositories/interfaces";
import { shownStart } from "@/utils/agenda";
import { gridBlockPx } from "@/utils/slots";

export type ColumnItem =
  | { kind: "session"; session: Session; topPx: number; heightPx: number }
  | { kind: "free"; start: Date; topPx: number; heightPx: number };

/**
 * One room's day on the schedule grid: each session placed by the minute as
 * attendees see it, and a cell for each slot the room has entirely free.
 */
export function locationColumn(input: {
  sessions: Session[];
  day: { start: Date; end: Date };
  incrementMinutes: number;
  breakMinutes: number;
}): ColumnItem[] {
  const { sessions, day, incrementMinutes, breakMinutes } = input;
  const block = (from: Date, to: Date) =>
    gridBlockPx(day.start, from, to, incrementMinutes);
  const scheduled = sessions.filter(
    (s): s is Session & { startTime: Date; endTime: Date } =>
      !!s.startTime && !!s.endTime
  );
  const items: ColumnItem[] = scheduled.map((session) => ({
    kind: "session",
    session,
    ...block(shownStart(session, breakMinutes), session.endTime),
  }));

  const slotMs = incrementMinutes * 60 * 1000;
  for (let t = day.start.getTime(); t < day.end.getTime(); t += slotMs) {
    const start = new Date(t);
    const end = new Date(t + slotMs);
    const occupied = scheduled.some(
      (s) => s.startTime < end && s.endTime > start
    );
    if (!occupied) items.push({ kind: "free", start, ...block(start, end) });
  }
  return items.sort((a, b) => a.topPx - b.topPx);
}
