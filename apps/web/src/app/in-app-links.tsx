import type { MouseEvent, ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";

/** Follows a link the app owns without reloading; a modifier-key click is left to the browser. */
// A handler, not a DOM listener: React's bubbling reaches through the portals modals render in.
export function InAppLinks({
  owns,
  onFollow,
  children,
}: {
  owns: (url: URL) => boolean;
  /** Sees the address before it is pushed, and returns the one to push. */
  onFollow?: (url: URL) => string;
  children: ReactNode;
}) {
  const { history } = useRouter();

  const onClick = (e: MouseEvent) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (
      !link ||
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      (link.target && link.target !== "_self") ||
      link.hasAttribute("download")
    )
      return;
    const url = new URL(link.href);
    if (url.origin !== window.location.origin || !owns(url)) return;
    e.preventDefault();
    history.push(onFollow?.(url) ?? `${url.pathname}${url.search}${url.hash}`);
  };

  return <div onClick={onClick}>{children}</div>;
}
