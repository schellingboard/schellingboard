import { useMemo, useRef } from "react";
import { BookMeeting } from "../meetings/book-meeting";
import type { ScheduleActions } from "./context";
import type { ScheduleData } from "./data";
import type { ScheduleLinks } from "./links";

/** The booking dialog over the schedule, as `?bookMeeting=` asks. */
export function BookingDialog({
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
  const slotStart = params.get("bookMeeting");
  const byAddress = useRef(slotStart);
  if (!slotStart || !data.guestId) return null;
  // Closing undoes the entry a click pushed; an address has none, so it drops its param.
  const close = () => {
    if (byAddress.current !== slotStart) return onBack();
    byAddress.current = null;
    const next = new URLSearchParams(params);
    next.delete("bookMeeting");
    onParamsChange(next);
  };
  return (
    <Booking
      key={slotStart}
      slotStart={slotStart}
      actions={actions}
      profileHref={links.guest}
      onClose={close}
    />
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
