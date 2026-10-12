import type { ReactNode } from "react";

const TOKEN = /\*\*(.+?)\*\*|`([^`]+)`/g;

/** Renders the `**bold**` and `code` spans the release notes use. */
export function InlineMarkdown({ children }: { children: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of children.matchAll(TOKEN)) {
    if (match.index > last) parts.push(children.slice(last, match.index));
    parts.push(
      match[1] !== undefined ? (
        <strong key={match.index}>{match[1]}</strong>
      ) : (
        <code
          key={match.index}
          className="rounded bg-surface-muted px-1 font-mono"
        >
          {match[2]}
        </code>
      )
    );
    last = match.index + match[0].length;
  }
  parts.push(children.slice(last));
  return <>{parts}</>;
}
