"use client";

export function MeetingLengthChips({
  lengths,
  slotCount,
  onSlotCount,
}: {
  lengths: { slotCount: number; minutes: number }[];
  slotCount: number;
  onSlotCount: (slotCount: number) => void;
}) {
  if (lengths.length < 2) return null;

  return (
    <div role="group" aria-label="Length" className="flex flex-col gap-1">
      <span className="text-sm font-medium text-fg-muted">Length</span>
      <ul className="flex flex-wrap gap-2">
        {lengths.map((length) => (
          <li key={length.slotCount}>
            <button
              type="button"
              aria-pressed={slotCount === length.slotCount}
              onClick={() => onSlotCount(length.slotCount)}
              className={`rounded-full border px-3 py-1 text-sm tabular-nums transition-colors ${
                slotCount === length.slotCount
                  ? "border-brand bg-brand text-on-brand"
                  : "border-line bg-surface-raised text-fg hover:bg-surface-hover"
              }`}
            >
              {length.minutes} min
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
