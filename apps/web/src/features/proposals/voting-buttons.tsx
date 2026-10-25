import type { VoteChoice } from "@schellingboard/domain/vote";
import {
  VOTE_CHOICES,
  voteChoiceToEmoji,
  voteChoiceToLabel,
} from "@schellingboard/domain/vote-display";
import { cx } from "../../ui/cx";
import { Tooltip } from "../../ui/tooltip";
import { Unavailable } from "../../ui/unavailable";

export function VotingButtons({
  chosen,
  enabled,
  why,
  large,
  onVote,
}: {
  chosen: VoteChoice | undefined;
  enabled: boolean;
  why: string;
  large?: boolean;
  onVote: (choice: VoteChoice) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-row flex-wrap">
      {VOTE_CHOICES.map((choice) => {
        const selected = chosen === choice;
        const button = (
          <button
            type="button"
            aria-pressed={selected}
            onClick={() => onVote(choice)}
            className={cx(
              "relative rounded-md border shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent",
              large ? "px-3 py-2 text-lg" : "px-1 py-1",
              !enabled && "opacity-50 cursor-not-allowed grayscale",
              selected
                ? "bg-vote-chosen border-line-strong text-on-vote-chosen ring-2 ring-line-strong"
                : "bg-surface-raised border-line-strong text-fg-muted",
              !selected && enabled && "hover:bg-surface-muted"
            )}
          >
            <div>{voteChoiceToEmoji(choice)}</div>
            {selected && (
              <span
                aria-hidden="true"
                className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-surface-raised bg-bar text-[9px] leading-none text-bar-fg"
              >
                ✓
              </span>
            )}
          </button>
        );
        return enabled ? (
          <Tooltip key={choice} content={voteChoiceToLabel(choice)}>
            {button}
          </Tooltip>
        ) : (
          <Unavailable key={choice} blocked why={why}>
            {button}
          </Unavailable>
        );
      })}
    </div>
  );
}
