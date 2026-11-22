import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { type KeyboardEvent, useId, useRef, useState } from "react";

import { cx } from "./cx";
import { XMarkIcon } from "./icons";

export type Person = { id: string; name: string };

const MAX_OPTIONS = 20;

const plain = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Picks any number of people from a list, as chips; typing narrows the list. */
export function PeoplePicker({
  people,
  selected,
  onChange,
  id,
  name,
  invalid,
  describedBy,
  placeholder,
  ariaLabel,
  compact,
}: {
  people: Person[];
  selected: string[];
  onChange: (ids: string[]) => void;
  id?: string;
  name?: string;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
  ariaLabel?: string;
  /** One line, as high as a button; long names end in an ellipsis. */
  compact?: boolean;
}) {
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const options = people
    .filter((p) => p.name.trim() && plain(p.name).includes(plain(query)))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, MAX_OPTIONS);
  const chips = selected.flatMap((s) => people.find((p) => p.id === s) ?? []);

  const toggle = (person: Person) => {
    onChange(
      selected.includes(person.id)
        ? selected.filter((s) => s !== person.id)
        : [...selected, person.id]
    );
    setQuery("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => Math.min(options.length - 1, Math.max(0, a + step)));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      if (options[active]) toggle(options[active]);
    } else if (e.key === "Escape" && open) {
      e.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div
      ref={root}
      className="relative w-full"
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <div
        className={cx(
          "flex items-center gap-1 rounded-md border border-line bg-surface-raised focus-within:ring-2 focus-within:ring-brand-accent",
          compact ? "h-9 px-2" : "min-h-12 flex-wrap px-3 py-2"
        )}
      >
        {chips.map((p) => (
          <span
            key={p.id}
            title={compact ? p.name : undefined}
            className={cx(
              "flex items-center gap-1 text-nowrap rounded bg-surface-muted text-sm",
              compact ? "min-w-0 px-1.5 py-0.5" : "px-2 py-1"
            )}
          >
            <span className="truncate">{p.name}</span>
            <button
              type="button"
              className="shrink-0"
              aria-label={t`Remove ${p.name}`}
              onClick={() => onChange(selected.filter((s) => s !== p.id))}
            >
              <XMarkIcon className="h-4 w-4 text-fg-subtle hover:text-fg-muted" />
            </button>
          </span>
        ))}
        <input
          id={id}
          name={name}
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && options[active] ? `${listId}-${active}` : undefined
          }
          aria-invalid={invalid ? true : undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          className={cx(
            "flex-1 border-none bg-transparent px-0 text-base outline-none placeholder:text-fg-subtle focus:ring-0",
            compact ? "min-w-12 py-0 sm:text-sm" : "min-w-8 py-1 sm:text-sm"
          )}
          value={query}
          placeholder={chips.length === 0 ? placeholder : undefined}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          className={cx(
            "absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-surface-raised py-1 text-sm shadow-lg ring-1 ring-line-subtle",
            compact ? "w-max min-w-full max-w-xs" : "w-full"
          )}
        >
          {options.length === 0 && query !== "" ? (
            <li className="px-4 py-2 text-fg-muted">
              <Trans>Nothing found.</Trans>
            </li>
          ) : (
            options.map((p, i) => (
              <li
                key={p.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected.includes(p.id)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2 ${i === active ? "bg-brand-tint-hover text-brand-fg" : "text-fg"}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggle(p)}
              >
                <span className={selected.includes(p.id) ? "font-medium" : ""}>
                  {p.name}
                </span>
                {selected.includes(p.id) && <span aria-hidden>✓</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
