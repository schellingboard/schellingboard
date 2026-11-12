import {
  EVENT_ICON_NAMES,
  eventIconLabel,
} from "@schellingboard/domain/event-icons";
import { cx } from "../../ui/cx";
import type { ComponentType, SVGProps } from "react";
import { EVENT_ICONS } from "./event-icons";

function Option({
  label,
  Icon,
  selected,
  onSelect,
}: {
  label: string;
  Icon?: ComponentType<SVGProps<SVGSVGElement>>;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cx(
        "flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm",
        selected
          ? "border-brand-accent bg-brand-tint text-brand-fg"
          : "border-line text-fg-subtle hover:bg-surface-muted"
      )}
    >
      {Icon && <Icon aria-hidden className="h-5 w-5 shrink-0" />}
      {label}
    </button>
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
        label="No icon"
        selected={value === ""}
        onSelect={() => onChange("")}
      />
      {EVENT_ICON_NAMES.map((name) => (
        <Option
          key={name}
          label={eventIconLabel(name)}
          Icon={EVENT_ICONS[name]}
          selected={value === name}
          onSelect={() => onChange(name)}
        />
      ))}
    </div>
  );
}
