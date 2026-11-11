import type { ReactNode } from "react";
import { InAppLinks } from "./in-app-links";
import { proposalOpenedByClick } from "./proposal-nav";
import { usePanel } from "./use-panel";

/**
 * Follows a link to another proposals screen of the event inside the app. The
 * proposal modal sits outside the page's DOM, which `InAppLinks` reaches.
 */
export function SpaLinks({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const { open } = usePanel();
  const sessionPrefix = `/${slug}/sessions/`;
  return (
    <InAppLinks
      intercept={(url, link) => {
        if (!url.pathname.startsWith(sessionPrefix)) return false;
        open(
          {
            kind: "session",
            slug,
            id: decodeURIComponent(url.pathname.slice(sessionPrefix.length)),
            record: url.searchParams.get("record") === "count",
          },
          {
            fromPanel: link.closest("[data-side-panel]") !== null,
            hash: url.hash,
          }
        );
        return true;
      }}
      owns={({ pathname }) =>
        pathname === `/${slug}` ||
        pathname === `/${slug}/schedule` ||
        pathname.startsWith(`/${slug}/sessions/`) ||
        pathname === `/${slug}/meetings` ||
        pathname === `/${slug}/add-session` ||
        pathname === `/${slug}/edit-session` ||
        pathname === `/${slug}/proposals` ||
        pathname.startsWith(`/${slug}/proposals/`)
      }
      onFollow={(url) => {
        proposalOpenedByClick(url.searchParams.has("viewProposal"));
        return `${url.pathname}${url.search}${url.hash}`;
      }}
    >
      {children}
    </InAppLinks>
  );
}
