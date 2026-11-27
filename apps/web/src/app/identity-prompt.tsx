import { type ReactNode, useCallback, useRef, useState } from "react";

import {
  type RequireIdentity,
  RequireIdentityProvider,
} from "../ui/require-identity";
import { NamePicker, type PickableGuest } from "./user-menu";
import { useViewer } from "./viewer";

/** Lets any screen open the name picker for an action that needs a name. */
export function IdentityPrompt({
  guests,
  children,
}: {
  guests: PickableGuest[] | undefined;
  children: ReactNode;
}) {
  const viewer = useViewer();
  const [open, setOpen] = useState(false);
  const then = useRef<(() => void) | undefined>(undefined);
  const require = useCallback<RequireIdentity>(
    (next) => {
      if (guests === undefined) return;
      then.current = next;
      setOpen(true);
    },
    [guests]
  );
  return (
    <RequireIdentityProvider value={require}>
      {children}
      {guests && (
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
