import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ApiClient } from "@schellingboard/api-client";
import { problemCode } from "../commands/problem";
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

/** `guestId` is undefined until the server has said who the browser acts as. */
export type Viewer = {
  guestId: string | null | undefined;
  choose: (guestId: string) => Promise<ChooseResult>;
  signOut: () => Promise<void>;
  /** Asks the server again, for a change it made without this page: a password reset ends the session. */
  refresh: () => Promise<void>;
};

const ViewerContext = createContext<Viewer | null>(null);

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
  // The first answer can arrive after the viewer has already taken a name,
  // and must not take it back.
  const decided = useRef(false);

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
  }, [api]);

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
        return { ok: true };
      } catch {
        return { ok: false, code: "network.unreachable" };
      }
    },
    [api, persistence, guestId]
  );

  const signOut = useCallback(async () => {
    const { data } = await api.DELETE("/api/v1/me/identity");
    if (data) {
      await persistence.clear();
      decided.current = true;
      remembered.write(data.guestId);
      setGuestId(data.guestId);
    }
  }, [api, persistence]);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.GET("/api/v1/me/identity");
      if (!data) return;
      if (guestId && data.guestId !== guestId) await persistence.clear();
      decided.current = true;
      remembered.write(data.guestId);
      setGuestId(data.guestId);
    } catch {
      // Offline: the known viewer stands until the next load asks again.
    }
  }, [api, persistence, guestId]);

  const value = useMemo(
    () => ({ guestId, choose, signOut, refresh }),
    [guestId, choose, signOut, refresh]
  );
  return (
    <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
  );
}
