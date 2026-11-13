import { t } from "@lingui/core/macro";

import { PeoplePicker } from "../../ui/people-picker";
import type { LabelGroup } from "./directory-model";

export function LabelMenu({
  groups,
  selected,
  onChange,
}: {
  groups: LabelGroup[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  if (groups.length === 0) return null;
  const options = groups.flatMap((group) =>
    group.labels.map((label) => {
      const { name } = label;
      const event = group.eventName;
      return { id: label.id, name: event ? t`${name} (${event})` : name };
    })
  );
  return (
    <div className="w-64 max-w-full">
      <PeoplePicker
        people={options}
        selected={selected}
        onChange={onChange}
        ariaLabel={t`Filter by label`}
        placeholder={t`Label`}
      />
    </div>
  );
}
