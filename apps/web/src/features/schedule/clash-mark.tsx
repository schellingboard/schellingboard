import { useId } from "react";

import { ExclamationTriangleIcon } from "../../ui/icons";
import { clashSummary } from "./clashes";
import { useSchedule } from "./context";

/** A warning on a commitment that overlaps another, saying what it overlaps. */
export function ClashIcon({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  const detailsId = useId();
  return (
    <span title={text} className="mt-px flex-shrink-0">
      <ExclamationTriangleIcon
        aria-hidden={false}
        role="img"
        aria-label="Clash"
        aria-describedby={detailsId}
        className={className}
      />
      <span id={detailsId} hidden>
        {text}
      </span>
    </span>
  );
}

export function ClashMark({
  sessionId,
  className,
}: {
  sessionId: string;
  className: string;
}) {
  const { data } = useSchedule();
  const clashes = data.clashes(sessionId);
  if (clashes.length === 0) return null;
  return (
    <ClashIcon
      text={clashSummary(clashes, data.guestId)}
      className={className}
    />
  );
}
