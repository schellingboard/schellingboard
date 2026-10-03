import type { Event } from "./event";

export enum EventPhase {
  PROPOSAL = "proposal",
  VOTING = "voting",
  SCHEDULING = "scheduling",
  INACTIVE = "inactive",
}

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
export function inVotingPhase(event: Event, now: Date): boolean {
  const { votingPhaseStart, votingPhaseEnd, schedulingPhaseStart } = event;
  const effectiveEnd = votingPhaseEnd ?? schedulingPhaseStart;
  return !!(
    votingPhaseStart && inDatePeriod(now, votingPhaseStart, effectiveEnd)
  );
}

export function inSchedPhase(event: Event, now: Date): boolean {
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

export function getCurrentPhase(event: Event, now: Date): EventPhase {
  if (inProposalPhase(event, now)) return EventPhase.PROPOSAL;
  if (inVotingPhase(event, now)) return EventPhase.VOTING;
  if (inSchedPhase(event, now)) return EventPhase.SCHEDULING;
  return EventPhase.INACTIVE;
}

export function hasPhases(event: Event): boolean {
  const { proposalPhaseStart, votingPhaseStart, schedulingPhaseStart } = event;

  return !!(proposalPhaseStart || votingPhaseStart || schedulingPhaseStart);
}
