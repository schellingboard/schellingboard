import type { MouseEvent, ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { proposalOpenedByClick } from "./proposal-nav";

/**
 * Follows a link to another proposals screen of the event inside the app, on a
 * new history entry, instead of loading the page again. Anything else, and a
 * click with a modifier key, is left to the browser. React's own bubbling
 * through portals is why this is a handler and not a DOM listener: the proposal
 * modal sits outside the page's DOM.
 */
export function SpaLinks({
  slug,
  children,
}: {
  slug: string;
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
    const mine =
      url.origin === window.location.origin &&
      (url.pathname === `/${slug}` ||
        url.pathname === `/${slug}/proposals` ||
        url.pathname.startsWith(`/${slug}/proposals/`));
    if (!mine) return;
    e.preventDefault();
    proposalOpenedByClick(url.searchParams.has("viewProposal"));
    history.push(`${url.pathname}${url.search}${url.hash}`);
  };

  return <div onClick={onClick}>{children}</div>;
}
