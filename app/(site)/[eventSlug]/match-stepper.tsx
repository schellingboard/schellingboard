"use client";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

const STEP_CLASS =
  "flex h-10 w-10 items-center justify-center rounded-full text-fg-muted hover:bg-surface-hover hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent sm:h-8 sm:w-8";

// Floats over the frame rather than scrolling with the grid, so the arrows
// stay under the pointer. Bottom right: stepping centres the match and toasts
// rise from the bottom centre, so neither lands under it.
export function MatchStepper({
  index,
  of,
  onStep,
}: {
  /** Zero-based, or null before the first step. */
  index: number | null;
  /** Before the first step, an upper bound that sizes the position. */
  of: number;
  onStep: (direction: 1 | -1) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Step through matches"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      className="absolute right-4 z-30 flex items-center gap-0.5 rounded-full border border-line bg-surface-raised p-0.5 text-xs text-fg-subtle shadow-md"
    >
      <button
        type="button"
        aria-label="Previous match"
        onClick={() => onStep(-1)}
        className={STEP_CLASS}
      >
        <ChevronUpIcon aria-hidden className="h-5 w-5" />
      </button>
      <span
        className="text-center tabular-nums"
        style={{ minWidth: `${2 * String(of).length + 1}ch` }}
      >
        {index === null ? "–" : `${index + 1}/${of}`}
      </span>
      <button
        type="button"
        aria-label="Next match"
        onClick={() => onStep(1)}
        className={STEP_CLASS}
      >
        <ChevronDownIcon aria-hidden className="h-5 w-5" />
      </button>
    </div>
  );
}
