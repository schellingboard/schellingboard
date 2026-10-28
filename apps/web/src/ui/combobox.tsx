import { useId, useState } from "react";
import { cx } from "./cx";
import { ChevronDownIcon } from "./icons";

const INPUT =
  "w-full rounded-md border border-line bg-surface-raised p-2 text-sm text-fg focus:border-brand-accent focus:ring-brand-accent aria-[invalid=true]:border-danger-border";

/**
 * A text field with suggestions that never insists on one: whatever is typed
 * stays, and Enter only takes a suggestion that was reached with the arrow keys.
 */
export function Combobox({
  value,
  onChange,
  options,
  id,
  name,
  label,
  placeholder,
  invalid,
  describedBy,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  id?: string;
  name?: string;
  /** For a field with no visible label. */
  label?: string;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const choose = (option: string) => {
    onChange(option);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        className={INPUT}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          setActive(-1);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (options.length === 0) return;
            setOpen(true);
            const step = e.key === "ArrowDown" ? 1 : -1;
            setActive((active + step + options.length) % options.length);
          } else if (e.key === "Enter") {
            if (open && active >= 0) {
              e.preventDefault();
              choose(options[active]);
            } else {
              e.preventDefault();
              setOpen(false);
            }
          } else if (e.key === "Escape" && open) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Show suggestions"
        className="absolute inset-y-0 right-0 flex items-center pr-2 text-fg-subtle"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
      >
        <ChevronDownIcon className="h-4 w-4" />
      </button>
      <ul
        id={listId}
        role="listbox"
        hidden={!open || options.length === 0}
        className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-surface-raised py-1 text-sm shadow-lg ring-1 ring-line-subtle"
      >
        {options.map((option, i) => (
          <li
            key={option}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            className={cx(
              "cursor-pointer px-4 py-2 hover:bg-surface-hover",
              i === active && "bg-brand-tint-hover text-brand-fg"
            )}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(option)}
          >
            {option}
          </li>
        ))}
        <li
          role="presentation"
          className="border-t border-line-subtle px-4 py-2 text-xs text-fg-subtle"
        >
          Pick one or type any text
        </li>
      </ul>
    </div>
  );
}
