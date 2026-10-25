import type { VoteChoice } from "@schellingboard/domain/vote";
import {
  voteChoiceToEmoji,
  voteChoiceToLabel,
} from "@schellingboard/domain/vote-display";
import { cx } from "../../ui/cx";

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
      {(["interested", "maybe"] as const).map((choice) => {
        const count = tally?.[choice] ?? 0;
        const label = voteChoiceToLabel(choice as VoteChoice).toLowerCase();
        return (
          <span
            key={choice}
            title={`${count} ${label} vote${count !== 1 ? "s" : ""}`}
            className="inline-flex items-center gap-1 text-sm text-fg-subtle"
          >
            {voteChoiceToEmoji(choice as VoteChoice)}&nbsp;{count}
          </span>
        );
      })}
    </span>
  );
}
