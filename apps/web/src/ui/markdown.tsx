import type { ReactNode } from "react";

const TOKEN =
  /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|(?<![\w*])[_*]([^_*]+)[_*](?![\w*])/g;

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] !== undefined) parts.push(<strong key={m.index}>{m[1]}</strong>);
    else if (m[2] !== undefined)
      parts.push(
        <code key={m.index} className="rounded bg-surface-muted px-1 font-mono">
          {m[2]}
        </code>
      );
    else if (m[3] !== undefined)
      parts.push(
        <a
          key={m.index}
          href={m[4]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link hover:underline"
        >
          {m[3]}
        </a>
      );
    else parts.push(<em key={m.index}>{m[5]}</em>);
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

/**
 * The markdown organizers write, as far as an event description needs it:
 * paragraphs, bullet lists, bold, italics, code and web links. Never raw HTML
 * or images, as on the server's renderer.
 */
export function Markdown({ children }: { children: string }) {
  const blocks = children
    .trim()
    .split(/\n{2,}/)
    .filter(Boolean);
  return (
    <div className="space-y-2 text-sm">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*[-*+]\s+/.test(l)))
          return (
            <ul key={i} className="list-disc space-y-0.5 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*+]\s+/, ""))}</li>
              ))}
            </ul>
          );
        return (
          <p key={i} className="whitespace-pre-line">
            {inline(block.replace(/^#{1,6}\s+/, ""))}
          </p>
        );
      })}
    </div>
  );
}
