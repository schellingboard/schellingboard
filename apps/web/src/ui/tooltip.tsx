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
const LINGER_MS = 150;
const EDGE_PX = 8;

// Focus a dialog hands back on close is not the keyboard asking for the panel.
function focusVisible(el: EventTarget): boolean {
  try {
    return !(el instanceof Element) || el.matches(":focus-visible");
  } catch {
    return true;
  }
}

/**
 * A panel for what its trigger has no room for. By default hover (at rest)
 * and focus open it and the trigger stays whatever it wraps; `toggleable`
 * makes the trigger a button that also opens it on a tap and closes it on a
 * second tap, Escape or a press outside. No `content` renders the children alone.
 * `interactive` lets the pointer travel onto the panel without closing it.
 * `as="span"` for a trigger inside text.
 */
export function Tooltip({
  content,
  children,
  className,
  triggerClassName,
  toggleable,
  interactive,
  as: Wrapper = "div",
}: {
  content?: ReactNode;
  /** A function gets the `aria-describedby` to put on the element that holds focus. */
  children:
    ReactNode | ((describedBy: { "aria-describedby"?: string }) => ReactNode);
  className?: string;
  triggerClassName?: string;
  toggleable?: boolean;
  interactive?: boolean;
  as?: "div" | "span";
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

  // Content that arrives late (loaded on first hover) still opens for a
  // pointer resting on the trigger or a keyboard already on it.
  const over = useRef(false);
  const hasContent = !!content;
  useEffect(() => {
    if (!hasContent) return;
    const active = document.activeElement;
    if (active && trigger.current?.contains(active) && focusVisible(active))
      setOpen(true);
    else if (over.current)
      rest.current = setTimeout(() => setOpen(true), REST_MS);
  }, [hasContent]);

  const describedBy = { "aria-describedby": open ? id : undefined };
  const kids =
    typeof children === "function" ? children(describedBy) : children;

  if (!content)
    return (
      <Wrapper
        className={className}
        onMouseEnter={() => (over.current = true)}
        onMouseLeave={() => (over.current = false)}
      >
        {kids}
      </Wrapper>
    );

  const show = () => {
    clearTimeout(rest.current);
    setOpen(true);
  };
  const hide = () => {
    over.current = false;
    clearTimeout(rest.current);
    setOpen(false);
  };

  const hideSoon = () => {
    over.current = false;
    clearTimeout(rest.current);
    rest.current = setTimeout(() => setOpen(false), LINGER_MS);
  };

  const panelNode = open
    ? createPortal(
        <div
          ref={panel}
          id={id}
          role="tooltip"
          style={position ?? { top: 0, left: 0, visibility: "hidden" }}
          onMouseEnter={
            interactive ? () => clearTimeout(rest.current) : undefined
          }
          onMouseLeave={interactive ? hide : undefined}
          className={cx(
            "fixed z-[70] max-w-xs rounded-md border border-line bg-surface-raised text-fg shadow-lg",
            !interactive && "pointer-events-none"
          )}
        >
          {content}
        </div>,
        document.body
      )
    : null;

  const rested = () => {
    over.current = true;
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
          {kids}
        </button>
        {panelNode}
      </>
    );

  return (
    <Wrapper
      ref={trigger as React.RefObject<never>}
      className={cx(className, triggerClassName)}
      aria-describedby={
        typeof children === "function"
          ? undefined
          : describedBy["aria-describedby"]
      }
      onMouseEnter={rested}
      onMouseMove={() => !open && rested()}
      onMouseLeave={interactive ? hideSoon : hide}
      onFocus={(e) => focusVisible(e.target) && show()}
      onBlur={hide}
      onClick={hide}
    >
      {kids}
      {panelNode}
    </Wrapper>
  );
}
