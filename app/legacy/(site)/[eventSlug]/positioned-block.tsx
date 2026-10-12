import clsx from "clsx";
import type { ReactNode } from "react";

export type Position = { top: number; height: number };

// Below this a block has no room for its title; it is still there to hover and
// click, and the title stays its accessible name.
export const TITLE_MIN_PX = 24;

export function PositionedBlock(props: {
  position: Position;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={clsx("absolute inset-x-0.5 py-0.5", props.className)}
      style={props.position}
    >
      {props.children}
    </div>
  );
}
