import { useRef, useState, type FormEvent } from "react";
import { STALE_EVENT_MESSAGE } from "@schellingboard/contracts/event";
import { FIX_FIELDS_MESSAGE, type FieldErrors } from "../../commands/mutation";
import type { CommandResponse } from "../../commands/runner";
import { useFormMutation } from "../../commands/use-form-mutation";

export const jumpTo = (name: string) =>
  document.querySelector<HTMLElement>(`[name="${name}"]`)?.focus();

/** For a screen with several forms that share field names. */
export function useJumpWithin<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const jump = (name: string) =>
    ref.current?.querySelector<HTMLElement>(`[name="${name}"]`)?.focus();
  return { ref, jump };
}

/** The error without the "fix the fields" line, which the summary says itself. */
export const shown = (error: string | null) =>
  error === FIX_FIELDS_MESSAGE ? null : error;

export function useSectionSave({
  call,
  fieldNames,
  onSaved,
  onChanged,
}: {
  call: (key: string) => Promise<CommandResponse<unknown>>;
  fieldNames: string[];
  onSaved: () => void;
  onChanged: () => void;
}) {
  const mutation = useFormMutation({
    call,
    fieldNames,
    explainRefusals: true,
  });
  const [stale, setStale] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setStale(false);
    setSaved(false);
    const result = await mutation.submit();
    if (!result) return;
    if (result.ok) {
      onSaved();
      setSaved(true);
      onChanged();
    } else if (result.kind === "conflict") {
      setStale(true);
      onChanged();
    }
  };

  const error = stale ? STALE_EVENT_MESSAGE : shown(mutation.error);
  const fields: FieldErrors = stale ? {} : mutation.fields;
  return {
    save,
    saved,
    clearSaved: () => setSaved(false),
    pending: mutation.pending,
    fields,
    error,
  };
}
