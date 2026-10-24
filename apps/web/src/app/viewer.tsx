import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

export type ChooseResult = { ok: true } | { ok: false; code: string };

/** `guestId` is undefined until the server has said who the browser acts as. */
export type Viewer = {
  guestId: string | null | undefined;
  choose: (guestId: string) => Promise<ChooseResult>;
  signOut: () => Promise<void>;
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

  useEffect(() => {
    let stale = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = () =>
      api
        .GET("/api/v1/me/identity")
        .then(({ data }) => {
          if (!data) throw new Error("no identity");
          if (!stale) setGuestId(data.guestId);
        })
        .catch(() => {
          if (!stale) timer = setTimeout(load, RETRY_MS);
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
      setGuestId(data.guestId);
    }
  }, [api, persistence]);

  const value = useMemo(
    () => ({ guestId, choose, signOut }),
    [guestId, choose, signOut]
  );
  return (
    <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
  );
}
