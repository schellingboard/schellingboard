import { t } from "@lingui/core/macro";
import { EVENT_ICON_NAMES } from "@schellingboard/domain/event-icons";

import { cx } from "../../ui/cx";
import { EventIcon } from "../../ui/event-icon";
import { eventIconLabel } from "../../ui/event-icons";
import { NoSymbolIcon } from "../../ui/icons";
import { Tooltip } from "../../ui/tooltip";

function Option({
  label,
  icon,
  selected,
  onSelect,
}: {
  label: string;
  icon?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={label}
        onClick={onSelect}
        className={cx(
          "flex items-center rounded-md border p-1.5",
          selected
            ? "border-brand-accent bg-brand-tint text-brand-fg"
            : "border-line text-fg-subtle hover:bg-surface-muted"
        )}
      >
        {icon ? (
          <EventIcon name={icon} className="h-5 w-5 shrink-0" />
        ) : (
          <NoSymbolIcon className="h-5 w-5 shrink-0" />
        )}
      </button>
    </Tooltip>
  );
}

export function EventIconPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-1.5"
    >
      <Option
        label={t`No icon`}
        selected={value === ""}
        onSelect={() => onChange("")}
      />
      {EVENT_ICON_NAMES.map((name) => (
        <Option
          key={name}
          label={eventIconLabel(name)}
          icon={name}
          selected={value === name}
          onSelect={() => onChange(name)}
        />
      ))}
    </div>
  );
}
