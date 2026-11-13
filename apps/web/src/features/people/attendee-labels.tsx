import type { DirectoryEntry } from "../../queries/directory";
import { LabelBadge } from "../../ui/label-badge";
import { Tooltip } from "../../ui/tooltip";

export function AttendeeLabels({
  labels,
  tappable,
}: {
  labels: DirectoryEntry["labels"];
  /** Not inside a link: a tappable badge is a button. */
  tappable?: boolean;
}) {
  return labels.map((label) => {
    const hint = [label.eventName, label.description]
      .filter(Boolean)
      .join(" · ");
    return (
      <Tooltip
        key={label.id}
        as="span"
        toggleable={tappable}
        content={hint ? <p className="p-2 text-sm">{hint}</p> : undefined}
        triggerClassName="max-w-full"
      >
        <LabelBadge name={label.name} color={label.color} />
      </Tooltip>
    );
  });
}
