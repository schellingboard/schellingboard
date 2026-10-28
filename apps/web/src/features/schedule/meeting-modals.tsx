import { useEffect, useMemo, useRef, useState } from "react";
import { actingGuestRefusalMessage } from "@schellingboard/domain/acting-guest-message";
import { Dialog } from "../../ui/dialog";
import { BookMeeting } from "../meetings/book-meeting";
import { MeetingModal } from "../meetings/meeting-modal";
import type { ScheduleActions } from "./context";
import type { ScheduleData } from "./data";
import type { ScheduleLinks } from "./links";

/** Closing undoes the entry a click pushed; an address has none, so it drops its param. */
function useParamModal(
  params: URLSearchParams,
  key: string,
  onParamsChange: (next: URLSearchParams) => void,
  onBack: () => void
) {
  const value = params.get(key);
  const byAddress = useRef(value);
  const close = () => {
    if (byAddress.current !== value) return onBack();
    byAddress.current = null;
    const next = new URLSearchParams(params);
    next.delete(key);
    onParamsChange(next);
  };
  return [value, close] as const;
}

/** The 1-on-1 modal and the booking dialog over the schedule, as `?viewMeeting=` and `?bookMeeting=` ask. */
export function MeetingModals({
  params,
  onParamsChange,
  onBack,
  data,
  links,
  actions,
}: {
  params: URLSearchParams;
  onParamsChange: (next: URLSearchParams) => void;
  onBack: () => void;
  data: ScheduleData;
  links: ScheduleLinks;
  actions: ScheduleActions;
}) {
  const [viewMeeting, closeMeeting] = useParamModal(
    params,
    "viewMeeting",
    onParamsChange,
    onBack
  );
  const [bookMeeting, closeBooking] = useParamModal(
    params,
    "bookMeeting",
    onParamsChange,
    onBack
  );
  if (!data.guestId)
    return viewMeeting ? (
      <NeedsName awaitingLogin={actions.awaitingLogin} onClose={closeMeeting} />
    ) : null;
  return (
    <>
      {viewMeeting && (
        <MeetingModal
          key={viewMeeting}
          meeting={data.meetings.find((m) => m.id === viewMeeting)}
          now={data.now}
          readOnly={false}
          profileHref={links.guest}
          onAnswer={(response) =>
            void actions.answerMeeting(viewMeeting, response)
          }
          onCancel={(note) => void actions.cancelMeeting(viewMeeting, note)}
          onClose={closeMeeting}
        />
      )}
      {bookMeeting && (
        <Booking
          key={bookMeeting}
          slotStart={bookMeeting}
          actions={actions}
          profileHref={links.guest}
          onClose={closeBooking}
        />
      )}
    </>
  );
}

function Booking({
  slotStart,
  actions,
  profileHref,
  onClose,
}: {
  slotStart: string;
  actions: ScheduleActions;
  profileHref: (guestId: string) => string;
  onClose: () => void;
}) {
  const query = useMemo(
    () => actions.meetingCandidates(slotStart),
    [actions, slotStart]
  );
  return (
    <BookMeeting
      query={query}
      calls={actions.meetingRequest}
      profileHref={profileHref}
      onBooked={() => {}}
      onClose={onClose}
    />
  );
}

function NeedsName({
  awaitingLogin,
  onClose,
}: {
  awaitingLogin: () => Promise<boolean>;
  onClose: () => void;
}) {
  const [protectedName, setProtectedName] = useState<boolean>();
  useEffect(() => {
    void awaitingLogin().then(setProtectedName);
  }, [awaitingLogin]);
  return (
    <Dialog open onClose={onClose} title="1-on-1">
      {protectedName !== undefined && (
        <p className="text-fg-muted">
          {actingGuestRefusalMessage(
            protectedName ? "guest.protected" : "guest.unselected",
            "opening your 1-on-1s"
          )}
        </p>
      )}
    </Dialog>
  );
}
