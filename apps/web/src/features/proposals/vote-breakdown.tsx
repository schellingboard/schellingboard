import { plural, select, t } from "@lingui/core/macro";
import { Plural, Select, Trans } from "@lingui/react/macro";
import {
  type AttendanceRange,
  MIN_TURNOUT_PCT_FOR_ESTIMATE,
} from "@schellingboard/domain/proposal-vote-stats";
import { VoteChoice } from "@schellingboard/domain/vote";
import {
  VOTE_CHOICES,
  voteChoiceToEmoji,
} from "@schellingboard/domain/vote-display";
import { useId } from "react";

import type { VoteBreakdown as VoteBreakdownStats } from "../../queries/proposal-detail";

function Estimate({ range }: { range: AttendanceRange }) {
  const { low, high } = range;
  const kind = low === high ? "same" : "range";
  return (
    <p className="mt-2 text-fg-subtle">
      <Trans>
        If you decide to host this as a session, expect{" "}
        <span className="font-medium text-fg-muted">
          <Select
            value={kind}
            _same={<Plural value={low} one="# person" other="# people" />}
            other={
              <Plural
                value={high}
                one={`${low}–# person`}
                other={`${low}–# people`}
              />
            }
          />
        </span>
        . Treat that as a very rough guess: it comes from a formula worked out
        on a single event, from what a handful of hosts there remembered about
        how many people turned up. It can be well out in either direction — use
        it to pick a room, nothing more. Future SchellingBoard versions should
        do better, as we incorporate more event feedback.
      </Trans>
    </p>
  );
}

function choiceLine(choice: VoteChoice, count: number, percent: number | null) {
  const emoji = voteChoiceToEmoji(choice);
  return percent === null
    ? t`${emoji} ${select(choice, { interested: "Interested", maybe: "Maybe", skip: "Skip", other: "" })}: ${count}`
    : t`${emoji} ${select(choice, { interested: "Interested", maybe: "Maybe", skip: "Skip", other: "" })}: ${count} (${percent}% of votes)`;
}

export function VoteBreakdown({ stats }: { stats: VoteBreakdownStats }) {
  const headingId = useId();
  const minTurnout = MIN_TURNOUT_PCT_FOR_ESTIMATE;
  const interestedEmoji = voteChoiceToEmoji(VoteChoice.interested);
  const { votes, attendees, nonVoters } = stats;
  const votesPercent = stats.votesPctOfAttendees;
  const nonVotersPercent = stats.nonVotersPctOfAttendees;
  const votesLine =
    votesPercent === null
      ? t`Votes: ${votes} of ${plural(attendees, { one: "# attendee", other: "# attendees" })}`
      : t`Votes: ${votes} of ${plural(attendees, { one: "# attendee", other: "# attendees" })} (${votesPercent}%)`;
  const nonVotersLine =
    nonVotersPercent === null
      ? t`Did not vote: ${plural(nonVoters, { one: "# attendee", other: "# attendees" })}`
      : t`Did not vote: ${plural(nonVoters, { one: "# attendee", other: "# attendees" })} (${nonVotersPercent}%)`;

  const perChoice: Record<
    VoteChoice,
    { count: number; pctOfVotes: number | null }
  > = {
    [VoteChoice.interested]: {
      count: stats.interested,
      pctOfVotes: stats.interestedPctOfVotes,
    },
    [VoteChoice.maybe]: {
      count: stats.maybe,
      pctOfVotes: stats.maybePctOfVotes,
    },
    [VoteChoice.skip]: {
      count: stats.skip,
      pctOfVotes: stats.skipPctOfVotes,
    },
  };

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-md border border-line-subtle bg-surface-sunken px-3 py-2 text-sm text-fg-muted"
    >
      <h3 id={headingId} className="font-medium text-fg">
        <Trans>Vote breakdown</Trans>
      </h3>
      <ul className="mt-2 space-y-1">
        <li>{votesLine}</li>
        <li>{nonVotersLine}</li>
        {VOTE_CHOICES.map((choice) => (
          <li key={choice}>
            {choiceLine(
              choice,
              perChoice[choice].count,
              perChoice[choice].pctOfVotes
            )}
          </li>
        ))}
      </ul>
      {stats.estimatedAttendance && (
        <Estimate range={stats.estimatedAttendance} />
      )}
      {stats.noEstimateReason === "low-turnout" && (
        <p className="mt-2 text-fg-subtle">
          {t`Too few attendees voted to guess at attendance — fewer than ${minTurnout}% of them did, so a couple of votes either way would decide the number.`}
        </p>
      )}
      {stats.noEstimateReason === "no-interest" && (
        <p className="mt-2 text-fg-subtle">
          {t`Nobody voted ${interestedEmoji} Interested, and that is the only signal there is to guess attendance from.`}
        </p>
      )}
      {stats.noEstimateReason === "unknown-event" && (
        <p className="mt-2 text-fg-subtle">
          {t`There is nothing to measure this against yet — guessing at attendance needs the event's attendee list and ${interestedEmoji} votes on its other proposals.`}
        </p>
      )}
    </section>
  );
}
