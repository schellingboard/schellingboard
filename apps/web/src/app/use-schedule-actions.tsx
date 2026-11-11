import { type ReactNode, useMemo, useState } from "react";

import { claimSession } from "../commands/claim-session";
import { newKey } from "../commands/keys";
import { answerMeeting, cancelMeeting } from "../commands/meeting-answer";
import { meetingRequestCalls } from "../commands/meeting-request";
import { addRsvp, removeRsvp } from "../commands/rsvp";
import {
  addBookmark,
  addHidden,
  removeBookmark,
  removeHidden,
} from "../commands/session-mark";
import type { ScheduleActions } from "../features/schedule/context";
import { attendeeCountApi } from "../queries/attendee-count";
import { createAttendeesQuery } from "../queries/attendees";
import { createMeetingCandidatesQuery } from "../queries/meeting-candidates";
import type { EventView } from "./event-page";
import { likerFrom, useCommentSource } from "./use-comment-actions";
import { NamePicker } from "./user-menu";
import { useViewer } from "./viewer";

/** What the schedule's controls do, and the name picker an RSVP may need. */
export function useScheduleActions({ api, runner, snapshot }: EventView): {
  actions: ScheduleActions;
  picker: ReactNode;
} {
  const viewer = useViewer();
  const [picking, setPicking] = useState(false);
  const openComments = useCommentSource(api, runner, likerFrom(snapshot));
  const actions = useMemo<ScheduleActions>(
    () => ({
      pickName: () => setPicking(true),
      toggleRsvp: async (sessionId, withdraw) => {
        await runner.run(withdraw ? removeRsvp : addRsvp, { sessionId });
      },
      becomeHost: async (sessionId) => {
        await runner.run(claimSession, { sessionId });
      },
      setBookmark: async (sessionId, bookmarked) => {
        await runner.run(bookmarked ? addBookmark : removeBookmark, {
          sessionId,
        });
      },
      setHidden: async (sessionId, hidden) => {
        await runner.run(hidden ? addHidden : removeHidden, { sessionId });
      },
      attendees: (sessionId) => createAttendeesQuery({ api, sessionId }),
      attendeeCount: attendeeCountApi(api, newKey),
      awaitingLogin: async () => {
        const { data } = await api.GET("/api/v1/me/identity");
        return data?.awaitingLogin === true;
      },
      answerMeeting: async (meetingId, response) => {
        await runner.run(answerMeeting, { meetingId, response });
      },
      cancelMeeting: async (meetingId, note) => {
        await runner.run(cancelMeeting, { meetingId, note });
      },
      meetingCandidates: (slotStart) =>
        createMeetingCandidatesQuery({
          api,
          eventId: snapshot.event.id,
          slotStart,
        }),
      meetingRequest: meetingRequestCalls(api),
      comments: (sessionId) => openComments({ kind: "session", id: sessionId }),
    }),
    [runner, api, openComments, snapshot.event.id]
  );
  const picker = (
    <NamePicker
      open={picking}
      onClose={() => setPicking(false)}
      guests={snapshot.guests}
      choose={viewer.choose}
    />
  );
  return { actions, picker };
}
