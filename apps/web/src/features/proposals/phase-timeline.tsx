import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { EventPhase, phaseTimeline } from "@schellingboard/domain/phase";
import { formatInLocalZone } from "@schellingboard/domain/time";
import { toEvent } from "../../replica/selectors";
import { CheckIcon } from "../../ui/icons";
import { cx } from "../../ui/cx";

const NAMES = {
  [EventPhase.PROPOSAL]: "Proposals",
  [EventPhase.VOTING]: "Voting",
  [EventPhase.SCHEDULING]: "Scheduling",
};

export function PhaseTimeline({
  event,
  now,
  localZone,
}: {
  event: Snapshot["event"];
  now: Date;
  localZone: string | null;
}) {
  const e = toEvent(event);
  const steps = phaseTimeline(e, now);
  if (steps.length === 0) return null;
  const beforeFirst = steps.every((s) => s.state === "upcoming");
  return (
    <ol aria-label="Event phases" className="flex flex-wrap gap-2 text-sm">
      {steps.map(({ phase, start, state }) => (
        <li
          key={phase}
          aria-current={state === "current" ? "step" : undefined}
          className={cx(
            "flex items-center gap-1 rounded-full border px-3 py-1",
            state === "current"
              ? "border-brand bg-brand font-semibold text-on-brand"
              : "border-line text-fg-subtle"
          )}
        >
          {state === "past" && <CheckIcon className="h-4 w-4" />}
          <span>
            {NAMES[phase]}
            {state === "skipped" && " (skipped)"}
            {start &&
              `${beforeFirst && phase === EventPhase.PROPOSAL ? " opens" : " ·"} ${formatInLocalZone(start, e.timezone, localZone)}`}
            {state === "past" && <span className="sr-only"> (done)</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
