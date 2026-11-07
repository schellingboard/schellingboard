import type { EventFacts } from "./facts";
import { sessionOrigin, type SessionOrigin } from "./session-origin";

export interface StatsFilterInput {
  excludeLocations: string[];
  excludeHosts: string[];
  excludeOrigins: SessionOrigin[];
}

export const DEFAULT_EXCLUDED_ORIGINS: SessionOrigin[] = ["blocker"];

export function isDefaultFilter(filter: StatsFilterInput): boolean {
  return (
    filter.excludeLocations.length === 0 &&
    filter.excludeHosts.length === 0 &&
    filter.excludeOrigins.length === DEFAULT_EXCLUDED_ORIGINS.length &&
    DEFAULT_EXCLUDED_ORIGINS.every((o) => filter.excludeOrigins.includes(o))
  );
}

const ORIGIN_WORDS: Record<SessionOrigin, string> = {
  blocker: "blockers",
  proposal: "proposal sessions",
  organizer: "organizer sessions",
  spontaneous: "spontaneous sessions",
};

export function filterSummary(filter: StatsFilterInput): string {
  const parts = [
    filter.excludeLocations.length > 0 &&
      `${filter.excludeLocations.length} ${filter.excludeLocations.length === 1 ? "location" : "locations"}`,
    filter.excludeHosts.length > 0 &&
      `${filter.excludeHosts.length} ${filter.excludeHosts.length === 1 ? "host" : "hosts"}`,
    ...filter.excludeOrigins.map((origin) => ORIGIN_WORDS[origin]),
  ].filter(Boolean);
  return parts.length === 0 ? "No exclusions" : `Excluding ${parts.join(", ")}`;
}

export function applyFilter(facts: EventFacts, filter: StatsFilterInput) {
  const locations = new Set(filter.excludeLocations);
  const hosts = new Set(filter.excludeHosts);
  const origins = new Set<SessionOrigin>(filter.excludeOrigins);
  const sessions = facts.sessions.filter(
    (s) =>
      !origins.has(sessionOrigin(s)) &&
      !(
        s.locationIds.length > 0 && s.locationIds.every((l) => locations.has(l))
      ) &&
      !(s.hostIds.length > 0 && s.hostIds.every((h) => hosts.has(h)))
  );
  const proposals = facts.proposals.filter(
    (p) => !(p.hostIds.length > 0 && p.hostIds.every((h) => hosts.has(h)))
  );
  const people = new Set(facts.members.filter((id) => !hosts.has(id)));
  return { sessions, proposals, people };
}
