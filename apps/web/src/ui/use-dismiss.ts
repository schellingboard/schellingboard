import { type RefObject, useEffect, useRef } from "react";

/**
 * Closes an open menu on a press outside `root`, or on Escape, which then
 * returns focus to `trigger`.
 */
export function useDismiss(
  open: boolean,
  onClose: () => void,
  root: RefObject<HTMLElement | null>,
  trigger?: RefObject<HTMLElement | null>
) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close.current();
    };
    // Capture runs before the side panel's own Escape, which then sees the
    // key as handled and stays open.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      e.preventDefault();
      close.current();
      trigger?.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, root, trigger]);
}
