import { type ReactNode, useCallback, useRef, useState } from "react";

import {
  type RequireIdentity,
  RequireIdentityProvider,
} from "../ui/require-identity";
import { goToSignIn } from "./sign-in-redirect";
import { NamePicker, type PickableGuest } from "./user-menu";
import { useViewer } from "./viewer";

/** Lets any screen open the name picker for an action that needs a name. */
export function IdentityPrompt({
  guests,
  signInOnly = false,
  children,
}: {
  guests: PickableGuest[] | undefined;
  signInOnly?: boolean;
  children: ReactNode;
}) {
  const viewer = useViewer();
  const [open, setOpen] = useState(false);
  const then = useRef<(() => void) | undefined>(undefined);
  const require = useCallback<RequireIdentity>(
    (next) => {
      if (viewer.fixed) return next?.();
      if (signInOnly) return goToSignIn();
      if (guests === undefined) return;
      then.current = next;
      setOpen(true);
    },
    [guests, viewer.fixed, signInOnly]
  );
  return (
    <RequireIdentityProvider value={require}>
      {children}
      {guests && !signInOnly && (
        <NamePicker
          open={open}
          onClose={() => setOpen(false)}
          onChosen={() => then.current?.()}
          guests={guests}
          choose={viewer.choose}
        />
      )}
    </RequireIdentityProvider>
  );
}
