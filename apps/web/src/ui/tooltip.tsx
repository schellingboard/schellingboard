import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cx } from "./cx";

// The schedule grid is wall-to-wall triggers, so opening on mouseenter fires a
// panel at every block the cursor crosses. Open only once the pointer has come
// to rest on one.
const REST_MS = 500;
const GAP_PX = 6;
const EDGE_PX = 8;

/**
 * A panel for what its trigger has no room for. By default hover (at rest)
 * and focus open it and the trigger stays whatever it wraps; `toggleable`
 * makes the trigger a button that also opens it on a tap and closes it on a
 * second tap, Escape or a press outside. No `content` renders the children alone.
 */
export function Tooltip({
  content,
  children,
  className,
  triggerClassName,
  toggleable,
}: {
  content?: ReactNode;
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
  toggleable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>();
  const trigger = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const rest = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();

  useLayoutEffect(() => {
    if (!open || !trigger.current || !panel.current) return;
    const anchor = trigger.current.getBoundingClientRect();
    const width = panel.current.offsetWidth;
    const left = Math.min(
      Math.max(EDGE_PX, anchor.left),
      Math.max(EDGE_PX, window.innerWidth - width - EDGE_PX)
    );
    setPosition({ top: anchor.bottom + GAP_PX, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPress = (e: MouseEvent) => {
      if (
        toggleable &&
        e.target instanceof Node &&
        !trigger.current?.contains(e.target) &&
        !panel.current?.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPress);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPress);
    };
  }, [open, toggleable]);

  useEffect(() => () => clearTimeout(rest.current), []);

  if (!content) return <div className={className}>{children}</div>;

  const show = () => {
    clearTimeout(rest.current);
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(rest.current);
    setOpen(false);
  };

  const panelNode = open
    ? createPortal(
        <div
          ref={panel}
          id={id}
          role="tooltip"
          style={position ?? { top: 0, left: 0, visibility: "hidden" }}
          className="pointer-events-none fixed z-50 max-w-xs rounded-md border border-line bg-surface-raised text-fg shadow-lg"
        >
          {content}
        </div>,
        document.body
      )
    : null;

  const rested = () => {
    clearTimeout(rest.current);
    rest.current = setTimeout(show, REST_MS);
  };

  if (toggleable)
    return (
      <>
        <button
          ref={trigger as React.RefObject<HTMLButtonElement>}
          type="button"
          aria-expanded={open}
          aria-describedby={open ? id : undefined}
          onClick={() => setOpen((o) => !o)}
          onMouseEnter={rested}
          onMouseMove={() => !open && rested()}
          onMouseLeave={hide}
          className={triggerClassName}
        >
          {children}
        </button>
        {panelNode}
      </>
    );

  return (
    <div
      ref={trigger as React.RefObject<HTMLDivElement>}
      className={cx(className, triggerClassName)}
      aria-describedby={open ? id : undefined}
      onMouseEnter={rested}
      onMouseMove={() => !open && rested()}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {panelNode}
    </div>
  );
}
