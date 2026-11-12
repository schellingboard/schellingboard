import { useLayoutEffect, type RefObject } from "react";
import type { DayWithSessions } from "./model";

export function dayOfSession(
  days: DayWithSessions[],
  sessionId: string | null
): string | null {
  if (!sessionId) return null;
  return (
    days.find((d) => d.sessions.some((s) => s.id === sessionId))?.id ?? null
  );
}

/** Brings the session an address named, or one just added, to the middle of the schedule once it is shown. */
export function useRevealSession(
  scrollerRef: RefObject<HTMLElement | null>,
  sessionId: string | null,
  day: string | null
) {
  useLayoutEffect(() => {
    if (!sessionId) return;
    scrollerRef.current
      ?.querySelector(`[data-session-id="${CSS.escape(sessionId)}"]`)
      ?.scrollIntoView({
        block: "center",
        inline: "center",
        behavior: "instant",
      });
  }, [scrollerRef, sessionId, day]);
}
