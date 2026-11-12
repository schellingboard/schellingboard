import type { Event } from "./event";

export enum EventPhase {
  PROPOSAL = "proposal",
  VOTING = "voting",
  SCHEDULING = "scheduling",
  INACTIVE = "inactive",
}

export type SchedPhaseDates = Pick<
  Event,
  | "proposalPhaseStart"
  | "votingPhaseStart"
  | "schedulingPhaseStart"
  | "schedulingPhaseEnd"
>;

export type VotingPhaseDates = Pick<
  Event,
  "votingPhaseStart" | "votingPhaseEnd" | "schedulingPhaseStart"
>;

/**
 * The interval is half-open `[start, end)`: the end is exclusive so that
 * touching phases (where one phase's implicit end equals the next phase's
 * start) hand over cleanly at the boundary instead of overlapping for one
 * instant.
 */
function inDatePeriod(now: Date, start: Date, end?: Date): boolean {
  const nowMs = now.getTime();
  const afterStart = nowMs >= start.getTime();
  const beforeEnd = !end || nowMs < end.getTime();
  return afterStart && beforeEnd;
}

/**
 * A phase without an explicit end is treated as ending when the next
 * configured phase starts, so an open-ended proposal phase does not mask
 * voting/scheduling. An explicit end set before the next phase start creates
 * an intentional inactive gap.
 */
export function inProposalPhase(event: Event, now: Date): boolean {
  const {
    proposalPhaseStart,
    proposalPhaseEnd,
    votingPhaseStart,
    schedulingPhaseStart,
  } = event;
  const effectiveEnd =
    proposalPhaseEnd ?? votingPhaseStart ?? schedulingPhaseStart;
  return !!(
    proposalPhaseStart && inDatePeriod(now, proposalPhaseStart, effectiveEnd)
  );
}

/** An open-ended voting phase is treated as ending when scheduling starts. */
export function inVotingPhase(event: VotingPhaseDates, now: Date): boolean {
  const { votingPhaseStart, votingPhaseEnd, schedulingPhaseStart } = event;
  const effectiveEnd = votingPhaseEnd ?? schedulingPhaseStart;
  return !!(
    votingPhaseStart && inDatePeriod(now, votingPhaseStart, effectiveEnd)
  );
}

export function inSchedPhase(event: SchedPhaseDates, now: Date): boolean {
  const { schedulingPhaseStart, schedulingPhaseEnd } = event;

  // If no phases are configured, assume scheduling is always active
  if (!hasPhases(event)) {
    return true;
  }

  return !!(
    schedulingPhaseStart &&
    inDatePeriod(now, schedulingPhaseStart, schedulingPhaseEnd)
  );
}

/** Past events stay readable: the schedule remains visible after scheduling closes. */
export function schedulingEnded(
  event: Pick<Event, "schedulingPhaseEnd">,
  now: Date
): boolean {
  return (
    !!event.schedulingPhaseEnd &&
    now.getTime() >= event.schedulingPhaseEnd.getTime()
  );
}

export function getCurrentPhase(event: Event, now: Date): EventPhase {
  if (inProposalPhase(event, now)) return EventPhase.PROPOSAL;
  if (inVotingPhase(event, now)) return EventPhase.VOTING;
  if (inSchedPhase(event, now)) return EventPhase.SCHEDULING;
  return EventPhase.INACTIVE;
}

export type PhaseStep = {
  phase: EventPhase.PROPOSAL | EventPhase.VOTING | EventPhase.SCHEDULING;
  start?: Date;
  state: "past" | "current" | "upcoming" | "skipped";
  /** Of the whole timeline, 0 to 1: the phase's real length, never too small to read. */
  share: number;
};

const MIN_SHARE = 0.2;

function phaseShares(starts: (Date | undefined)[], end?: Date): number[] {
  const lengths = starts.map((start, i) => {
    if (!start) return undefined;
    const next = starts.slice(i + 1).find(Boolean) ?? end;
    return next && next > start ? next.getTime() - start.getTime() : undefined;
  });
  const known = lengths.filter((l): l is number => l !== undefined);
  const mean = known.length
    ? known.reduce((sum, l) => sum + l, 0) / known.length
    : 1;
  const weights = lengths.map((l) => l ?? mean);
  const atMin = starts.map((s, i) => !s && starts.slice(i + 1).some(Boolean));
  for (;;) {
    const free = weights.filter((_, i) => !atMin[i]);
    const room = 1 - atMin.filter(Boolean).length * MIN_SHARE;
    const total = free.reduce((sum, w) => sum + w, 0);
    const short = weights.findIndex(
      (w, i) => !atMin[i] && (w / total) * room < MIN_SHARE
    );
    if (short === -1 || free.length <= 1) {
      return weights.map((w, i) =>
        atMin[i] ? MIN_SHARE : free.length === 1 ? room : (w / total) * room
      );
    }
    atMin[short] = true;
  }
}

/**
 * Where phases overlap, the latest one running is the current one. A phase
 * without a start date is skipped once a later phase has started.
 */
export function phaseTimeline(event: Event, now: Date): PhaseStep[] {
  if (!hasPhases(event)) return [];
  const steps = [
    {
      phase: EventPhase.PROPOSAL,
      start: event.proposalPhaseStart,
      running: inProposalPhase(event, now),
    },
    {
      phase: EventPhase.VOTING,
      start: event.votingPhaseStart,
      running: inVotingPhase(event, now),
    },
    {
      phase: EventPhase.SCHEDULING,
      start: event.schedulingPhaseStart,
      running: inSchedPhase(event, now),
    },
  ] as const;
  const current = [...steps].reverse().find((s) => s.running)?.phase;
  const started = (start?: Date) => !!start && start.getTime() <= now.getTime();
  const shares = phaseShares(
    steps.map((s) => s.start),
    event.schedulingPhaseEnd
  );
  return steps.map(({ phase, start }, i) => ({
    phase,
    start,
    share: shares[i] ?? 1 / steps.length,
    state:
      phase === current
        ? "current"
        : started(start)
          ? "past"
          : !start && steps.slice(i + 1).some((s) => started(s.start))
            ? "skipped"
            : "upcoming",
  }));
}

/** Whether the schedule can be viewed but not acted on: any time outside the scheduling phase. */
export function scheduleReadOnly(event: SchedPhaseDates, now: Date): boolean {
  return !inSchedPhase(event, now);
}

export function hasPhases(event: SchedPhaseDates): boolean {
  const { proposalPhaseStart, votingPhaseStart, schedulingPhaseStart } = event;

  return !!(proposalPhaseStart || votingPhaseStart || schedulingPhaseStart);
}
