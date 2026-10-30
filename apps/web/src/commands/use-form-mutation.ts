import { useRef, useState } from "react";
import { newKey } from "./keys";
import { useNotify } from "../ui/notices";
import {
  awaitMutation,
  type FieldErrors,
  type MutationResult,
} from "./mutation";
import type { CommandResponse } from "./runner";

/**
 * Submits a form and waits. The idempotency key survives only an unreachable
 * answer, so pressing Save again after "might not have been saved" cannot apply
 * it twice.
 */
export function useFormMutation<R>({
  call,
  successMessage,
  fieldNames,
}: {
  call: (key: string) => Promise<CommandResponse<R>>;
  successMessage?: string;
  /** Server errors on a path outside these go into the form error. */
  fieldNames?: string[];
}) {
  const notify = useNotify();
  const key = useRef(newKey());
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [fields, setFields] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [unreachable, setUnreachable] = useState(false);

  const submit = async (): Promise<MutationResult<R> | undefined> => {
    if (inFlight.current) return undefined;
    inFlight.current = true;
    setPending(true);
    setFields({});
    setError(null);
    setUnreachable(false);
    const result = await awaitMutation(call, key.current);
    inFlight.current = false;
    setPending(false);
    // The server stores every answer but a 5xx, and refuses a stored key sent with other values.
    if (result.ok || result.kind !== "unreachable") key.current = newKey();
    if (result.ok) {
      if (successMessage) notify({ tone: "info", message: successMessage });
    } else if (result.kind === "fields") {
      const entries = Object.entries(result.fields);
      const isKnown = ([path]: [string, string]) =>
        !fieldNames || fieldNames.includes(path);
      const unmatched = entries.filter((e) => !isKnown(e)).map(([, m]) => m);
      setFields(Object.fromEntries(entries.filter(isKnown)));
      setError(unmatched.length ? unmatched.join(" ") : result.message);
    } else {
      setError(result.message);
      setUnreachable(result.kind === "unreachable");
    }
    return result;
  };

  const reset = () => {
    setFields({});
    setError(null);
    setUnreachable(false);
  };

  return { submit, reset, pending, fields, error, unreachable };
}
