import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type RefObject,
} from "react";
import { Button } from "./button";

// A number field holds a saved value after a submit (the attendee count),
// and a combobox or search box is a query, not a draft.
const TEXT_FIELDS =
  "textarea, input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=hidden]):not([type=number]):not([type=search]):not([type=submit]):not([type=button]):not([role=combobox])";

/**
 * Asks before a dialog is dismissed over text the user typed. A field counts
 * once it has had focus and now differs from what it held then.
 */
export function useDiscardGuard(
  panel: RefObject<HTMLElement | null>,
  onClose: () => void
) {
  const starts = useRef(new WeakMap<Element, string>());
  const [asking, setAsking] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const questionId = useId();

  const hasUnsavedText = () =>
    [
      ...(panel.current?.querySelectorAll<HTMLInputElement>(TEXT_FIELDS) ?? []),
    ].some((field) => {
      const start = starts.current.get(field);
      return start !== undefined && field.value !== start;
    });

  const keepEditing = () => {
    setAsking(false);
    returnFocus.current?.focus?.();
  };

  const requestClose = () => {
    if (asking) return;
    if (!hasUnsavedText()) return onClose();
    returnFocus.current = document.activeElement as HTMLElement | null;
    setAsking(true);
  };

  const latest = useRef({ requestClose, keepEditing, asking });
  useEffect(() => {
    latest.current = { requestClose, keepEditing, asking };
  });
  const escape = useCallback(() => {
    if (latest.current.asking) latest.current.keepEditing();
    else latest.current.requestClose();
  }, []);

  const noteFocus = (e: FocusEvent) => {
    const field = e.target as HTMLInputElement;
    if (
      panel.current?.contains(field) &&
      field.matches(TEXT_FIELDS) &&
      !starts.current.has(field)
    )
      starts.current.set(field, field.value);
  };

  const reset = useCallback(() => setAsking(false), []);

  const prompt = asking ? (
    <div
      role="alertdialog"
      aria-labelledby={questionId}
      className="mt-3 space-y-2 rounded-md border border-line bg-surface-muted p-3"
    >
      <p id={questionId} className="text-sm font-medium text-fg">
        Discard what you have typed?
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="danger"
          onClick={() => {
            setAsking(false);
            onClose();
          }}
        >
          Discard
        </Button>
        <Button variant="quiet" autoFocus onClick={keepEditing}>
          Keep editing
        </Button>
      </div>
    </div>
  ) : null;

  return { requestClose, escape, noteFocus, reset, prompt };
}
