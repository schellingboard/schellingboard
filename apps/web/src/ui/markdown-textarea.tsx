import { useRef, useState, type TextareaHTMLAttributes } from "react";
import {
  applyTemplate,
  markdownOptions,
  matchesKey,
  type Template,
} from "@schellingboard/domain/markdown-edit";
import { Markdown } from "./markdown";

const GLYPHS: Record<string, string> = {
  bold: "B",
  italic: "I",
  quote: "❝",
  "numbered-list": "1.",
  "bullet-list": "•",
  code: "<>",
  "code-block": "{ }",
  link: "🔗",
};

const TAB =
  "border-e border-line p-2 text-sm first:rounded-tl-md hover:bg-surface-hover";

function applyToTextarea(template: Template, textarea: HTMLTextAreaElement) {
  const edit = applyTemplate(
    template,
    textarea.value,
    textarea.selectionStart,
    textarea.selectionEnd
  );
  // setRangeText keeps the browser's undo stack; React hears the input event.
  textarea.setRangeText(edit.value, 0, textarea.value.length, "preserve");
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(edit.selectionStart, edit.selectionEnd);
  });
}

/** A textarea with a Markdown toolbar, keyboard shortcuts and a preview tab. */
export function MarkdownTextarea({
  value,
  onChange,
  ...props
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const [previewing, setPreviewing] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="flex flex-col rounded-md border border-line shadow-sm focus-within:border-brand-accent focus-within:ring-2 focus-within:ring-brand-accent">
      <div className="flex items-center rounded-t-md border-b border-line bg-surface-muted">
        <button
          type="button"
          className={`${TAB} ${previewing ? "" : "bg-surface-hover"}`}
          onClick={() => setPreviewing(false)}
        >
          Edit
        </button>
        <button
          type="button"
          className={`${TAB} ${previewing ? "bg-surface-hover" : ""}`}
          onClick={() => setPreviewing(true)}
        >
          Preview
        </button>
        <span className="flex flex-1 justify-end overflow-hidden">
          {markdownOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-label={option.label}
              title={option.label}
              disabled={previewing}
              className="m-1 h-fit rounded-md p-1 text-xs font-semibold hover:bg-surface-hover disabled:opacity-50"
              onClick={() =>
                textarea.current &&
                applyToTextarea(option.template, textarea.current)
              }
            >
              {GLYPHS[option.id]}
            </button>
          ))}
        </span>
      </div>
      <textarea
        {...props}
        ref={textarea}
        value={value}
        hidden={previewing}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          const option = markdownOptions.find((o) => matchesKey(o.key)(e));
          if (option && textarea.current) {
            e.preventDefault();
            applyToTextarea(option.template, textarea.current);
          }
        }}
        className="h-40 w-full resize-y rounded-b-md border-none bg-surface-raised px-4 py-2 font-mono text-sm outline-none ring-0 placeholder:text-fg-subtle"
      />
      {previewing && (
        <div className="h-40 w-full overflow-y-auto px-4 py-2">
          <Markdown>{value}</Markdown>
        </div>
      )}
    </div>
  );
}
