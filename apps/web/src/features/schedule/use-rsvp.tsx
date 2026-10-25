import { useState, type ReactNode } from "react";
import type { Session } from "@schellingboard/domain/session";
import { ConfirmDialog } from "../../ui/confirm-dialog";
import { useSchedule } from "./context";
import { describeRsvpClash, findRsvpClash, type RsvpClash } from "./rsvp-clash";

/** What clicking RSVP does for the reader: ask who they are, warn of a clash, toggle. */
export function useRsvp(session: Session) {
  const { data, actions } = useSchedule();
  const [busy, setBusy] = useState(false);
  const [clash, setClash] = useState<RsvpClash | null>(null);
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
      const found = findRsvpClash(
        session,
        data.sessions.filter(
          (other) =>
            data.rsvpd(other.id) ||
            other.hosts.some((h) => h.id === data.guestId)
        ),
        data.meetings
      );
      if (found) return setClash(found);
    }
    void toggle();
  };

  const dialogs: ReactNode = (
    <ConfirmDialog
      open={clash !== null}
      title="Clashing commitment"
      message={
        clash
          ? `This session clashes with ${describeRsvpClash(clash, data.guestId)}. Do you want to RSVP anyway?`
          : ""
      }
      onConfirm={() => {
        setClash(null);
        void toggle();
      }}
      onCancel={() => setClash(null)}
    />
  );
  return { rsvpd, busy, click, dialogs };
}
