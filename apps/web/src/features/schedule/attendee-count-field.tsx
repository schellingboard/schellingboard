import { useEffect, useId, useState, type FormEvent } from "react";
import { attendeeCountFormSchema } from "@schellingboard/contracts/attendee-count";
import {
  MAX_ATTENDEE_COUNT,
  MIN_ATTENDEE_COUNT,
} from "@schellingboard/domain/attendee-count";
import { useSchedule } from "./context";

/**
 * A host records how many came to a finished session. The server decides who
 * may; showing it only to hosts is a courtesy.
 */
export function AttendeeCountField({
  sessionId,
  autoFocus,
}: {
  sessionId: string;
  /** Set when the follow-up email's link asked for it: focusing every finished session would steal scroll. */
  autoFocus: boolean;
}) {
  const { actions } = useSchedule();
  const fieldId = useId();
  const messageId = `${fieldId}-message`;
  const [loaded, setLoaded] = useState(false);
  const [value, setValue] = useState("");
  const [baseline, setBaseline] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void actions.attendeeCount.load(sessionId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        const stored = result.count === null ? "" : String(result.count);
        setValue(stored);
        setBaseline(stored);
      } else {
        setMessage(result.message);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [actions, sessionId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const parsed = attendeeCountFormSchema.safeParse({ count: value });
    if (!parsed.success) return setMessage(parsed.error.issues[0].message);
    setMessage(null);
    setSaving(true);
    const result = await actions.attendeeCount.save(
      sessionId,
      parsed.data.count
    );
    setSaving(false);
    if (!result.ok) return setMessage(result.message);
    const stored = result.count === null ? "" : String(result.count);
    setValue(stored);
    setBaseline(stored);
    setSaved(true);
  };

  if (!loaded) return null;

  return (
    <section className="mb-6 rounded-md border border-line-subtle bg-surface-muted p-3">
      <form
        onSubmit={(e) => void submit(e)}
        noValidate
        className="flex flex-col gap-2"
      >
        <label htmlFor={fieldId} className="text-sm font-medium text-fg">
          How many people attended?
        </label>
        <p className="text-xs text-fg-subtle">
          Optional. Only you and your co-hosts will see this, not the attendees.
          Enter <strong>0</strong> if the session was held but nobody came. If
          it never happened at all, delete the session instead. Leave the field
          empty to go back to no count at all.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            id={fieldId}
            autoFocus={autoFocus}
            type="number"
            inputMode="numeric"
            min={MIN_ATTENDEE_COUNT}
            max={MAX_ATTENDEE_COUNT}
            step={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? messageId : undefined}
            className="w-24 rounded-md border border-line bg-surface-raised px-2 py-1 text-sm text-fg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
          <button
            type="submit"
            aria-label="Save attendee count"
            disabled={saving}
            className="rounded-md bg-brand px-3 py-1 text-sm font-medium text-on-brand shadow hover:bg-brand-hover disabled:bg-surface-hover disabled:text-fg-subtle disabled:shadow-none"
          >
            Save
          </button>
          <span role="status" aria-live="polite" className="text-xs">
            {saving ? (
              <span className="text-fg-muted">Saving&hellip;</span>
            ) : saved && value === baseline ? (
              <span className="text-success-fg">Saved</span>
            ) : null}
          </span>
        </div>
        {message && (
          <p id={messageId} className="text-xs text-danger-fg">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
