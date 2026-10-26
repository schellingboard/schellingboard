import { useId, useRef, useState, type KeyboardEvent } from "react";
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
}: {
  people: Person[];
  selected: string[];
  onChange: (ids: string[]) => void;
  id?: string;
  name?: string;
  invalid?: boolean;
  describedBy?: string;
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
      <div className="flex min-h-12 flex-wrap items-center gap-1 rounded-md border border-line bg-surface-raised px-3 py-2 focus-within:ring-2 focus-within:ring-brand-accent">
        {chips.map((p) => (
          <span
            key={p.id}
            className="flex items-center gap-1 text-nowrap rounded bg-surface-muted px-2 py-1 text-sm"
          >
            {p.name}
            <button
              type="button"
              aria-label={`Remove ${p.name}`}
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
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && options[active] ? `${listId}-${active}` : undefined
          }
          aria-invalid={invalid ? true : undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          className="min-w-8 flex-1 border-none bg-transparent px-0 py-1 text-sm outline-none placeholder:text-fg-subtle focus:ring-0"
          value={query}
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
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-surface-raised py-1 text-sm shadow-lg ring-1 ring-line-subtle"
        >
          {options.length === 0 && query !== "" ? (
            <li className="px-4 py-2 text-fg-muted">Nothing found.</li>
          ) : (
            options.map((p, i) => (
              <li
                key={p.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected.includes(p.id)}
                className={`flex cursor-pointer items-center justify-between px-4 py-2 ${i === active ? "bg-brand-tint-hover text-brand-fg" : "text-fg"}`}
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
