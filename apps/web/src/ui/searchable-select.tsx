import { useState } from "react";

import { Combobox } from "./combobox";

export type SelectOption = { value: string; label: string; disabled?: boolean };

/**
 * A select whose list is searched by typing. Shows the chosen option's label,
 * reports its value, and drops back to that label when left on no match.
 * With a `placeholder`, the option whose value is "" is that placeholder and
 * is not listed.
 */
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  ...rest
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  required?: boolean;
}) {
  const [typed, setTyped] = useState<string | null>(null);
  const available = options.filter(
    (o) => !o.disabled && !(placeholder && o.value === "")
  );
  const selected = available.find((o) => o.value === value);
  const shown = typed ?? selected?.label ?? "";
  const needle = typed?.trim().toLowerCase();
  const matches =
    needle && typed !== selected?.label
      ? available.filter((o) => o.label.toLowerCase().includes(needle))
      : available;

  return (
    <Combobox
      {...rest}
      strict
      placeholder={placeholder}
      value={shown}
      options={matches.map((o) => o.label)}
      onChange={setTyped}
      onChoose={(i) => {
        setTyped(null);
        onChange(matches[i].value);
      }}
      onBlur={() => setTyped(null)}
    />
  );
}
