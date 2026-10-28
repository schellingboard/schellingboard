import type { ReactNode } from "react";

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
 * paragraphs, bullet and numbered lists, quotes, bold, italics, code and
 * links. Never raw HTML or images, as on the server's renderer.
 */
export function Markdown({
  children,
  className = "text-sm",
}: {
  children: string;
  className?: string;
}) {
  const blocks = children
    .trim()
    .split(/\n{2,}/)
    .filter(Boolean);
  return (
    <div className={`space-y-2 ${className}`}>
      {blocks.flatMap((block, i) => blockNodes(block, i))}
    </div>
  );
}

const BULLET = /^\s*[-*+]\s+/;
const HEADING = /^#{1,6}\s+(.*)$/;
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
        <p key={`${key}h${start}`} className="font-bold">
          {inline(heading[1])}
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
          className={`${Tag === "ul" ? "list-disc" : "list-decimal"} space-y-0.5 pl-5`}
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
