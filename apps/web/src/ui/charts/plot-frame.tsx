import { useEffect, useRef, useState } from "react";

export type Plot = typeof import("./plot");

const FALLBACK_WIDTH = 640;

/** Draws one Plot chart at the box's width. Plot loads on first use; the summary names the chart. */
export function PlotFrame({
  summary,
  draw,
}: {
  summary: string;
  draw: (plot: Plot, width: number) => Element;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(FALLBACK_WIDTH);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = box.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.floor(entry.contentRect.width);
      if (next > 0) setWidth(next);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let current = true;
    import("./plot")
      .then((plot) => {
        if (current) box.current?.replaceChildren(draw(plot, width));
      })
      .catch(() => {
        if (current) setFailed(true);
      });
    return () => {
      current = false;
    };
  }, [draw, width]);

  return (
    <>
      <div ref={box} role="img" aria-label={summary} className="w-full" />
      {failed && (
        <p className="text-xs text-fg-muted">
          The chart could not load. The table below has the figures.
        </p>
      )}
    </>
  );
}
