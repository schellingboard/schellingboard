"use client";
import {
  createContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useContext,
} from "react";
import { usePathname } from "next/navigation";
import type { Rsvp, Session } from "@schellingboard/domain/session";
import type {
  Location,
  LocationUnavailability,
} from "@schellingboard/domain/location";
import type { Guest } from "@schellingboard/domain/guest";
import type { Event, Day } from "@schellingboard/domain/event";
import {
  currentVerifiedUserAction,
  selectUserAction,
  type SelectUserResult,
} from "@/app/actions/user-auth";
import {
  DEFAULT_BREAK_MINUTES,
  DEFAULT_SLOT_INCREMENT_MINUTES,
} from "@schellingboard/domain/slots";
import { startNowTicker, NOW_REFRESH_INTERVAL_MS } from "@/utils/now-ticker";
import type { MyMeetingsResponse } from "@/utils/meeting-views";
import type { SyncState } from "@/app/legacy/(site)/[eventSlug]/replica/sync-state";

export type DayWithSessions = Day & { sessions: Session[] };

export interface UserContextType {
  user: string | null;
  /**
   * Switches the current user via the server, which owns the identity
   * cookies. Fails with needsAuth for a protected guest — the caller should
   * then collect credentials and call the login action, followed by
   * applyUser on success.
   */
  switchUser: ((u: string | null) => Promise<SelectUserResult>) | null;
  /** Syncs client state after the server already authenticated the user. */
  applyUser: ((u: string | null) => void) | null;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  switchUser: null,
  applyUser: null,
});

export interface EventContextType {
  event: Event | null;
  days: DayWithSessions[];
  sessions: Session[];
  locations: Location[];
  unavailability: LocationUnavailability[];
  guests: Guest[];
  rsvps: Rsvp[];
  // Seeds the 1-on-1 column, so the grid doesn't shift once the client fetch
  // lands. Only valid while `guestId` is still the selected guest.
  myMeetings: ({ guestId: string } & MyMeetingsResponse) | null;
  // Starts as the server-rendered value so SSR and hydration agree on
  // time-dependent decisions (e.g. which schedule days default to folded),
  // then ticks forward on the client (see startNowTicker) so long-lived
  // pages don't treat a stale `now` as current (e.g. bookable-slot checks).
  now: Date;
  meetingsRevision: number;
  sync: SyncState;
  rsvpdForSession: (sessionId: string) => boolean;
  localSessions: Session[];
  userBusySessions: () => Session[];
  updateRsvp: (
    guestId: string,
    sessionId: string,
    remove: boolean
  ) => Promise<{ ok: true } | { ok: false; error?: string }>;
}

export const EventContext = createContext<EventContextType>({
  event: null,
  days: [],
  sessions: [],
  locations: [],
  unavailability: [],
  guests: [],
  rsvps: [],
  myMeetings: null,
  now: new Date(0),
  meetingsRevision: 0,
  sync: "live",
  localSessions: [],
  userBusySessions: () => [],
  rsvpdForSession: () => false,
  updateRsvp: async () => {
    await Promise.resolve();
    return { ok: false };
  },
});

/**
 * The current event's break length, read from EventContext so duration/time
 * displays don't have to prop-drill it. Falls back to DEFAULT_BREAK_MINUTES
 * when no event is in context (e.g. before the provider has loaded).
 */
export function useBreakMinutes(): number {
  const { event } = useContext(EventContext);
  return event?.breakMinutes ?? DEFAULT_BREAK_MINUTES;
}

/**
 * The current event's slot increment, read from EventContext like
 * useBreakMinutes. Falls back to DEFAULT_SLOT_INCREMENT_MINUTES when no event
 * is in context.
 */
export function useSlotIncrement(): number {
  const { event } = useContext(EventContext);
  return event?.slotIncrementMinutes ?? DEFAULT_SLOT_INCREMENT_MINUTES;
}

export function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: string | null;
}) {
  const [user, setUser] = useState<string | null>(initialUser);
  const path = usePathname();

  const switchUser = async (
    guestId: string | null
  ): Promise<SelectUserResult> => {
    const result = await selectUserAction(guestId);
    if (result.ok) {
      setUser(guestId);
    }
    return result;
  };

  // `initialUser` is read once, when the (site) layout mounts, and that layout
  // then survives every client-side navigation — so a selection the server has
  // meanwhile stopped honouring (protection enabled from this browser or from
  // another device, #805) would go on rendering as if it still held, offering
  // a menu whose pages all insist no name is selected. Re-ask the server on
  // each navigation instead. The first run is skipped: the render that mounted
  // this provider already carries the server's answer, and this provider sits
  // above every Suspense boundary, where an update landing during hydration
  // can be built and never committed.
  const checkedOnce = useRef(false);
  useEffect(() => {
    if (!checkedOnce.current) {
      checkedOnce.current = true;
      return;
    }
    if (!user) return;
    let superseded = false;
    async function check() {
      try {
        const verified = await currentVerifiedUserAction();
        // A reply overtaken by a later switch must not undo it.
        if (superseded || verified === user) return;
        if (verified === null) {
          // Clear the cookie too, not just the client state: this browser is
          // logged out, and a selection the server won't act as would go on
          // telling the pages that read it raw (settings, edit profile) that a
          // name is picked.
          await switchUser(null);
        } else {
          // Another tab switched names; the cookie is shared, so it wins.
          setUser(verified);
        }
      } catch {
        // Session check failed — leave the current state as-is;
        // the next navigation will retry.
      }
    }

    void check();
    return () => {
      superseded = true;
    };
  }, [user, path]);

  return (
    <UserContext.Provider value={{ user, switchUser, applyUser: setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function EventProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: Omit<
    EventContextType,
    "localSessions" | "userBusySessions" | "rsvpdForSession"
  >;
}) {
  const { user } = useContext(UserContext);
  const localSessions = value.days.flatMap((d) => d.sessions);
  const rsvps = value.rsvps;
  const [now, setNow] = useState(value.now);
  // The server re-seeds `now` on every RSC render; it jumps when the dev fake
  // clock changes and triggers a router.refresh. Adopt the new instant during
  // render (React's reset-state-on-prop-change pattern) rather than in an
  // effect, so there is no cascading render and no stale flash before the first
  // tick. `seedMs` also keys the ticker effect below.
  const seedMs = value.now.getTime();
  const [prevSeedMs, setPrevSeedMs] = useState(seedMs);
  if (seedMs !== prevSeedMs) {
    setPrevSeedMs(seedMs);
    setNow(value.now);
  }

  // Keep simulated time moving with an offset matching the current seed (~0
  // without an override, the simulated jump under one). Restarted whenever the
  // seed changes; see startNowTicker.
  useEffect(() => {
    // eslint-disable-next-line no-restricted-syntax -- deriving the offset needs the real clock the seed was taken against
    const offsetMs = seedMs - Date.now();
    return startNowTicker(setNow, NOW_REFRESH_INTERVAL_MS, offsetMs);
  }, [seedMs]);

  function userBusySessions() {
    if (user) {
      const sessionsWithRSVP = rsvps.map((r) => r.sessionId);
      return localSessions.filter(
        (ses) =>
          sessionsWithRSVP.includes(ses.id) ||
          ses.hosts.some((h) => h.id === user)
      );
    } else {
      return [];
    }
  }

  const rsvpdForSession = (sessionId: string) => {
    return rsvps.some((rsvp) => rsvp.sessionId === sessionId);
  };

  const contextValue: EventContextType = {
    ...value,
    now,
    localSessions,
    userBusySessions,
    rsvpdForSession,
  };

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
}
