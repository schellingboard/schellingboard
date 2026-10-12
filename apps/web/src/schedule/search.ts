import type { Session } from "@schellingboard/domain/session";
import { meetingTitle } from "./meeting-rules";
import type { MeetingView } from "./meeting-view";

const normalize = (input: string) =>
  input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const containsIgnoringAccents = (haystack: string, needle: string) =>
  normalize(haystack).includes(normalize(needle));

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

// A session in several rooms is drawn in each, but is one match.
export function matchesInReadingOrder<
  T extends { id: string; top: number; left: number },
>(found: T[]): T[] {
  const seen = new Set<string>();
  return [...found]
    .sort((a, b) => a.top - b.top || a.left - b.left)
    .filter(({ id }) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
}
