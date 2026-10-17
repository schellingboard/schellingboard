"use client";
import { useContext } from "react";
import clsx from "clsx";
import { EventContext } from "@/app/(site)/context";

const COPY = {
  live: "Live",
  reconnecting: "Reconnecting…",
  stale: "Not updating: may be out of date",
} as const;

// Text carries the state; the dot only reinforces it.
export function SyncIndicator() {
  const { sync } = useContext(EventContext);
  return (
    <span
      aria-live="polite"
      className={clsx(
        "ml-auto flex items-center gap-1.5 py-1.5 text-xs",
        sync === "live" && "text-fg-subtle",
        sync === "reconnecting" && "text-warning-fg",
        sync === "stale" && "text-danger-fg"
      )}
    >
      <span
        aria-hidden
        className={clsx(
          "h-2 w-2 shrink-0 rounded-full",
          sync === "live" && "bg-success-fg",
          sync === "reconnecting" && "bg-warning",
          sync === "stale" && "bg-danger"
        )}
      />
      {COPY[sync]}
    </span>
  );
}
