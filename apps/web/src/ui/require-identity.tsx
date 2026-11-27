import { createContext, type MouseEvent, useContext, useRef } from "react";

import { hardNavigate } from "../app/hard-navigate";

/** Opens the name picker for an action that needs a name; `then` runs once one is chosen. */
export type RequireIdentity = (then?: () => void) => void;

const Context = createContext<RequireIdentity>(() => {});

export const RequireIdentityProvider = Context.Provider;

export const useRequireIdentity = () => useContext(Context);

/** Click handler for a link that needs a name: it follows the link once one is chosen. */
export function useNameGate(guestId: string | null) {
  const requireIdentity = useRequireIdentity();
  const following = useRef(false);
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (guestId || following.current) return;
    e.preventDefault();
    const link = e.currentTarget;
    requireIdentity(() => {
      if (!link.isConnected) return hardNavigate(link.href);
      following.current = true;
      link.click();
      following.current = false;
    });
  };
}
