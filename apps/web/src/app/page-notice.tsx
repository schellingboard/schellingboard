import type { ReactNode } from "react";

/** Why a screen cannot be shown, with the way back to the attendees. */
export function PageNotice({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 sm:px-0">
      <a
        href="/guests"
        className="-my-1 inline-block py-1 text-sm text-fg-subtle hover:text-fg-muted"
      >
        ← Attendees
      </a>
      <p className="text-fg-muted">{children}</p>
    </div>
  );
}
