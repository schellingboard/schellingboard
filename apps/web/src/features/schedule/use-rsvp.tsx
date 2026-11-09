import { useState, type ReactNode } from "react";
import type { Session } from "@schellingboard/domain/session";
import { ConfirmDialog } from "../../ui/confirm-dialog";
import { useSchedule } from "./context";
import { clashMessage, findClashes, type Clash } from "./clashes";

/** What clicking RSVP does for the reader: ask who they are, warn of a clash, toggle. */
export function useRsvp(session: Session) {
  const { data, actions } = useSchedule();
  const [busy, setBusy] = useState(false);
  const [clashes, setClashes] = useState<Clash[]>([]);
  const rsvpd = data.rsvpd(session.id);

  const toggle = async () => {
    setBusy(true);
    try {
      await actions.toggleRsvp(session.id, rsvpd);
    } finally {
      setBusy(false);
    }
  };
  const click = () => {
    if (!data.guestId) return actions.pickName();
    if (busy) return;
    if (!rsvpd) {
      const found = findClashes(
        session,
        data.sessions.filter(
          (other) =>
            data.rsvpd(other.id) ||
            other.hosts.some((h) => h.id === data.guestId)
        ),
        data.meetings
      );
      if (found.length) return setClashes(found);
    }
    void toggle();
  };

  const dialogs: ReactNode = (
    <ConfirmDialog
      open={clashes.length > 0}
      title="Clashing commitment"
      message={clashMessage(clashes, data.guestId)}
      onConfirm={() => {
        setClashes([]);
        void toggle();
      }}
      onCancel={() => setClashes([])}
    />
  );
  return { rsvpd, busy, click, dialogs };
}
