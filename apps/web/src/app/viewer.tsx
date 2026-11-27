import type { ApiClient } from "@schellingboard/api-client";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { problemCode } from "../commands/problem";
import { useStoredLocale } from "../i18n";
import { createReplicaPersistence } from "../replica/persistence";

const RETRY_MS = 5_000;
let devicePersistence: ReturnType<typeof createReplicaPersistence> | undefined;
const defaultPersistence = {
  clear: () => (devicePersistence ??= createReplicaPersistence()).clear(),
};

const REMEMBERED = "sb-viewer";

/** Who the server last said this browser acts as: the only way to open the saved schedule offline. */
const remembered = {
  read(): string | null | undefined {
    try {
      const raw = localStorage.getItem(REMEMBERED);
      return raw === null ? undefined : (JSON.parse(raw) as string | null);
    } catch {
      return undefined;
    }
  },
  write(guestId: string | null) {
    try {
      localStorage.setItem(REMEMBERED, JSON.stringify(guestId));
    } catch {
      // Without storage the viewer is simply unknown while offline.
    }
  },
};

export type ChooseResult = { ok: true } | { ok: false; code: string };

export type FixedIdentity = { logoutUrl: string; siteAdmin: boolean };

/** `guestId` is undefined until the server has said who the browser acts as. */
export type Viewer = {
  guestId: string | null | undefined;
  /** Set while a sign-in proxy decides who the browser acts as. */
  fixed?: FixedIdentity;
  /** The name a proxy gave this person, until they confirm it. */
  nameToConfirm?: string;
  /** A sign-in proxy sent an email this site has no person for. */
  proxyUnknownEmail?: boolean;
  choose: (guestId: string) => Promise<ChooseResult>;
  signOut: () => Promise<void>;
  /** Asks the server again, for a change it made without this page: a password reset ends the session. */
  refresh: () => Promise<void>;
};

const flagsOf = (data: {
  nameToConfirm?: string;
  proxyUnknownEmail?: boolean;
}) => ({
  nameToConfirm: data.nameToConfirm,
  proxyUnknownEmail: data.proxyUnknownEmail === true,
});

export const ViewerContext = createContext<Viewer | null>(null);

/** For chrome that also renders before anyone can be signed in. */
export const useOptionalViewer = () => useContext(ViewerContext);

export function useViewer(): Viewer {
  const viewer = useContext(ViewerContext);
  if (!viewer) throw new Error("useViewer needs a ViewerProvider");
  return viewer;
}

export function ViewerProvider({
  api,
  persistence = defaultPersistence,
  children,
}: {
  api: ApiClient;
  persistence?: { clear: () => Promise<void> };
  children: ReactNode;
}) {
  const [guestId, setGuestId] = useState<string | null | undefined>(undefined);
  const [fixed, setFixed] = useState<FixedIdentity>();
  const [flags, setFlags] = useState({
    nameToConfirm: undefined as string | undefined,
    proxyUnknownEmail: false,
  });
  // The first answer can arrive after the viewer has already taken a name,
  // and must not take it back.
  const decided = useRef(false);
  const { setStored } = useStoredLocale();

  useEffect(() => {
    let stale = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = () =>
      api
        .GET("/api/v1/me/identity")
        .then(({ data }) => {
          if (stale) return;
          if (!data) {
            timer = setTimeout(load, RETRY_MS);
            return;
          }
          if (decided.current) return;
          remembered.write(data.guestId);
          if (data.guestId) setStored(data.locale);
          setFixed(data.fixedBy);
          setFlags(flagsOf(data));
          setGuestId(data.guestId);
        })
        .catch(() => {
          if (stale) return;
          // Only a request that never reached the server says we are offline.
          setGuestId((known) => known ?? remembered.read());
          timer = setTimeout(load, RETRY_MS);
        });
    void load();
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [api, setStored]);

  const choose = useCallback(
    async (id: string): Promise<ChooseResult> => {
      try {
        const { data, error, response } = await api.PUT("/api/v1/me/identity", {
          body: { guestId: id },
        });
        if (!data)
          return { ok: false, code: problemCode(error, response.status) };
        // A signed-in viewer taking another name must leave none of the first one's data.
        if (guestId && data.guestId !== guestId) await persistence.clear();
        decided.current = true;
        remembered.write(data.guestId);
        setGuestId(data.guestId);
        setStored(data.locale);
        return { ok: true };
      } catch {
        return { ok: false, code: "network.unreachable" };
      }
    },
    [api, persistence, guestId, setStored]
  );

  const signOut = useCallback(async () => {
    const { response } = await api.POST("/api/v1/auth/sign-out");
    if (response.ok) {
      await persistence.clear();
      decided.current = true;
      remembered.write(null);
      setStored(null);
      setGuestId(null);
    }
  }, [api, persistence, setStored]);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.GET("/api/v1/me/identity");
      if (!data) return;
      if (guestId && data.guestId !== guestId) await persistence.clear();
      decided.current = true;
      remembered.write(data.guestId);
      if (data.guestId) setStored(data.locale);
      setFixed(data.fixedBy);
      setFlags(flagsOf(data));
      setGuestId(data.guestId);
    } catch {
      // Offline: the known viewer stands until the next load asks again.
    }
  }, [api, persistence, guestId, setStored]);

  const value = useMemo(
    () => ({ guestId, fixed, ...flags, choose, signOut, refresh }),
    [guestId, fixed, flags, choose, signOut, refresh]
  );
  return (
    <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
  );
}
