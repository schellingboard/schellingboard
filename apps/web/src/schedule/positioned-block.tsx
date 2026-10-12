import type { ReactNode } from "react";
import { cx } from "../ui/cx";

export type Position = { top: number; height: number };

// Below this a block has no room for its title; it is still there to hover and
// click, and the title stays its accessible name.
export const TITLE_MIN_PX = 24;

export function PositionedBlock({
  position,
  className,
  children,
}: {
  position: Position;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx("absolute inset-x-0.5 py-0.5", className)}
      style={position}
    >
      {children}
    </div>
  );
}
