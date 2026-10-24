import { useCallback, useEffect, useState } from "react";

/**
 * The height of the pinned search status line, which the room headers and
 * time headings stick below. Zero while there is no such line.
 */
export function useStatusHeight() {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState(0);
  const statusRef = useCallback((node: HTMLDivElement | null) => {
    setElement(node);
    if (node) setMeasured(node.offsetHeight);
  }, []);
  useEffect(() => {
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() =>
      setMeasured(element.offsetHeight)
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return { statusRef, statusHeight: element ? measured : 0 };
}
