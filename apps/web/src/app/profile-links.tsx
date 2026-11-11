import type { ReactNode } from "react";
import { InAppLinks } from "./in-app-links";
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

/** Opens a link to a profile in the side panel, whatever page it is on. */
export function ProfileLinks({ children }: { children: ReactNode }) {
  const { open } = usePanel();
  return (
    <InAppLinks
      className="contents"
      owns={({ pathname }) =>
        pathname === "/guests/edit" || profileIdOf(pathname) !== null
      }
      intercept={(url, link) => {
        const id = profileIdOf(url.pathname);
        if (id === null) return false;
        open(
          { kind: "profile", id },
          {
            fromPanel: link.closest("[data-side-panel]") !== null,
            hash: url.hash,
          }
        );
        return true;
      }}
    >
      {children}
    </InAppLinks>
  );
}
