import { useState } from "react";
import { DateTime } from "luxon";
import { shownSlotStart } from "@schellingboard/domain/meeting-slots";
import { getNumSlots } from "@schellingboard/domain/slots";
import { cx } from "../../ui/cx";
import { Dialog } from "../../ui/dialog";
import { PlusIcon } from "../../ui/icons";
import { Tooltip } from "../../ui/tooltip";
import {
  CURRENT_MATCH_CLASS,
  GHOST_CLASS,
  useSchedule,
  useScheduleMatch,
} from "./context";
import { SLOT_HEIGHT_PX } from "./grid-layout";
import { clashLines } from "./meeting-clash-text";
import { meetingColumnRows } from "./meeting-column";
import {
  blockStatus,
  blockTimeLabel,
  meetingTitle,
  needsReply,
  slotSummaryLine,
  statusLine,
} from "./meeting-rules";
import type { MeetingView, MeetingViewStatus } from "./meeting-view";
import type { DayWithSessions } from "./model";
import { NowLine } from "./now-line";
import {
  PositionedBlock,
  TITLE_MIN_PX,
  type Position,
} from "./positioned-block";

const NO_MATCH = " — doesn't match";

// Pending reads as unfinished business, not a plan.
const stateClasses = (status: MeetingViewStatus) =>
  status === "accepted"
    ? "bg-brand-tint border-brand-accent"
    : "bg-surface-muted border-dashed border-line";

/** "14:40", in the event's zone, for a control's accessible name. */
function slotLabel(start: string, breakMinutes: number, timezone: string) {
  return DateTime.fromJSDate(shownSlotStart(new Date(start), breakMinutes))
    .setZone(timezone)
    .toFormat("HH:mm");
}

/**
 * An empty slot of the column, which is a way in while it is still ahead.
 * Once it is past it is plain scenery: the request is refused for a slot that
 * has begun, so offering it, even greyed out, would promise nothing.
 */
function SlotCell({
  position,
  start,
  blocked,
  bookable,
}: {
  position: Position;
  start: string;
  /** The viewer cleared this slot, so nobody may book *them* into it. */
  blocked: boolean;
  bookable: boolean;
}) {
  const { links, breakMinutes, timezone } = useSchedule();
  const { filtering } = useScheduleMatch();
  const shape = cx(
    "flex h-full w-full items-center justify-center rounded",
    blocked && "meetings-col-blocked",
    filtering && GHOST_CLASS
  );

  if (!bookable)
    return (
      <PositionedBlock position={position}>
        <div className={shape} />
      </PositionedBlock>
    );

  const label = slotLabel(start, breakMinutes, timezone);
  return (
    <PositionedBlock position={position}>
      <a
        href={links.bookMeeting(start)}
        // Hatching says who may book *them*; it is no bar to arranging a
        // 1-on-1 there themselves, so the slot stays as bookable as any other.
        aria-label={
          blocked
            ? `Arrange a 1-on-1 at ${label} — you are not offering this slot to others`
            : `Arrange a 1-on-1 at ${label}`
        }
        className={cx(
          shape,
          "border border-dashed border-line-subtle text-fg-faint transition-colors",
          "hover:border-brand-accent hover:bg-brand-tint hover:text-brand-fg"
        )}
      >
        <PlusIcon className="h-4 w-4" aria-hidden="true" />
      </a>
    </PositionedBlock>
  );
}

// What the block has no room for, on hover.
function MeetingSummary({ meeting }: { meeting: MeetingView }) {
  return (
    <div className="space-y-1 p-2">
      <p className="text-sm font-semibold text-fg">{meetingTitle(meeting)}</p>
      <p className="text-xs text-fg-muted">
        {meeting.timeLabel} · {meeting.meetingPoint}
      </p>
      <p className="text-xs text-fg">{statusLine(meeting)}</p>
      {meeting.message && (
        <p className="line-clamp-3 text-xs text-fg-muted">
          “{meeting.message}”
        </p>
      )}
      {meeting.clashes.length > 0 && (
        <p className="text-xs text-fg">
          {clashLines(meeting.clashes)} during this slot.
        </p>
      )}
    </div>
  );
}

/** The slot's 1-on-1s at a glance, for a block with no room to name them. */
function SlotSummary({ meetings }: { meetings: MeetingView[] }) {
  const { breakMinutes, timezone } = useSchedule();
  return (
    <div className="space-y-1 p-2">
      <p className="text-sm font-semibold text-fg">
        {meetings.length} 1-on-1s ·{" "}
        {blockTimeLabel(meetings, breakMinutes, timezone)}
      </p>
      <ul className="space-y-0.5">
        {meetings.map((meeting) => (
          <li key={meeting.id} className="text-xs text-fg-muted">
            <span className="font-medium text-fg">{meeting.otherName}</span> —{" "}
            {statusLine(meeting)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * One 1-on-1, alone in its slot: room for the place and the state as well,
 * unless the block is short, when a dot marks one waiting on the reader.
 */
function MeetingBlock({
  meeting,
  heightPx,
}: {
  meeting: MeetingView;
  heightPx: number;
}) {
  const { links, params, breakMinutes, timezone } = useSchedule();
  const { filtering, matchesMeeting, currentMatchId } = useScheduleMatch();
  const ghost = filtering && !matchesMeeting(meeting);
  return (
    <Tooltip
      content={<MeetingSummary meeting={meeting} />}
      className="flex min-w-0 flex-1"
    >
      <a
        href={links.meeting(params, meeting.id)}
        aria-label={`${meetingTitle(meeting)} at ${slotLabel(
          meeting.slotStart,
          breakMinutes,
          timezone
        )} · ${meeting.meetingPoint} — ${blockStatus(meeting)}${ghost ? NO_MATCH : ""}`}
        data-match-id={filtering && !ghost ? meeting.id : undefined}
        className={cx(
          "min-w-0 flex-1 overflow-hidden rounded border-2 px-1 py-0.5 font-roboto",
          stateClasses(meeting.status),
          ghost && GHOST_CLASS,
          currentMatchId === meeting.id && CURRENT_MATCH_CLASS
        )}
      >
        {heightPx >= TITLE_MIN_PX && (
          <p className="flex items-center gap-1 text-xs font-medium leading-[1.15] text-fg">
            <span className="truncate">{meeting.otherName}</span>
            {heightPx < 38 && needsReply(meeting) && (
              <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-warning-fg" />
            )}
          </p>
        )}
        {heightPx >= 50 ? (
          <>
            <p className="line-clamp-1 text-[10px] leading-[1.15] text-fg-muted">
              {meeting.meetingPoint}
            </p>
            <p className="text-[10px] leading-[1.15] text-fg-subtle">
              {blockStatus(meeting)}
            </p>
          </>
        ) : heightPx >= 38 ? (
          // Room for a name and one more line; the place gives way first,
          // since the state is what may want answering.
          <p className="flex gap-1 text-[10px] leading-[1.15] text-fg-subtle">
            <span className="truncate text-fg-muted">
              {meeting.meetingPoint}
            </span>
            <span className="shrink-0">· {blockStatus(meeting)}</span>
          </p>
        ) : null}
      </a>
    </Tooltip>
  );
}

/**
 * One of several 1-on-1s stacked in a slot: full width and a name only, which
 * is what tells them apart. The dot marks one waiting on the reader.
 */
function StackEntry({ meeting }: { meeting: MeetingView }) {
  const { links, params, breakMinutes, timezone } = useSchedule();
  const { filtering, matchesMeeting, currentMatchId } = useScheduleMatch();
  const ghost = filtering && !matchesMeeting(meeting);
  return (
    <Tooltip
      content={<MeetingSummary meeting={meeting} />}
      className="flex min-h-0 min-w-0 flex-1"
    >
      <a
        href={links.meeting(params, meeting.id)}
        aria-label={`${meetingTitle(meeting)} at ${slotLabel(
          meeting.slotStart,
          breakMinutes,
          timezone
        )} — ${blockStatus(meeting)}${ghost ? NO_MATCH : ""}`}
        data-match-id={filtering && !ghost ? meeting.id : undefined}
        className={cx(
          "flex min-w-0 flex-1 items-center gap-1 overflow-hidden rounded-sm border-l-4 px-1 font-roboto",
          stateClasses(meeting.status),
          ghost && GHOST_CLASS,
          currentMatchId === meeting.id && CURRENT_MATCH_CLASS
        )}
      >
        <span className="truncate text-[11px] font-medium leading-none text-fg">
          {meeting.otherName}
        </span>
        {needsReply(meeting) && (
          <span
            aria-hidden="true"
            className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-warning-fg"
          />
        )}
      </a>
    </Tooltip>
  );
}

/**
 * A slot holding more 1-on-1s than the block can name: one full-size control
 * for the slot, which opens the list, rather than a row of unreadable slivers.
 */
function SlotBlock({
  meetings,
  heightPx,
  onOpen,
}: {
  meetings: MeetingView[];
  heightPx: number;
  onOpen: () => void;
}) {
  const { breakMinutes, timezone } = useSchedule();
  const { filtering, matchesMeeting, currentMatchId } = useScheduleMatch();
  const ghost = filtering && !meetings.some(matchesMeeting);
  const matchId = `slot-${meetings[0].slotStart}`;
  return (
    <Tooltip
      content={<SlotSummary meetings={meetings} />}
      className="flex min-w-0 flex-1"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${meetings.length} 1-on-1s, ${blockTimeLabel(
          meetings,
          breakMinutes,
          timezone
        )} — ${slotSummaryLine(meetings)}${ghost ? NO_MATCH : ""}`}
        data-match-id={filtering && !ghost ? matchId : undefined}
        className={cx(
          "flex min-w-0 flex-1 flex-col justify-center overflow-hidden rounded border-2 border-line bg-surface-muted px-1 text-left font-roboto hover:border-brand-accent",
          ghost && GHOST_CLASS,
          currentMatchId === matchId && CURRENT_MATCH_CLASS
        )}
      >
        {heightPx >= TITLE_MIN_PX && (
          <span className="text-xs font-semibold leading-[1.15] text-fg">
            {meetings.length} 1-on-1s
          </span>
        )}
        {heightPx >= 38 && (
          <span className="truncate text-[10px] leading-[1.15] text-fg-subtle">
            {slotSummaryLine(meetings)}
          </span>
        )}
      </button>
    </Tooltip>
  );
}

/** Everything in one slot, where there is room for it: name, time and state. */
function SlotMeetings({
  meetings,
  onClose,
}: {
  meetings: MeetingView[];
  onClose: () => void;
}) {
  const { links, params, breakMinutes, timezone } = useSchedule();
  return (
    <Dialog
      open
      onClose={onClose}
      title={`${meetings.length} 1-on-1s, ${blockTimeLabel(meetings, breakMinutes, timezone)}`}
    >
      <p className="text-sm text-fg-muted">{meetings[0].dayLabel}</p>
      <ul className="mt-3 flex max-h-72 flex-col gap-1 overflow-y-auto">
        {meetings.map((meeting) => (
          <li key={meeting.id}>
            <a
              href={links.meeting(params, meeting.id)}
              className="flex flex-col gap-0.5 rounded-md bg-surface-sunken p-2 hover:bg-surface-muted"
            >
              <span className="font-medium text-fg">{meeting.otherName}</span>
              <span className="text-xs text-fg-muted">
                {meeting.timeLabel} · {meeting.meetingPoint}
              </span>
              <span className="text-xs text-fg-subtle">
                {statusLine(meeting)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}

/**
 * The viewer's own 1-on-1s for one day, as the grid's first column, beside
 * the slots they cleared and the ones still open. Personal: never anyone
 * else's (issue #392, section 1.5). Read-only: arranging and answering are
 * done on the legacy pages for now.
 */
export function MeetingsCol({
  meetings,
  availability,
  day,
  nowOffsetPx,
}: {
  meetings: MeetingView[];
  /** Slot starts the viewer declared themselves open for, as ISO strings. */
  availability: string[];
  day: DayWithSessions;
  /** Now-line offset from the top of the slot grid; null hides it. */
  nowOffsetPx?: number | null;
}) {
  const { data, slotIncrement, breakMinutes } = useSchedule();
  // Which slot's list of its 1-on-1s is open, if any.
  const [openSlot, setOpenSlot] = useState<string | null>(null);
  const rows = meetingColumnRows({
    meetings,
    availability,
    day,
    slotIncrement,
    breakMinutes,
  });
  const numSlots = getNumSlots(day.start, day.end, slotIncrement);
  const openRow = rows.find(
    (candidate) => candidate.kind === "meetings" && candidate.start === openSlot
  );

  return (
    <div className="relative" style={{ height: numSlots * SLOT_HEIGHT_PX }}>
      {rows.map(
        ({ row, topPx, heightPx, start, kind, display, meetings: atRow }) =>
          kind !== "meetings" ? (
            <SlotCell
              key={row}
              position={{ top: topPx, height: heightPx }}
              start={start}
              blocked={kind === "unavailable"}
              bookable={new Date(start) > data.now}
            />
          ) : (
            <PositionedBlock
              key={row}
              position={{ top: topPx, height: heightPx }}
              className={cx(
                "flex gap-0.5",
                // Stacked, never side by side: this column is 96–160px wide.
                display === "stack" && "flex-col"
              )}
            >
              {display === "summary" ? (
                <SlotBlock
                  meetings={atRow}
                  heightPx={heightPx}
                  onOpen={() => setOpenSlot(start)}
                />
              ) : display === "stack" ? (
                atRow.map((meeting) => (
                  <StackEntry key={meeting.id} meeting={meeting} />
                ))
              ) : (
                <MeetingBlock meeting={atRow[0]} heightPx={heightPx} />
              )}
            </PositionedBlock>
          )
      )}
      {openRow && (
        <SlotMeetings
          meetings={openRow.meetings}
          onClose={() => setOpenSlot(null)}
        />
      )}
      {nowOffsetPx != null && <NowLine offsetPx={nowOffsetPx} />}
    </div>
  );
}
