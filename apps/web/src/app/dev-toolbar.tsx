import { useState } from "react";

const COOKIE = "time-override";
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function readOffset(): number {
  const raw = new RegExp(`(?:^|; )${COOKIE}=([^;]*)`).exec(
    document.cookie
  )?.[1];
  const n = Number(decodeURIComponent(raw ?? ""));
  return raw && Number.isFinite(n) ? n : 0;
}

function writeOffset(offset: number) {
  document.cookie =
    offset === 0
      ? `${COOKIE}=; path=/; max-age=0`
      : `${COOKIE}=${offset}; path=/; max-age=${7 * 24 * 60 * 60}`;
}

const localInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const button = "rounded border border-warning px-2 py-0.5 hover:bg-warning/20";

/**
 * Time travel for development: the `time-override` cookie shifts the server's
 * clock (ADR 0004), so `onChange` must make the app load again under it.
 */
export function DevToolbar({
  enabled,
  search,
  onChange,
  clock = Date.now,
}: {
  enabled: boolean;
  search: string;
  onChange: () => void;
  clock?: () => number;
}) {
  const [offset, setOffset] = useState(readOffset);
  const [dismissed, setDismissed] = useState(false);

  if (!enabled || dismissed || new URLSearchParams(search).get("dev") !== "1")
    return null;

  const apply = (next: number) => {
    writeOffset(next);
    setOffset(next);
    onChange();
  };
  const simulated = new Date(clock() + offset);

  return (
    <section
      aria-label="Dev clock"
      className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center gap-2 border-t border-warning bg-warning-tint px-3 py-2 text-sm text-warning-fg shadow"
    >
      <span className="font-semibold">Dev clock</span>
      <span className="tabular-nums">
        {simulated.toISOString().replace("T", " ").slice(0, 16)} UTC
        {offset !== 0 &&
          ` (${offset > 0 ? "+" : ""}${Math.round(offset / HOUR)}h)`}
      </span>
      <button className={button} onClick={() => apply(0)}>
        Real time
      </button>
      <button className={button} onClick={() => apply(offset + HOUR)}>
        +1h
      </button>
      <button className={button} onClick={() => apply(offset + DAY)}>
        +1d
      </button>
      <button className={button} onClick={() => apply(offset + 7 * DAY)}>
        +7d
      </button>
      <label className="flex items-center gap-1">
        <span className="sr-only">Pick date and time</span>
        <input
          type="datetime-local"
          className="rounded border border-warning bg-surface-raised px-1 py-0.5"
          value={localInput(simulated)}
          onChange={(e) => {
            const target = new Date(e.target.value).getTime();
            if (!Number.isNaN(target)) apply(target - clock());
          }}
        />
      </label>
      <button
        className={`${button} ml-auto`}
        aria-label="Dismiss dev clock toolbar"
        onClick={() => setDismissed(true)}
      >
        ✕
      </button>
    </section>
  );
}
