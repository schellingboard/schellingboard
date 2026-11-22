import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  applyTemplate,
  markdownOptions,
  matchesKey,
  type Template,
} from "@schellingboard/domain/markdown-edit";
import {
  type KeyboardEvent,
  type TextareaHTMLAttributes,
  useRef,
  useState,
} from "react";

import { Markdown } from "./markdown";
import { Tooltip } from "./tooltip";

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
  const old = textarea.value;
  let start = 0;
  while (
    start < old.length &&
    start < edit.value.length &&
    old[start] === edit.value[start]
  ) {
    start++;
  }
  let oldEnd = old.length;
  let newEnd = edit.value.length;
  while (
    oldEnd > start &&
    newEnd > start &&
    old[oldEnd - 1] === edit.value[newEnd - 1]
  ) {
    oldEnd--;
    newEnd--;
  }
  const replacement = edit.value.slice(start, newEnd);
  if (start === oldEnd && replacement === "") return;
  textarea.focus();
  textarea.setSelectionRange(start, oldEnd);
  // Only execCommand keeps the browser's undo stack; it fires `input` itself.
  const done =
    typeof document.execCommand === "function" &&
    (replacement === ""
      ? document.execCommand("delete")
      : document.execCommand("insertText", false, replacement));
  if (!done) {
    textarea.setRangeText(replacement, start, oldEnd, "preserve");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }
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
  const [stop, setStop] = useState(0);
  const textarea = useRef<HTMLTextAreaElement>(null);
  // The modes come first, so they are where the stop falls back to.
  const tabStop = previewing && stop > 1 ? 1 : stop;
  const roving = (index: number) => ({
    tabIndex: index === tabStop ? 0 : -1,
    onFocus: () => setStop(index),
  });

  const onToolbarKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const buttons = [
      ...e.currentTarget.querySelectorAll<HTMLButtonElement>(
        "button:not(:disabled)"
      ),
    ];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = {
      ArrowRight: at + 1,
      ArrowLeft: at - 1,
      Home: 0,
      End: buttons.length - 1,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    buttons[(next + buttons.length) % buttons.length]?.focus();
  };

  return (
    <div className="flex flex-col rounded-md border border-line shadow-sm focus-within:border-brand-accent focus-within:ring-2 focus-within:ring-brand-accent">
      <div
        role="toolbar"
        aria-label={t`Formatting`}
        onKeyDown={onToolbarKey}
        className="flex flex-wrap items-center rounded-t-md border-b border-line bg-surface-muted"
      >
        <button
          type="button"
          aria-pressed={!previewing}
          className={`${TAB} ${previewing ? "" : "bg-surface-hover"}`}
          onClick={() => setPreviewing(false)}
          {...roving(0)}
        >
          <Trans context="Markdown field: write mode">Edit</Trans>
        </button>
        <button
          type="button"
          aria-pressed={previewing}
          className={`${TAB} ${previewing ? "bg-surface-hover" : ""}`}
          onClick={() => setPreviewing(true)}
          {...roving(1)}
        >
          <Trans>Preview</Trans>
        </button>
        <span className="flex flex-1 justify-end">
          {markdownOptions.map((option, i) => (
            <Tooltip
              key={option.id}
              content={option.label}
              className="m-1 h-fit shrink-0"
            >
              <button
                type="button"
                aria-label={option.label}
                disabled={previewing}
                className="rounded-md p-1 text-xs font-semibold hover:bg-surface-hover disabled:opacity-50"
                onClick={() =>
                  textarea.current &&
                  applyToTextarea(option.template, textarea.current)
                }
                {...roving(i + 2)}
              >
                {GLYPHS[option.id]}
              </button>
            </Tooltip>
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
        className="h-40 w-full resize-y rounded-b-md border-none bg-surface-raised px-4 py-2 font-mono text-base sm:text-sm outline-none ring-0 placeholder:text-fg-subtle"
      />
      {previewing && (
        <div className="h-40 w-full overflow-y-auto px-4 py-2">
          <Markdown>{value}</Markdown>
        </div>
      )}
    </div>
  );
}
