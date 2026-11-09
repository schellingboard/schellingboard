import { createPortal } from "react-dom";
import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useDiscardGuard } from "./use-discard-guard";
import { useScrollLock } from "./use-scroll-lock";

/** Open dialogs, innermost last: Escape closes only the one on top. */
const openDialogs: symbol[] = [];

export function Dialog({
  open,
  onClose,
  title,
  children,
  wide,
  label,
  titleAction,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  wide?: boolean;
  /** The dialog's accessible name when it is not its visible title. */
  label?: string;
  /** Sits beside the title, outside the heading, so it stays out of the dialog's name. */
  titleAction?: ReactNode;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useScrollLock(open);
  const guard = useDiscardGuard(panel, onClose);
  const { escape, reset } = guard;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    if (!panel.current?.contains(document.activeElement))
      panel.current?.focus();
    const me = Symbol();
    openDialogs.push(me);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && openDialogs[openDialogs.length - 1] === me)
        escape();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      reset();
      openDialogs.splice(openDialogs.indexOf(me), 1);
      opener?.focus?.();
    };
  }, [open, escape, reset]);

  const keepFocusInside = (e: KeyboardEvent) => {
    if (e.key !== "Tab" || !panel.current) return;
    const focusable = [
      ...panel.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex='-1'])"
      ),
    ];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return e.preventDefault();
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panel.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;
  // In the body: a dialog opened from the fixed nav bar would otherwise sit in
  // its stacking context, under anything fixed further down the page.
  return createPortal(
    <div
      data-testid="dialog-backdrop"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-4"
      onClick={guard.requestClose}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-labelledby={label ? undefined : titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={keepFocusInside}
        onFocus={guard.noteFocus}
        className={`relative max-h-[90dvh] w-full overflow-y-auto overscroll-contain rounded-t-lg bg-surface-raised p-4 shadow-xl focus:outline-none sm:rounded-lg sm:p-6 ${wide ? "sm:max-w-2xl" : "sm:max-w-md"}`}
      >
        <div className="flex items-start gap-2 pr-8">
          <h2
            id={titleId}
            className="min-w-0 flex-1 text-lg font-semibold text-fg"
          >
            {title}
          </h2>
          {titleAction}
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={guard.requestClose}
          className="absolute right-3 top-3 rounded-md p-1 text-fg-subtle hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
        >
          <span aria-hidden>✕</span>
        </button>
        {guard.prompt}
        <div className="mt-3">{children}</div>
      </div>
    </div>,
    document.body
  );
}
