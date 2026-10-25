import { createContext, useContext, type ReactNode } from "react";
import {
  DEFAULT_BREAK_MINUTES,
  DEFAULT_SLOT_INCREMENT_MINUTES,
} from "@schellingboard/domain/slots";
import type { AttendeeCountApi } from "../../queries/attendee-count";
import type { CommentsController } from "../../queries/comments-controller";
import type { CommentsQuery } from "../../queries/comments";
import type { AttendeesQuery } from "../../queries/attendees";
import type { ScheduleData } from "./data";
import type { ScheduleLinks } from "./links";
import { createScheduleMatch, type ScheduleMatch } from "./model";

export type ScheduleActions = {
  /** Resolves to a message the reader can be shown when the change was refused. */
  toggleRsvp: (
    sessionId: string,
    withdraw: boolean
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  /** Asks who the reader is, which an RSVP needs. */
  pickName: () => void;
  /** The caller destroys the query when done. */
  attendees: (sessionId: string) => AttendeesQuery;
  attendeeCount: AttendeeCountApi;
  /** The caller destroys the query when done. */
  comments: (sessionId: string) => {
    query: CommentsQuery;
    controller: CommentsController;
  };
};

export type ScheduleContextValue = {
  data: ScheduleData;
  links: ScheduleLinks;
  /** The page's search params, which links carry over. */
  params: URLSearchParams;
  actions: ScheduleActions;
  /** Opens a session's modal as a new history entry, so Back closes it. */
  openSession: (sessionId: string) => void;
  setHash: (hash: string) => void;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({
  value,
  children,
}: {
  value: ScheduleContextValue;
  children: ReactNode;
}) {
  return <ScheduleContext value={value}>{children}</ScheduleContext>;
}

export function useSchedule(): ScheduleContextValue & {
  timezone: string;
  slotIncrement: number;
  breakMinutes: number;
} {
  const value = useContext(ScheduleContext);
  if (!value) throw new Error("useSchedule needs a ScheduleProvider");
  const { event } = value.data;
  return {
    ...value,
    timezone: event.timezone,
    slotIncrement: event.slotIncrementMinutes ?? DEFAULT_SLOT_INCREMENT_MINUTES,
    breakMinutes: event.breakMinutes ?? DEFAULT_BREAK_MINUTES,
  };
}

const NO_MATCH: ScheduleMatch & { currentMatchId?: string | null } =
  createScheduleMatch({
    search: "",
    filters: [],
    guestId: null,
    rsvpd: () => false,
  });

const MatchContext = createContext<
  ScheduleMatch & { currentMatchId?: string | null }
>(NO_MATCH);

export function ScheduleMatchProvider({
  value,
  children,
}: {
  value: ScheduleMatch & { currentMatchId?: string | null };
  children: ReactNode;
}) {
  return <MatchContext value={value}>{children}</MatchContext>;
}

export const useScheduleMatch = () => useContext(MatchContext);

/** What the grid draws in place of anything a search or filter passes over. */
export const GHOST_CLASS =
  "opacity-30 grayscale transition-opacity hover:opacity-70";

/** Drawn inside the block: its wrappers clip anything outside. */
export const CURRENT_MATCH_CLASS =
  "outline-3 outline-brand-accent -outline-offset-3";
