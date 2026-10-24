import type { MouseEvent } from "react";

/**
 * Props for the anchor that opens a session: a plain click opens the modal in
 * place, anything else (new tab, modifier keys) follows the href.
 */
export function sessionLink(
  href: string,
  open: () => void
): {
  href: string;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
} {
  return {
    href,
    onClick: (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      open();
    },
  };
}
