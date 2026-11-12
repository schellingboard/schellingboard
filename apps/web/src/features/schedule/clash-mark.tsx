import { useId } from "react";
import { ExclamationTriangleIcon } from "../../ui/icons";
import { describeClash } from "./clashes";
import { useSchedule } from "./context";
import { t } from "@lingui/core/macro";

/** A warning on a commitment that overlaps another, naming what it overlaps. */
export function ClashMark({
  sessionId,
  className,
}: {
  sessionId: string;
  className: string;
}) {
  const { data } = useSchedule();
  const detailsId = useId();
  const clashes = data.clashes(sessionId);
  if (clashes.length === 0) return null;
  const what = clashes.map((c) => describeClash(c, data.guestId)).join("; ");
  const text = t`Clashes with ${what}`;
  return (
    <span title={text} className="mt-px flex-shrink-0">
      <ExclamationTriangleIcon
        aria-hidden={false}
        role="img"
        aria-label={t({
          message: "Clash",
          comment: "Label of a warning icon: this overlaps another commitment",
        })}
        aria-describedby={detailsId}
        className={className}
      />
      <span id={detailsId} hidden>
        {text}
      </span>
    </span>
  );
}
