import { useEffect, useState } from "react";
import { actingGuestRefusalMessage } from "@schellingboard/domain/acting-guest-message";
import { useRouter } from "@tanstack/react-router";
import { EventPhase, getCurrentPhase } from "@schellingboard/domain/phase";
import { MeetingModal } from "../features/meetings/meeting-modal";
import { meetingViewsFrom } from "../features/schedule/meetings";
import { eventContextFrom } from "../replica/selectors";
import { Message, useEventView } from "./event-page";

/**
 * Where a meeting notification lands. Scheduling hands the meeting to the
 * schedule; outside it the schedule redirects to the proposals and would lose
 * the meeting on the way, so it opens here, read-only (#952).
 */
export function MeetingsPage() {
  const { api, slug, snapshot, now } = useEventView();
  const [protectedName, setProtectedName] = useState<boolean>();
  const missing = snapshot.me === null;
  useEffect(() => {
    if (!missing) return;
    void api.GET("/api/v1/me/identity").then(({ data }) => {
      setProtectedName(data?.awaitingLogin === true);
    });
  }, [api, missing]);
  const { history } = useRouter();
  const meetingId = new URLSearchParams(history.location.search).get(
    "viewMeeting"
  );
  const scheduling =
    getCurrentPhase(eventContextFrom(snapshot).event, now) ===
    EventPhase.SCHEDULING;

  useEffect(() => {
    if (!meetingId) history.replace(`/${slug}`);
    else if (scheduling && !missing)
      history.replace(`/${slug}?viewMeeting=${encodeURIComponent(meetingId)}`);
  }, [history, slug, meetingId, scheduling, missing]);

  if (!meetingId) return null;
  if (missing)
    return protectedName === undefined ? null : (
      <Message>
        {actingGuestRefusalMessage(
          protectedName ? "guest.protected" : "guest.unselected",
          "opening your 1-on-1s"
        )}
      </Message>
    );
  if (scheduling) return null;
  return (
    <>
      <Message>
        1-on-1s at {snapshot.event.name} can only be answered or canceled during
        its scheduling phase.
      </Message>
      <MeetingModal
        key={meetingId}
        meeting={meetingViewsFrom(snapshot, now).find(
          (m) => m.id === meetingId
        )}
        now={now}
        readOnly
        profileHref={(id) => `/guests/${id}`}
        onAnswer={() => {}}
        onCancel={() => {}}
        onClose={() => history.push(`/${slug}`)}
      />
    </>
  );
}
