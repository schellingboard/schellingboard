import { useEffect, useRef, useSyncExternalStore } from "react";
import { scrollNowLineIntoView } from "./now-line";

const SCROLL_INTERVAL_MS = 3 * 60 * 1000;
const INITIAL_SCROLL_DELAY_MS = 1000;
const INTERACTION_IDLE_MS = 60 * 1000;

const KIOSK_COOKIE_NAME = "kiosk";
const KIOSK_COOKIE_MAX_AGE_SEC = 365 * 24 * 60 * 60;

const hasKioskCookie = () =>
  document.cookie
    .split("; ")
    .some((entry) => entry.split("=")[0] === KIOSK_COOKIE_NAME);

// Only this hook writes the cookie, so there is nothing to subscribe to; the
// value is re-read on every render a `kiosk` change already triggers.
const subscribeKioskCookie = () => () => {};

/**
 * Kiosk mode is entered with `?kiosk=1` and left with `?kiosk=0`; a cookie
 * keeps it on across navigation the rest of the time.
 */
export function useKioskMode(params: URLSearchParams): boolean {
  const param = params.get("kiosk");

  useEffect(() => {
    if (param === "0") {
      document.cookie = `${KIOSK_COOKIE_NAME}=; path=/; max-age=0`;
    } else if (param != null) {
      document.cookie = `${KIOSK_COOKIE_NAME}=1; path=/; max-age=${KIOSK_COOKIE_MAX_AGE_SEC}`;
    }
  }, [param]);

  const cookieEnabled = useSyncExternalStore(
    subscribeKioskCookie,
    hasKioskCookie,
    () => false
  );

  if (param === "0") return false;
  if (param != null) return true;
  return cookieEnabled;
}

export function KioskController({
  nowIsOnSchedule,
}: {
  /** False outside the event's days, when no now line is drawn. */
  nowIsOnSchedule: boolean;
}) {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let disposed = false;
    const acquire = () => {
      navigator.wakeLock
        ?.request("screen")
        .then((sentinel) => {
          if (disposed) void sentinel.release().catch(() => undefined);
          else lock = sentinel;
        })
        .catch(() => undefined);
    };
    acquire();
    // The lock is released whenever the tab is hidden; take it again.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") acquire();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void lock?.release().catch(() => undefined);
    };
  }, []);

  // Kept outside the effect below, which restarts when the now line appears: a
  // day starting under someone's fingers must not forget they just touched it.
  const lastInteraction = useRef(-Infinity);
  useEffect(() => {
    const mark = () => {
      lastInteraction.current = performance.now();
    };
    const events = ["pointerdown", "wheel", "touchstart", "keydown"] as const;
    for (const name of events) {
      document.addEventListener(name, mark, { passive: true });
    }
    return () => {
      for (const name of events) document.removeEventListener(name, mark);
    };
  }, []);

  useEffect(() => {
    if (!nowIsOnSchedule) return;
    const scrollToNow = () => {
      if (performance.now() - lastInteraction.current < INTERACTION_IDLE_MS)
        return;
      scrollNowLineIntoView();
    };
    const initial = setTimeout(scrollToNow, INITIAL_SCROLL_DELAY_MS);
    const interval = setInterval(scrollToNow, SCROLL_INTERVAL_MS);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [nowIsOnSchedule]);

  return null;
}
