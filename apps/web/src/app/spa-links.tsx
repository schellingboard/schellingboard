import type { ReactNode } from "react";
import { InAppLinks } from "./in-app-links";
import { proposalOpenedByClick } from "./proposal-nav";

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
  return (
    <InAppLinks
      owns={({ pathname }) =>
        pathname === `/${slug}` ||
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
