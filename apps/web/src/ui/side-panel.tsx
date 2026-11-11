import { createPortal } from "react-dom";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { anyDialogOpen } from "./dialog";
import { useNotify } from "./notices";
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

/** A non-modal view over the right of the page, which stays usable behind it. */
export function SidePanel({
  label,
  title,
  titleAction,
  onClose,
  onBack,
  shareUrl,
  children,
}: {
  label: string;
  title: ReactNode;
  titleAction?: ReactNode;
  onClose: () => void;
  /** Present from the second entry of a stack. */
  onBack?: () => void;
  shareUrl: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const notify = useNotify();
  const [width, setWidth] = useState(storedWidth);
  const closeGuard = useDiscardGuard(ref, onClose);
  const { escape, reset } = closeGuard;
  const backGuard = useDiscardGuard(ref, onBack ?? onClose);

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

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => {
      reset();
      if (opener?.isConnected) opener.focus?.();
    };
  }, [reset]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || anyDialogOpen()) return;
      const target = e.target as Node;
      if (target !== document.body && !ref.current?.contains(target)) return;
      escape();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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

  const share = async () => {
    const url = new URL(shareUrl, window.location.origin).toString();
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ url, title: label });
      } else {
        await navigator.clipboard.writeText(url);
        notify({ tone: "info", message: "Link copied", autoDismissMs: 3000 });
      }
    } catch {
      // A dismissed share sheet is not a failure.
    }
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
      onFocus={closeGuard.noteFocus}
      style={{ ["--panel-w" as string]: `${width}px` }}
      className="fixed inset-0 z-[55] flex flex-col bg-surface-raised shadow-xl focus:outline-none sm:inset-y-auto sm:bottom-0 sm:left-auto sm:right-0 sm:top-16 sm:w-[var(--panel-w)] sm:border-l sm:border-line"
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
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
      <div className="flex items-start gap-2 p-4 pb-0">
        {onBack && (
          <button
            type="button"
            aria-label="Back"
            onClick={backGuard.requestClose}
            className={button}
          >
            <span aria-hidden>←</span>
          </button>
        )}
        <h2 className="min-w-0 flex-1 text-lg font-semibold text-fg">
          {title}
        </h2>
        {titleAction}
        <button
          type="button"
          aria-label="Share"
          onClick={() => void share()}
          className={button}
        >
          <span aria-hidden>⤴</span>
        </button>
        <button
          type="button"
          aria-label="Close"
          onClick={closeGuard.requestClose}
          className={button}
        >
          <span aria-hidden>✕</span>
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        {closeGuard.prompt}
        {backGuard.prompt}
        {children}
      </div>
    </div>,
    document.body
  );
}
