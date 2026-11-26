import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const vv = window.visualViewport;
  vv?.addEventListener("resize", onChange);
  vv?.addEventListener("scroll", onChange);
  return () => {
    vv?.removeEventListener("resize", onChange);
    vv?.removeEventListener("scroll", onChange);
  };
}

const snapshot = () => {
  const vv = window.visualViewport;
  return vv ? `${vv.offsetTop},${vv.height}` : "";
};

/**
 * The part of the window left visible by a phone's on-screen keyboard, which
 * covers fixed elements without shrinking the layout viewport they sit in.
 */
export function useVisibleArea(): { top: number; height: number } | null {
  const area = useSyncExternalStore(subscribe, snapshot, () => "");
  if (!area) return null;
  const [top, height] = area.split(",").map(Number);
  return { top, height };
}
