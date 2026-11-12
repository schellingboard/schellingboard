import { useEffect, useLayoutEffect, type RefObject } from "react";

const STORAGE_PREFIX = "scroll:";

// The window is reset to the top as a page is left; a position written only
// once scrolling has settled never records that reset.
const SETTLE_MS = 100;

/**
 * Keeps a scroll position per history entry (`key`), so Back and a reload return
 * to it; `ref` null is the window. `fallbackKey` is where the page was last left,
 * for an entry never visited. Nothing happens until `ready`.
 */
export function useScrollRestoration(
  ref: RefObject<HTMLElement | null> | null,
  key: string,
  ready = true,
  fallbackKey?: string
) {
  useLayoutEffect(() => {
    if (!ref || !ready) return undefined;
    return keepPosition(ref.current, key, fallbackKey);
  }, [ref, key, ready, fallbackKey]);
  useEffect(() => {
    if (ref || !ready) return;
    let stop: (() => void) | undefined;
    const frame = requestAnimationFrame(() => {
      stop = keepPosition(null, key, fallbackKey);
    });
    return () => {
      cancelAnimationFrame(frame);
      stop?.();
    };
  }, [ref, key, ready, fallbackKey]);
}

function keepPosition(
  el: HTMLElement | null,
  key: string,
  fallbackKey?: string
) {
  const storageKey = STORAGE_PREFIX + key;
  const fallbackStorageKey = fallbackKey && STORAGE_PREFIX + fallbackKey;
  const saved =
    readPosition(storageKey) ??
    (fallbackStorageKey ? readPosition(fallbackStorageKey) : null);
  if (saved) {
    if (el) applyPosition(el, saved);
    else window.scrollTo(saved.left, saved.top);
  }

  const read = (): Position =>
    el
      ? { left: el.scrollLeft, top: el.scrollTop }
      : { left: window.scrollX, top: window.scrollY };
  const scroller: EventTarget = el ?? window;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const write = () => {
    writePosition(storageKey, read());
    if (fallbackStorageKey) writePosition(fallbackStorageKey, read());
  };
  const onScroll = () => {
    if (el) return write();
    clearTimeout(timer);
    timer = setTimeout(write, SETTLE_MS);
  };
  writePosition(storageKey, read());
  scroller.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    clearTimeout(timer);
    scroller.removeEventListener("scroll", onScroll);
  };
}

type Position = { left: number; top: number };

function applyPosition(el: HTMLElement, position: Position) {
  el.scrollLeft = position.left;
  el.scrollTop = position.top;
}

// Storage can be missing or refuse writes (private mode, quota, disabled by
// policy); losing the reader's place is a fine outcome, throwing is not.
function readPosition(key: string): Position | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Position).left === "number" &&
      typeof (parsed as Position).top === "number"
    ) {
      return parsed as Position;
    }
    return null;
  } catch {
    return null;
  }
}

function writePosition(key: string, position: Position) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(position));
  } catch {
    // ignored, see above
  }
}
