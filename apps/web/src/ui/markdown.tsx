import { t } from "@lingui/core/macro";
import { type ReactNode, useState } from "react";

import { CheckIcon, Square2StackIcon } from "./icons";

const TOKEN =
  /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(((?:https?:\/\/|mailto:|tel:)[^)\s]+)\)|(?<![\w@])((?:https?:\/\/|www\.)(?:[^\s<()]|\([^\s<()]*\))+(?<![.,;:!?'"])|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)|(?<![\w*])[_*]([^_*]+)[_*](?![\w*])/g;

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] !== undefined)
      parts.push(<strong key={m.index}>{inline(m[1])}</strong>);
    else if (m[2] !== undefined)
      parts.push(
        <code key={m.index} className="rounded bg-surface-muted px-1 font-mono">
          {m[2]}
        </code>
      );
    else if (m[3] !== undefined || m[5] !== undefined) {
      const href =
        m[4] ??
        (m[5].includes("://")
          ? m[5]
          : m[5].startsWith("www.")
            ? `https://${m[5]}`
            : `mailto:${m[5]}`);
      parts.push(
        <a
          key={m.index}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer nofollow"
          className="text-link hover:underline"
        >
          {m[3] ?? m[5]}
        </a>
      );
    } else parts.push(<em key={m.index}>{m[6]}</em>);
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

/** One line of markdown inside running text: no blocks, no paragraph. */
export function MarkdownInline({ children }: { children: string }) {
  return <>{inline(children)}</>;
}

/**
 * The markdown organizers write, as far as an event description needs it:
 * paragraphs, bullet and numbered lists, quotes, bold, italics, code, code
 * blocks and links. Never raw HTML or images.
 */
export function Markdown({
  children,
  className = "text-sm",
}: {
  children: string;
  className?: string;
}) {
  let key = 0;
  const nodes = fenced(children.trim()).flatMap((part): ReactNode[] =>
    typeof part === "string"
      ? part
          .split(/\n{2,}/)
          .filter((block) => block.trim())
          .flatMap((block) => blockNodes(block, key++))
      : [<CodeBlock key={key++} code={part.code} />]
  );
  return <div className={`space-y-[0.75em] ${className}`}>{nodes}</div>;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  const Icon = copied ? CheckIcon : Square2StackIcon;
  const label = copied ? t`Copied` : t`Copy code`;
  return (
    <div className="group relative">
      <pre className="overflow-x-auto rounded bg-surface-muted p-3 font-mono text-[0.875em] leading-normal">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => void copy()}
        className="absolute right-1.5 top-1.5 rounded border border-line bg-surface p-1 text-fg-muted opacity-0 transition-opacity hover:text-fg focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
      >
        <Icon className="h-4 w-4" />
      </button>
    </div>
  );
}

const FENCE = /^ {0,3}(`{3,})[^`]*$/;
const CLOSE = /^ {0,3}(`{3,})\s*$/;

function fenced(text: string): (string | { code: string })[] {
  const lines = text.split("\n");
  const parts: (string | { code: string })[] = [];
  let prose: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const open = FENCE.exec(lines[i]);
    if (!open) {
      prose.push(lines[i]);
      continue;
    }
    const closes = (line: string) =>
      (CLOSE.exec(line)?.[1].length ?? 0) >= open[1].length;
    let end = i + 1;
    while (end < lines.length && !closes(lines[end])) end++;
    parts.push(prose.join("\n"), { code: lines.slice(i + 1, end).join("\n") });
    prose = [];
    i = end;
  }
  parts.push(prose.join("\n"));
  return parts;
}

const BULLET = /^\s*[-*+]\s+/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const HEADING_SIZE = [
  "pt-[0.5em] text-[1.125em] leading-snug",
  "pt-[0.25em]",
  "",
];
const NUMBERED = /^\s*\d+[.)]\s+/;

function blockNodes(block: string, key: number): ReactNode[] {
  const lines = block.split("\n");
  const out: ReactNode[] = [];
  let start = 0;
  const text = (to: number) => {
    const part = lines.slice(start, to);
    if (part.length === 0) return;
    if (part.every((l) => /^\s*>/.test(l)))
      out.push(
        <blockquote
          key={`${key}q${start}`}
          className="whitespace-pre-line border-l-4 border-line pl-3 text-fg-muted"
        >
          {inline(part.map((l) => l.replace(/^\s*>\s?/, "")).join("\n"))}
        </blockquote>
      );
    else
      out.push(
        <p key={`${key}p${start}`} className="whitespace-pre-line">
          {inline(part.join("\n"))}
        </p>
      );
  };
  while (start < lines.length) {
    const heading = HEADING.exec(lines[start]);
    if (heading) {
      out.push(
        <p
          key={`${key}h${start}`}
          className={`font-bold text-fg ${HEADING_SIZE[Math.min(heading[1].length, 3) - 1]}`}
        >
          {inline(heading[2])}
        </p>
      );
      start++;
      continue;
    }
    const list = [BULLET, NUMBERED].find((re) => re.test(lines[start]));
    if (list) {
      let end = start;
      while (end < lines.length && list.test(lines[end])) end++;
      const Tag = list === BULLET ? "ul" : "ol";
      out.push(
        <Tag
          key={`${key}l${start}`}
          className={`${Tag === "ul" ? "list-disc" : "list-decimal"} space-y-[0.25em] pl-5`}
        >
          {lines.slice(start, end).map((l, j) => (
            <li key={j}>{inline(l.replace(list, ""))}</li>
          ))}
        </Tag>
      );
      start = end;
      continue;
    }
    let end = start + 1;
    while (
      end < lines.length &&
      !BULLET.test(lines[end]) &&
      !NUMBERED.test(lines[end]) &&
      !HEADING.test(lines[end])
    )
      end++;
    text(end);
    start = end;
  }
  return out;
}
