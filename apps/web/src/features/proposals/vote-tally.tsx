import { plural, select } from "@lingui/core/macro";
import { VoteChoice } from "@schellingboard/domain/vote";
import { voteChoiceToEmoji } from "@schellingboard/domain/vote-display";

import { cx } from "../../ui/cx";
import { Tooltip } from "../../ui/tooltip";

function tallyTitle(choice: VoteChoice, count: number): string {
  return select(choice, {
    interested: plural(count, {
      one: "# interested vote",
      other: "# interested votes",
    }),
    maybe: plural(count, { one: "# maybe vote", other: "# maybe votes" }),
    other: "",
  });
}

// Skip votes are left out on purpose: this is the public tally, and it reads as
// interest in a proposal rather than as a scoreboard for it.
export function VoteTally({
  tally,
  className,
}: {
  tally: { interested: number; maybe: number } | null;
  className?: string;
}) {
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      {([VoteChoice.interested, VoteChoice.maybe] as const).map((choice) => {
        const count = tally?.[choice] ?? 0;
        const text = tallyTitle(choice, count);
        return (
          <Tooltip
            key={choice}
            content={text}
            toggleable
            triggerClassName="inline-flex items-center gap-1 text-sm text-fg-subtle"
          >
            <span aria-hidden>
              {voteChoiceToEmoji(choice)}&nbsp;{count}
            </span>
            <span className="sr-only">{text}</span>
          </Tooltip>
        );
      })}
    </span>
  );
}
