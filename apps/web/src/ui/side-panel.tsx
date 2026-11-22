import { t } from "@lingui/core/macro";
import {
  createContext,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { anyDialogOpen } from "./dialog";
import { useDiscardGuard } from "./use-discard-guard";

export const PANEL_WIDTH_KEY = "sb-panel-width";
const MIN = 320;
const DEFAULT = 448;
const STEP = 24;
const WIDE = 640;

const maxWidth = () => Math.max(MIN, Math.min(800, window.innerWidth * 0.8));
const clamp = (width: number) =>
  Math.round(Math.min(maxWidth(), Math.max(MIN, width)));

function storedWidth() {
  try {
    const value = Number(localStorage.getItem(PANEL_WIDTH_KEY));
    return value ? clamp(value) : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

/* eslint-disable lingui/no-unlocalized-strings -- CSS selectors */
const TEXT_FIELD =
  "textarea, select, [contenteditable=''], [contenteditable=true], input:not([type=checkbox], [type=radio], [type=button], [type=submit], [type=reset], [type=range])";
const KEEPS_PANEL = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "[contenteditable]",
  "[tabindex]",
  "[role=button]",
  "[role=link]",
  "[role=option]",
  "[role=listbox]",
  "[role=menu]",
  "[role=tooltip]",
  "[role=dialog]",
  "[role=status]",
  "[role=alert]",
].join(", ");
/* eslint-enable lingui/no-unlocalized-strings */

const openPanels = new Set<{ transient: boolean; close: () => void }>();

type PanelGuard = {
  /** Asks first if something was entered, else closes. */
  requestClose: () => void;
  hasUnsaved: () => boolean;
  /** Registers a check for changes the fields cannot show; returns its removal. */
  track: (check: () => boolean) => () => void;
  /** Runs `proceed` once nothing is lost, `stay` if the user keeps editing. */
  ask: (proceed: () => void, stay: () => void) => void;
};

const PanelGuardContext = createContext<PanelGuard | null>(null);

export function useInSidePanel() {
  return useContext(PanelGuardContext) !== null;
}

/** The open panel's discard guard, for what is rendered inside it. */
export function usePanelGuard() {
  const guard = useContext(PanelGuardContext);
  if (!guard) throw new Error("usePanelGuard needs a SidePanel around it");
  return guard;
}

/**
 * A non-modal view beside the page, one at a time: a `transient` one, with no
 * address of its own, closes the open panel and gives way to the next one.
 */
export function SidePanel({
  label,
  title,
  titleAction,
  onClose,
  onBack,
  transient = false,
  guardUnload,
  children,
}: {
  label: string;
  title: ReactNode;
  titleAction?: ReactNode;
  onClose: () => void;
  /** Present from the second entry of a stack. */
  onBack?: () => void;
  transient?: boolean;
  /** A form: leaving the page over unsaved changes asks too. */
  guardUnload?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(storedWidth);
  const guard = useDiscardGuard(ref, onClose, {
    beforeUnload: guardUnload,
  });
  const { escape, reset } = guard;

  const remember = (value: number) => {
    try {
      localStorage.setItem(PANEL_WIDTH_KEY, String(value));
    } catch {
      // The width is then only kept for this visit.
    }
  };
  const resize = (next: number, persist = true) => {
    const clamped = clamp(next);
    setWidth(clamped);
    if (persist) remember(clamped);
  };

  const requestClose = useRef(guard.requestClose);
  useEffect(() => {
    requestClose.current = guard.requestClose;
  });
  useEffect(() => {
    const self = { transient, close: () => requestClose.current() };
    for (const other of openPanels)
      if (transient || other.transient) other.close();
    openPanels.add(self);
    return () => {
      openPanels.delete(self);
    };
  }, [transient]);

  // Read while rendering: a field that takes autofocus has it by the effect.
  const [opener] = useState(() => document.activeElement as HTMLElement | null);
  const note = useRef(guard.noteField);
  useEffect(() => {
    note.current = guard.noteField;
  });
  useEffect(() => {
    const active = document.activeElement;
    // An autofocused field took focus before the panel could see it.
    if (ref.current?.contains(active)) note.current({ target: active });
    else ref.current?.focus();
    return () => {
      reset();
      if (opener?.isConnected) opener.focus?.();
    };
  }, [reset, opener]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || anyDialogOpen()) return;
      const target = e.target as Element;
      if (!ref.current?.contains(target) && target.matches?.(TEXT_FIELD))
        return;
      escape();
    };
    // The page behind stays usable: a click on one of its controls does what
    // the control does, and a click anywhere else closes the panel, unless the
    // click itself moved on (a clickable row opening another panel).
    let pending: ReturnType<typeof setTimeout> | undefined;
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (
        e.button !== 0 ||
        e.defaultPrevented ||
        anyDialogOpen() ||
        !(target instanceof Element) ||
        !target.isConnected ||
        target === document.documentElement ||
        ref.current?.contains(target) ||
        target.closest(KEEPS_PANEL)
      )
        return;
      const at = window.location.href;
      clearTimeout(pending);
      pending = setTimeout(() => {
        if (window.location.href === at) requestClose.current();
      });
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      clearTimeout(pending);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [escape]);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      if (window.innerWidth >= WIDE)
        root.style.setProperty("--side-panel-inset", `${width}px`);
      else root.style.removeProperty("--side-panel-inset");
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      if (openPanels.size === 0)
        root.style.removeProperty("--side-panel-inset");
    };
  }, [width]);

  const onHandleKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") resize(width + STEP);
    else if (e.key === "ArrowRight") resize(width - STEP);
    else return;
    e.preventDefault();
  };
  const onHandleMove = (e: PointerEvent) => {
    if (e.buttons === 1) resize(window.innerWidth - e.clientX, false);
  };

  const button =
    "rounded-md p-1 text-fg-subtle hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-accent";

  return createPortal(
    <div
      ref={ref}
      data-side-panel
      role="dialog"
      aria-modal="false"
      aria-label={label}
      tabIndex={-1}
      onFocus={guard.noteField}
      onPointerDown={guard.noteField}
      style={{ ["--panel-w" as string]: `${width}px` }}
      className="fixed inset-0 z-[55] flex flex-col bg-surface-raised shadow-xl focus:outline-none sm:inset-y-auto sm:bottom-0 sm:left-auto sm:right-0 sm:top-16 sm:w-[var(--panel-w)] sm:border-l sm:border-t sm:border-line"
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={t`Resize panel`}
        aria-valuemin={MIN}
        aria-valuemax={Math.round(maxWidth())}
        aria-valuenow={width}
        tabIndex={0}
        onKeyDown={onHandleKey}
        onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
        onPointerMove={onHandleMove}
        onPointerUp={() => remember(width)}
        className="absolute inset-y-0 -left-1 hidden w-2 cursor-col-resize hover:bg-brand-accent/40 focus:bg-brand-accent/60 focus:outline-none sm:block"
      />
      <div className="flex items-center gap-2 p-4 pb-0">
        {onBack && (
          <button
            type="button"
            aria-label={t({
              message: "Back",
              context: "Side panel: go to the previous panel",
            })}
            onClick={() => guard.requestClose(onBack)}
            className={button}
          >
            <span aria-hidden>←</span>
          </button>
        )}
        <h2 className="min-w-0 flex-1 text-xl font-bold text-fg">{title}</h2>
        {titleAction}
        <button
          type="button"
          aria-label={t`Close`}
          onClick={() => guard.requestClose()}
          className={button}
        >
          <span aria-hidden>✕</span>
        </button>
      </div>
      <div
        data-panel-scroll
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
      >
        {guard.prompt}
        <PanelGuardContext.Provider
          value={{
            requestClose: () => guard.requestClose(),
            hasUnsaved: guard.hasUnsaved,
            track: guard.track,
            ask: guard.requestClose,
          }}
        >
          {children}
        </PanelGuardContext.Provider>
      </div>
    </div>,
    document.body
  );
}
