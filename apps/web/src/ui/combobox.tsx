import { useEffect, useId, useRef, useState } from "react";
import { cx } from "./cx";
import { ChevronDownIcon } from "./icons";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

const INPUT =
  "w-full rounded-md border border-line bg-surface-raised p-2 text-base text-fg sm:text-sm focus:border-brand-accent focus:ring-brand-accent aria-[invalid=true]:border-danger-border";

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
  strict = false,
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
  /** Only the listed options are valid, so the footer does not invite free text. */
  strict?: boolean;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapper = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // iOS Safari does not blur on a whitespace tap, so the list stays open. A
  // touch's click must not hit a link below; a mouse's may (it blurs anyway).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapper.current?.contains(e.target as Node)) return;
      setOpen(false);
      setActive(-1);
      input.current?.blur();
      if (e.pointerType === "mouse") return;
      const swallow = (click: Event) => {
        click.preventDefault();
        click.stopPropagation();
      };
      const disarm = () => {
        document.removeEventListener("click", swallow, true);
        document.removeEventListener("pointerup", onUp, true);
        document.removeEventListener("pointercancel", disarm, true);
        document.removeEventListener("pointerdown", disarm, true);
      };
      const onUp = () => setTimeout(disarm, 500);
      document.addEventListener("click", swallow, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("pointercancel", disarm, true);
      document.addEventListener("pointerdown", disarm, true);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  const choose = (option: string) => {
    onChange(option);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div ref={wrapper} className="relative">
      <input
        ref={input}
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
        aria-label={t`Show suggestions`}
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
        {!strict && (
          <li
            role="presentation"
            className="border-t border-line-subtle px-4 py-2 text-xs text-fg-subtle"
          >
            <Trans>Pick one or type any text</Trans>
          </li>
        )}
      </ul>
    </div>
  );
}
