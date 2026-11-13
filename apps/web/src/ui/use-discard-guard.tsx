import { Trans } from "@lingui/react/macro";
import {
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { Button } from "./button";

// A number field holds a saved value after a submit (the attendee count),
// a combobox or search box is a query, not a draft, and data-discard-ignore
// marks any other control that only changes the view (a page size, a sort).
const FIELDS =
  "textarea, select, input:not([type=file]):not([type=hidden]):not([type=number]):not([type=search]):not([type=submit]):not([type=button]):not([role=combobox])";

const IGNORED = "[data-discard-ignore]";

const valueOf = (field: HTMLInputElement) =>
  field.type === "checkbox" || field.type === "radio"
    ? String(field.checked)
    : field.value;

/**
 * Asks before a dialog or panel is dismissed over what the user entered. A
 * control counts once it has been focused or pressed and now differs from what
 * it held then. With `beforeUnload`, leaving the page asks too.
 */
export function useDiscardGuard(
  panel: RefObject<HTMLElement | null>,
  onClose: () => void,
  { beforeUnload = false }: { beforeUnload?: boolean } = {}
) {
  const starts = useRef(new WeakMap<Element, string>());
  const [pending, setPending] = useState<{
    then: () => void;
    stay?: () => void;
  } | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const questionId = useId();
  const asking = pending !== null;

  const hasUnsaved = () =>
    [...(panel.current?.querySelectorAll<HTMLInputElement>(FIELDS) ?? [])].some(
      (field) => {
        const start = starts.current.get(field);
        return start !== undefined && valueOf(field) !== start;
      }
    );

  const keepEditing = () => {
    pending?.stay?.();
    setPending(null);
    returnFocus.current?.focus?.();
  };

  // `then` runs once nothing is lost (default: close); `stay` if the user keeps editing.
  const requestClose = (then: () => void = onClose, stay?: () => void) => {
    if (asking) return stay?.();
    if (!hasUnsaved()) return then();
    returnFocus.current = document.activeElement as HTMLElement | null;
    setPending({ then, stay });
  };

  const latest = useRef({ requestClose, keepEditing, asking, hasUnsaved });
  useEffect(() => {
    latest.current = { requestClose, keepEditing, asking, hasUnsaved };
  });
  const escape = useCallback(() => {
    if (latest.current.asking) latest.current.keepEditing();
    else latest.current.requestClose();
  }, []);

  const noteField = (e: { target: EventTarget | null }) => {
    const target = e.target as HTMLElement;
    // A press on a label's text targets the label, and Safari does not focus
    // a checkbox or radio at all.
    const field = (target.closest<HTMLLabelElement>("label")?.control ??
      target) as HTMLInputElement;
    if (!panel.current?.contains(field) || !field.matches?.(FIELDS)) return;
    if (field.closest(IGNORED)) return;
    // Radios of one group move together: only the group has a value.
    const group =
      field.type === "radio" && field.name
        ? [
            ...panel.current.querySelectorAll<HTMLInputElement>(
              "input[type=radio]"
            ),
          ].filter((radio) => radio.name === field.name)
        : [field];
    for (const member of group)
      if (!starts.current.has(member))
        starts.current.set(member, valueOf(member));
  };

  useEffect(() => {
    if (!beforeUnload) return;
    const warn = (e: BeforeUnloadEvent) => {
      if (!latest.current.hasUnsaved()) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [beforeUnload]);

  const reset = useCallback(() => setPending(null), []);

  const prompt = pending ? (
    <div
      role="alertdialog"
      aria-labelledby={questionId}
      className="mt-3 space-y-2 rounded-md border border-line bg-surface-muted p-3"
    >
      <p id={questionId} className="text-sm font-medium text-fg">
        <Trans>Discard your changes?</Trans>
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="danger"
          onClick={() => {
            setPending(null);
            pending.then();
          }}
        >
          <Trans>Discard</Trans>
        </Button>
        <Button variant="quiet" autoFocus onClick={keepEditing}>
          <Trans>Keep editing</Trans>
        </Button>
      </div>
    </div>
  ) : null;

  return { requestClose, hasUnsaved, escape, noteField, reset, prompt };
}
