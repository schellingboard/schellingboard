import type { ReactNode } from "react";
import { InAppLinks } from "./in-app-links";
import type { PanelItem } from "./panel-history";
import { usePanel } from "./use-panel";

const PROFILE_PATH = /^\/guests\/([^/]+)\/?$/;

export function profileIdOf(pathname: string) {
  const id = PROFILE_PATH.exec(pathname)?.[1];
  if (id === undefined || id === "edit") return null;
  try {
    return decodeURIComponent(id);
  } catch {
    return null;
  }
}

const EVENT_PATH = /^\/([^/]+)\/(sessions|proposals|meetings)\/([^/]+)\/?$/;
const NOT_A_PROPOSAL = new Set(["new", "quick-voting"]);

function eventItemOf(pathname: string): PanelItem | null {
  const [, slug, kind, raw] = EVENT_PATH.exec(pathname) ?? [];
  if (!slug || (kind === "proposals" && NOT_A_PROPOSAL.has(raw))) return null;
  try {
    const id = decodeURIComponent(raw);
    return kind === "sessions"
      ? { kind: "session", slug, id }
      : kind === "proposals"
        ? { kind: "proposal", slug, id }
        : { kind: "meeting", slug, id };
  } catch {
    return null;
  }
}

/**
 * Opens a link to a profile, or to a session, proposal or 1-on-1 of any event,
 * in the side panel whatever page it is on. An event's own pages open theirs first.
 */
export function PanelLinks({ children }: { children: ReactNode }) {
  const { open } = usePanel();
  return (
    <InAppLinks
      className="contents"
      owns={({ pathname }) =>
        pathname === "/guests/edit" ||
        profileIdOf(pathname) !== null ||
        eventItemOf(pathname) !== null
      }
      intercept={(url, link) => {
        const id = profileIdOf(url.pathname);
        const item: PanelItem | null =
          id === null ? eventItemOf(url.pathname) : { kind: "profile", id };
        if (!item) return false;
        if (item.kind === "session")
          item.record = url.searchParams.get("record") === "count";
        open(item, {
          fromPanel: link.closest("[data-side-panel]") !== null,
          hash: url.hash,
        });
        return true;
      }}
    >
      {children}
    </InAppLinks>
  );
}
