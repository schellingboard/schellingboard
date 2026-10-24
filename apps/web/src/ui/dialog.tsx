import { createPortal } from "react-dom";
import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export function Dialog({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  const latestOnClose = useRef(onClose);
  useEffect(() => {
    latestOnClose.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    if (!panel.current?.contains(document.activeElement))
      panel.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") latestOnClose.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open]);

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
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={keepFocusInside}
        className={`relative max-h-[90dvh] w-full overflow-y-auto rounded-t-lg bg-surface-raised p-4 shadow-xl focus:outline-none sm:rounded-lg sm:p-6 ${wide ? "sm:max-w-2xl" : "sm:max-w-md"}`}
      >
        <h2 id={titleId} className="pr-8 text-lg font-semibold text-fg">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-fg-subtle hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
        >
          <span aria-hidden>✕</span>
        </button>
        <div className="mt-3">{children}</div>
      </div>
    </div>,
    document.body
  );
}
