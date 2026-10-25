import { cloneElement, useId, type ReactElement } from "react";
import { useNotify } from "./notices";
import { Tooltip } from "./tooltip";

type AriaProps = { "aria-disabled"?: boolean; "aria-describedby"?: string };

/**
 * Marks a control as unavailable and says why, on hover, to a screen reader
 * and, where there is no hover, as a notice when it is activated. The control
 * stays focusable (aria-disabled, not disabled) so that the reason can be
 * found. With no reason to give it is just as inert.
 */
export function Unavailable({
  blocked,
  why,
  children,
}: {
  blocked: boolean;
  why: string;
  children: ReactElement<AriaProps>;
}) {
  const notify = useNotify();
  const id = useId();
  if (!blocked) return children;
  return (
    <Tooltip content={why}>
      <span
        className="contents"
        onClickCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (why) notify({ tone: "info", message: why });
        }}
      >
        {cloneElement(children, {
          "aria-disabled": true,
          "aria-describedby": why ? id : undefined,
        })}
        {why && (
          <span id={id} className="sr-only">
            {why}
          </span>
        )}
      </span>
    </Tooltip>
  );
}
