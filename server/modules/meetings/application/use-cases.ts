import type { MeetingDeps } from "../ports";
import {
  createMeetingPoint,
  deleteMeetingPoint,
  updateEventMeetings,
  updateMeetingPoint,
} from "./admin-meetings";
import { saveMeetingAvailability } from "./availability";
import { listMeetingCandidates } from "./candidates";
import { cancelMeeting, requestMeeting, respondToMeeting } from "./meetings";
import { listMyMeetings } from "./queries";

export function createMeetingUseCases(deps: MeetingDeps) {
  return {
    listMyMeetings: listMyMeetings(deps),
    listMeetingCandidates: listMeetingCandidates(deps),
    requestMeeting: requestMeeting(deps),
    respondToMeeting: respondToMeeting(deps),
    cancelMeeting: cancelMeeting(deps),
    saveMeetingAvailability: saveMeetingAvailability(deps),
    updateEventMeetings: updateEventMeetings(deps),
    createMeetingPoint: createMeetingPoint(deps),
    updateMeetingPoint: updateMeetingPoint(deps),
    deleteMeetingPoint: deleteMeetingPoint(deps),
  };
}

export type MeetingUseCases = ReturnType<typeof createMeetingUseCases>;
