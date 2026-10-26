import type { FieldErrors } from "../commands/mutation";

/**
 * Every outstanding error, repeated next to the submit button: on a long form
 * the offending field is scrolled out of sight, and without this the only sign
 * that submitting failed is that the page did not move.
 */
export function FormErrorSummary({
  fields,
  error,
  onJump,
}: {
  fields: FieldErrors;
  /** A failure no single field is to blame for. */
  error: string | null;
  onJump: (name: string) => void;
}) {
  const entries = Object.entries(fields);
  const count = entries.length + (error ? 1 : 0);
  if (count === 0) return null;
  const problems = count === 1 ? "is a problem" : `are ${count} problems`;
  return (
    <div
      role="alert"
      className="rounded-md border border-danger-border bg-danger-tint px-4 py-3 text-danger-fg"
    >
      <p className="text-sm font-medium">
        There {problems}
        {entries.length > 0 ? " to fix:" : ":"}
      </p>
      <ul className="mt-1 list-disc space-y-1 ps-5 text-sm">
        {entries.map(([name, message]) => (
          <li key={name}>
            <button
              type="button"
              className="text-start underline hover:text-danger-fg-hover"
              onClick={() => onJump(name)}
            >
              {message}
            </button>
          </li>
        ))}
        {error && <li>{error}</li>}
      </ul>
    </div>
  );
}
