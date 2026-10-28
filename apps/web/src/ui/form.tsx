import { useId, type ReactNode } from "react";
import { Combobox } from "./combobox";
import { MarkdownTextarea } from "./markdown-textarea";
import { PeoplePicker, type Person } from "./people-picker";

const CONTROL =
  "w-full rounded-md border border-line bg-surface-raised p-2 text-sm text-fg focus:border-brand-accent focus:ring-brand-accent aria-[invalid=true]:border-danger-border";

type FieldProps = {
  label: string;
  /** What the form error summary jumps to. */
  name?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  /** For a control in a row whose other cells already say what it is. */
  hideLabel?: boolean;
};

function useField({
  hint,
  error,
  name,
}: Pick<FieldProps, "hint" | "error" | "name">) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId]
    .filter(Boolean)
    .join(" ");
  return {
    id,
    hintId,
    errorId,
    control: {
      id,
      name,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": describedBy || undefined,
    },
  };
}

function Frame({
  label,
  required,
  hint,
  error,
  hideLabel,
  ids,
  children,
}: Omit<FieldProps, "name"> & {
  ids: ReturnType<typeof useField>;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={hideLabel ? "sr-only" : "font-medium"} htmlFor={ids.id}>
        {label}
        {required && <span className="mx-1 text-brand-fg">*</span>}
      </label>
      {children}
      {hint && (
        <p id={ids.hintId} className="text-sm text-fg-subtle">
          {hint}
        </p>
      )}
      <FieldError id={ids.errorId} message={error} />
    </div>
  );
}

export function FieldError({
  id,
  message,
}: {
  id?: string;
  message: string | undefined;
}) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-danger-fg">
      {message}
    </p>
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
  autoFocus,
  maxLength,
  type = "text",
  ...frame
}: FieldProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
  type?: "text" | "email" | "url" | "number";
}) {
  const ids = useField(frame);
  return (
    <Frame {...frame} ids={ids}>
      <input
        {...ids.control}
        type={type}
        className={CONTROL}
        value={value}
        required={frame.required}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </Frame>
  );
}

export function TextAreaField({
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  ...frame
}: FieldProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  const ids = useField(frame);
  return (
    <Frame {...frame} ids={ids}>
      <textarea
        {...ids.control}
        className={CONTROL}
        value={value}
        required={frame.required}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </Frame>
  );
}

export function SelectField({
  value,
  onChange,
  options,
  ...frame
}: FieldProps & {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const ids = useField(frame);
  return (
    <Frame {...frame} ids={ids}>
      <select
        {...ids.control}
        className={CONTROL}
        value={value}
        required={frame.required}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Frame>
  );
}

export function DateTimeField({
  kind,
  value,
  onChange,
  ...frame
}: FieldProps & {
  kind: "date" | "time" | "datetime-local";
  value: string;
  onChange: (value: string) => void;
}) {
  const ids = useField(frame);
  return (
    <Frame {...frame} ids={ids}>
      <input
        {...ids.control}
        type={kind}
        className={CONTROL}
        value={value}
        required={frame.required}
        onChange={(e) => onChange(e.target.value)}
      />
    </Frame>
  );
}

export function CheckboxField({
  label,
  name,
  hint,
  error,
  checked,
  onChange,
}: Omit<FieldProps, "required"> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const ids = useField({ hint, error, name });
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-start gap-2 text-sm">
        <input
          {...ids.control}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-line text-brand focus:ring-brand-accent"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="font-medium">{label}</span>
      </label>
      {hint && (
        <p id={ids.hintId} className="text-sm text-fg-subtle">
          {hint}
        </p>
      )}
      <FieldError id={ids.errorId} message={error} />
    </div>
  );
}

export function MarkdownField({
  value,
  onChange,
  placeholder,
  ...frame
}: FieldProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const hint = frame.hint ?? "Markdown supported";
  const ids = useField({ ...frame, hint });
  return (
    <Frame {...frame} hint={hint} ids={ids}>
      <MarkdownTextarea
        {...ids.control}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </Frame>
  );
}

export function PeopleField({
  people,
  selected,
  onChange,
  ...frame
}: FieldProps & {
  people: Person[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const ids = useField(frame);
  return (
    <Frame {...frame} ids={ids}>
      <PeoplePicker
        people={people}
        selected={selected}
        onChange={onChange}
        id={ids.id}
        name={frame.name}
        invalid={!!frame.error}
        describedBy={ids.control["aria-describedby"]}
      />
    </Frame>
  );
}

export function ComboboxField({
  value,
  onChange,
  options,
  placeholder,
  ...frame
}: FieldProps & {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const ids = useField(frame);
  return (
    <Frame {...frame} ids={ids}>
      <Combobox
        id={ids.id}
        name={frame.name}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        invalid={!!frame.error}
        describedBy={ids.control["aria-describedby"]}
      />
    </Frame>
  );
}
