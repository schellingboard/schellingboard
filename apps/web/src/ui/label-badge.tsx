import type { MessageDescriptor } from "@lingui/core";
import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { LabelColorName } from "@schellingboard/domain/event-label";

import { cx } from "./cx";

export const COLOR_LABELS: Record<LabelColorName, MessageDescriptor> = {
  slate: msg`Grey`,
  red: msg`Red`,
  orange: msg`Orange`,
  amber: msg`Yellow`,
  green: msg`Green`,
  teal: msg`Teal`,
  blue: msg`Blue`,
  violet: msg`Purple`,
};

export function colorName(color: LabelColorName) {
  return i18n._(COLOR_LABELS[color]);
}

export function LabelBadge({
  name,
  color,
  className,
}: {
  name: string;
  color: LabelColorName;
  className?: string;
}) {
  return (
    <span
      className={cx(
        `loc-tag loc-${color} inline-block max-w-full truncate rounded-md border px-1.5 py-0.5 text-xs font-medium`,
        className
      )}
    >
      {name}
    </span>
  );
}
