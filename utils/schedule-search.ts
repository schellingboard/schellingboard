import type { Session } from "@/db/repositories/interfaces";
import { meetingTitle } from "@/utils/meeting-rules";
import type { MeetingView } from "@/utils/meeting-views";
import { containsIgnoringAccents } from "@/utils/utils";

export function sessionMatchesSearch(session: Session, search: string) {
  return (
    containsIgnoringAccents(session.title ?? "", search) ||
    containsIgnoringAccents(session.description ?? "", search) ||
    containsIgnoringAccents(
      session.hosts.map((h) => h.name).join(" "),
      search
    ) ||
    containsIgnoringAccents(
      session.locations.map((l) => l.name).join(" "),
      search
    )
  );
}

export function meetingMatchesSearch(meeting: MeetingView, search: string) {
  return (
    containsIgnoringAccents(meetingTitle(meeting), search) ||
    containsIgnoringAccents(meeting.meetingPoint, search) ||
    containsIgnoringAccents(meeting.message, search)
  );
}
