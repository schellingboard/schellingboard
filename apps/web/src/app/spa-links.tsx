import type { ReactNode } from "react";
import { InAppLinks } from "./in-app-links";
import { usePanel } from "./use-panel";

/**
 * Follows a link to another screen of the event inside the app, and opens the
 * session and proposal links in the side panel. The panel sits outside the
 * page's DOM, which `InAppLinks` reaches.
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
  const proposalPrefix = `/${slug}/proposals/`;
  return (
    <InAppLinks
      intercept={(url, link) => {
        const opened = url.pathname.startsWith(sessionPrefix)
          ? panelSession(url, sessionPrefix, slug)
          : panelProposal(url.pathname, proposalPrefix, slug);
        if (!opened) return false;
        open(opened, {
          fromPanel: link.closest("[data-side-panel]") !== null,
          hash: url.hash,
        });
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
    >
      {children}
    </InAppLinks>
  );
}

const NOT_A_PROPOSAL = new Set(["new", "quick-voting"]);

function idAfter(pathname: string, prefix: string) {
  try {
    return decodeURIComponent(pathname.slice(prefix.length));
  } catch {
    return null;
  }
}

function panelSession(url: URL, prefix: string, slug: string) {
  const id = idAfter(url.pathname, prefix);
  if (!id) return null;
  return {
    kind: "session",
    slug,
    id,
    record: url.searchParams.get("record") === "count",
  } as const;
}

function panelProposal(pathname: string, prefix: string, slug: string) {
  if (!pathname.startsWith(prefix)) return null;
  const id = idAfter(pathname, prefix);
  if (!id || id.includes("/") || NOT_A_PROPOSAL.has(id)) return null;
  return { kind: "proposal", slug, id } as const;
}
