import type { ReactNode } from "react";

export function BackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-block py-1 -my-1 text-sm text-fg-subtle hover:text-fg-muted"
    >
      ← {children}
    </a>
  );
}
