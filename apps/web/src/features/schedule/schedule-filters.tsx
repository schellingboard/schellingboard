import { useEffect, useId, useRef, useState, type Ref } from "react";
import { cx } from "../../ui/cx";
import { ArrowUpIcon, ChevronDownSmallIcon } from "../../ui/icons";
import { SearchInput } from "../../ui/search-input";
import { MINE_KINDS, type MineKind } from "./filters";

export function ScheduleFilters({
  statusRef,
  layout = "centered",
  search,
  onSearchChange,
  mine,
  onToggleMine,
  onToggleKind,
  hidden,
  onToggleHidden,
  clashes,
  onToggleClashes,
  count,
  onShowAll,
  onBackToTop,
  onStep,
}: {
  statusRef?: Ref<HTMLDivElement>;
  /** "grid": held at the left edge while the grid scrolls sideways under it. */
  layout?: "centered" | "grid";
  search: string;
  onSearchChange: (search: string) => void;
  /** Null when there is no viewer for "mine" to mean. */
  mine: {
    active: boolean;
    kinds: readonly MineKind[];
    hasBookmarks: boolean;
  } | null;
  onToggleMine: () => void;
  onToggleKind: (kind: MineKind) => void;
  /** Null while the viewer has nothing hidden and the chip is off. */
  hidden: { active: boolean } | null;
  onToggleHidden: () => void;
  /** Null while the viewer has no clash and the chip is off. */
  clashes: { active: boolean } | null;
  onToggleClashes: () => void;
  /** How many entries match out of how many, or null when nothing narrows them. */
  count: { matching: number; total: number } | null;
  onShowAll: () => void;
  onBackToTop: () => void;
  /** Where every match stays in place, Enter steps to the next one. */
  onStep?: (direction: 1 | -1) => void;
}) {
  const active = [
    ...(mine?.active
      ? [
          `My schedule (${MINE_KINDS.filter((k) => mine.kinds.includes(k.value))
            .map((k) => k.summary)
            .join(", ")})`,
        ]
      : []),
    ...(clashes?.active ? ["Clashes"] : []),
    ...(hidden?.active ? ["Hidden"] : []),
    ...(search.trim() === "" ? [] : [`"${search.trim()}"`]),
  ];
  const width =
    layout === "grid"
      ? "sticky left-0 w-[100dvw] max-w-3xl"
      : "mx-auto max-w-3xl";
  return (
    <>
      <div
        className={cx("bg-surface", !count && "border-b border-line-subtle")}
      >
        <div
          className={cx(width, "flex flex-wrap items-center gap-2 px-2 py-2")}
        >
          <SearchInput
            className="w-full sm:w-auto sm:flex-1"
            // text-base below sm: iOS zooms into inputs with smaller text.
            inputClassName="h-9 rounded-md border border-line bg-surface-raised px-3 text-base sm:text-sm placeholder-fg-subtle focus:outline-0 focus:ring-2 focus:ring-brand-accent focus:border-transparent"
            placeholder="Search sessions"
            aria-label="Search sessions"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onClear={() => onSearchChange("")}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || !onStep || !count?.matching) return;
              event.preventDefault();
              onStep(event.shiftKey ? -1 : 1);
            }}
          />
          {mine && (
            <div
              role="group"
              aria-label="Filter sessions"
              className="flex flex-wrap gap-2"
            >
              <MyScheduleChip
                mine={mine}
                onToggle={onToggleMine}
                onToggleKind={onToggleKind}
              />
              {clashes && (
                <FilterChip
                  active={clashes.active}
                  onClick={onToggleClashes}
                  label="Clashes"
                />
              )}
              {hidden && (
                <FilterChip
                  active={hidden.active}
                  onClick={onToggleHidden}
                  label="Hidden"
                />
              )}
            </div>
          )}
        </div>
      </div>
      {/* Only this line stays pinned: a narrowed-down list always says so,
          without the whole bar taking up a phone's screen. */}
      {count && (
        <div
          ref={statusRef}
          className="sticky top-0 z-30 border-b border-line-subtle bg-surface"
        >
          <p
            className={cx(
              width,
              "flex items-center gap-1 px-2 py-1.5 text-xs text-fg-subtle"
            )}
          >
            <button
              type="button"
              onClick={onBackToTop}
              className="flex min-w-0 items-center gap-1 hover:text-fg-muted"
            >
              <span className="truncate">
                {[`${count.matching} of ${count.total} match`, ...active].join(
                  " · "
                )}
              </span>
              <ArrowUpIcon aria-hidden className="h-3.5 w-3.5 shrink-0" />
              <span className="sr-only">, back to the search</span>
            </button>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={onShowAll}
              className="shrink-0 font-semibold text-brand-fg hover:text-brand-fg-hover"
            >
              Show all
            </button>
          </p>
        </div>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        "h-9 rounded-md px-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
        active
          ? "bg-info text-on-info hover:bg-info-hover"
          : "bg-surface-muted text-fg-muted hover:bg-surface-hover"
      )}
    >
      {label}
    </button>
  );
}

function MyScheduleChip({
  mine,
  onToggle,
  onToggleKind,
}: {
  mine: {
    active: boolean;
    kinds: readonly MineKind[];
    hasBookmarks: boolean;
  };
  onToggle: () => void;
  onToggleKind: (kind: MineKind) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const chevron = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const tone = mine.active
    ? "bg-info text-on-info hover:bg-info-hover"
    : "bg-surface-muted text-fg-muted hover:bg-surface-hover";
  const focus =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent";
  return (
    <div
      ref={root}
      className="relative flex"
      onBlur={(event) => {
        if (event.relatedTarget && !root.current?.contains(event.relatedTarget))
          setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open) return;
        event.stopPropagation();
        setOpen(false);
        chevron.current?.focus();
      }}
    >
      <button
        type="button"
        aria-pressed={mine.active}
        onClick={onToggle}
        className={cx(
          "h-9 rounded-l-md pl-3 pr-2 text-sm transition-colors",
          tone,
          focus
        )}
      >
        My schedule
      </button>
      <button
        ref={chevron}
        type="button"
        aria-label="Choose what My schedule shows"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(!open)}
        className={cx(
          "flex h-9 min-w-10 items-center justify-center rounded-r-md border-l border-surface/40 px-2.5 transition-colors",
          tone,
          focus
        )}
      >
        <ChevronDownSmallIcon aria-hidden className="h-5 w-5" />
      </button>
      {open && (
        <fieldset
          id={menuId}
          className="absolute left-0 top-full z-40 mt-1 w-44 rounded-md bg-surface-raised px-3 py-2 shadow-lg ring-1 ring-line-subtle"
        >
          <legend className="sr-only">My schedule shows</legend>
          {MINE_KINDS.filter(
            (kind) =>
              kind.value !== "bookmarked" ||
              mine.hasBookmarks ||
              mine.kinds.includes(kind.value)
          ).map((kind) => {
            const ticked = mine.kinds.includes(kind.value);
            const last = ticked && mine.kinds.length === 1;
            return (
              <label
                key={kind.value}
                className="flex min-h-11 items-center gap-2 text-sm text-fg-muted"
              >
                <input
                  type="checkbox"
                  checked={ticked}
                  aria-disabled={last}
                  onChange={() => {
                    if (!last) onToggleKind(kind.value);
                  }}
                  className="h-5 w-5"
                />
                {kind.label}
              </label>
            );
          })}
        </fieldset>
      )}
    </div>
  );
}
