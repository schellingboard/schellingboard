import type { Event } from "@schellingboard/domain/event";
import { EventPhase, phaseTimeline } from "@schellingboard/domain/phase";
import { formatInLocalZone } from "@schellingboard/domain/time";

import { cx } from "./cx";
import { CheckIcon } from "./icons";
import { useNotify } from "./notices";
import { Tooltip } from "./tooltip";

const NAMES = {
  [EventPhase.PROPOSAL]: "Proposals",
  [EventPhase.VOTING]: "Voting",
  [EventPhase.SCHEDULING]: "Scheduling",
};

const WHAT = {
  [EventPhase.PROPOSAL]: "Attendees propose sessions and comment on them",
  [EventPhase.VOTING]: "Attendees vote on the proposals",
  [EventPhase.SCHEDULING]:
    "Vote counts show, sessions are scheduled, and attendees RSVP",
};

const ARROW =
  "polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%, 6px 50%)";

/**
 * Where the event is in its phases, for reading only: no link or button
 * look. Gone once scheduling has started, when the phases no longer matter.
 */
export function PhaseBar({
  event,
  now,
  localZone,
}: {
  event: Event;
  now: Date;
  localZone: string | null;
}) {
  const notify = useNotify();
  const steps = phaseTimeline(event, now);
  const scheduling = steps.find((s) => s.phase === EventPhase.SCHEDULING);
  if (!scheduling) return null;
  if (scheduling.state === "current" || scheduling.state === "past") {
    return null;
  }
  return (
    <ol
      aria-label="Event phases"
      className="flex w-full gap-1 border-b border-line-subtle bg-surface px-3 py-1.5 text-xs"
    >
      {steps.map(({ phase, start, end, state, share }) => {
        const when = (date: Date) =>
          formatInLocalZone(date, event.timezone, localZone);
        const explain = [
          `${NAMES[phase]} phase${state === "skipped" ? " (skipped)" : ""}: ${WHAT[phase]}${phase === EventPhase.SCHEDULING && event.meetingsEnabled ? " and book 1-on-1s" : ""}.`,
          start && `${start <= now ? "Started" : "Starts"} ${when(start)}.`,
          end && `${end <= now ? "Ended" : "Ends"} ${when(end)}.`,
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <li
            key={phase}
            aria-current={state === "current" ? "step" : undefined}
            style={{ flex: `${share} 1 0` }}
            className={cx(
              "flex min-w-0",
              state === "current" ? "font-semibold text-fg" : "text-fg-subtle"
            )}
          >
            <Tooltip content={explain} className="flex min-w-0 flex-1">
              <button
                type="button"
                onClick={() =>
                  notify({
                    tone: "info",
                    message: explain,
                    autoDismissMs: 8000,
                  })
                }
                className="flex min-w-0 flex-1 flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              >
                <span className="flex items-center gap-0.5">
                  {state === "past" && (
                    <CheckIcon className="h-3 w-3 shrink-0 stroke-2" />
                  )}
                  <span className="truncate">{NAMES[phase]}</span>
                  {state === "skipped" && (
                    <span className="truncate"> (skipped)</span>
                  )}
                  {state === "past" && <span className="sr-only"> (done)</span>}
                </span>
                {start && (
                  <span className="mb-0.5 block text-[10px] font-normal leading-tight">
                    <span className="sr-only">, </span>
                    {when(start)}
                  </span>
                )}
                <span
                  aria-hidden
                  style={{ clipPath: ARROW }}
                  className={cx(
                    "mt-auto block h-1.5 shrink-0",
                    state === "current"
                      ? "bg-brand"
                      : state === "past"
                        ? "bg-fg-subtle"
                        : "bg-line"
                  )}
                />
              </button>
            </Tooltip>
          </li>
        );
      })}
    </ol>
  );
}
