"use client";
import { createContext, useState, useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  currentVerifiedUserAction,
  selectUserAction,
  type SelectUserResult,
} from "@/app/actions/user-auth";

export interface UserContextType {
  user: string | null;
  /**
   * Switches the current user via the server, which owns the identity
   * cookies. Fails with needsAuth for a protected guest — the caller should
   * then collect credentials and call the login action, followed by
   * applyUser on success.
   */
  switchUser: ((u: string | null) => Promise<SelectUserResult>) | null;
  /** Syncs client state after the server already authenticated the user. */
  applyUser: ((u: string | null) => void) | null;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  switchUser: null,
  applyUser: null,
});

export function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: string | null;
}) {
  const [user, setUser] = useState<string | null>(initialUser);
  const path = usePathname();

  const switchUser = async (
    guestId: string | null
  ): Promise<SelectUserResult> => {
    const result = await selectUserAction(guestId);
    if (result.ok) {
      setUser(guestId);
    }
    return result;
  };

  // `initialUser` is read once, when the (site) layout mounts, and that layout
  // then survives every client-side navigation — so a selection the server has
  // meanwhile stopped honouring (protection enabled from this browser or from
  // another device, #805) would go on rendering as if it still held, offering
  // a menu whose pages all insist no name is selected. Re-ask the server on
  // each navigation instead. The first run is skipped: the render that mounted
  // this provider already carries the server's answer, and this provider sits
  // above every Suspense boundary, where an update landing during hydration
  // can be built and never committed.
  const checkedOnce = useRef(false);
  useEffect(() => {
    if (!checkedOnce.current) {
      checkedOnce.current = true;
      return;
    }
    if (!user) return;
    let superseded = false;
    async function check() {
      try {
        const verified = await currentVerifiedUserAction();
        // A reply overtaken by a later switch must not undo it.
        if (superseded || verified === user) return;
        if (verified === null) {
          // Clear the cookie too, not just the client state: this browser is
          // logged out, and a selection the server won't act as would go on
          // telling the pages that read it raw (settings, edit profile) that a
          // name is picked.
          await switchUser(null);
        } else {
          // Another tab switched names; the cookie is shared, so it wins.
          setUser(verified);
        }
      } catch {
        // Session check failed — leave the current state as-is;
        // the next navigation will retry.
      }
    }

    void check();
    return () => {
      superseded = true;
    };
  }, [user, path]);

  return (
    <UserContext.Provider value={{ user, switchUser, applyUser: setUser }}>
      {children}
    </UserContext.Provider>
  );
}
