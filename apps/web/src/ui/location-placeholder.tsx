import type { CSSProperties } from "react";
import { cx } from "./cx";

export function LocationPlaceholder({
  className,
  style,
  width,
  height,
}: {
  className?: string;
  style?: CSSProperties;
  width: number;
  height: number;
}) {
  return (
    <svg
      aria-hidden="true"
      data-testid="location-placeholder"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 4 3"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid slice"
      style={style}
      className={cx("bg-surface-hover text-fg-subtle", className)}
    >
      <path
        d="M1 2.2 1.8 1.2 2.4 1.9 2.8 1.5 3.2 2.2Z"
        fill="currentColor"
        opacity={0.5}
      />
      <circle cx={1.4} cy={0.9} r={0.2} fill="currentColor" opacity={0.5} />
    </svg>
  );
}
