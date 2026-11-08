import { useEffect } from "react";

let locks = 0;
let before = "";

/** Keeps the page behind a modal from scrolling; nested locks release in any order. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    if (locks++ === 0) before = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      if (--locks === 0) root.style.overflow = before;
    };
  }, [locked]);
}
