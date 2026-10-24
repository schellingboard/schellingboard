import { useEffect, useState } from "react";
import type { ApiClient } from "@schellingboard/api-client";

const CHECK_EVERY_MS = 5 * 60 * 1000;
const RELOADED_FOR = "sb-reloaded-for";

// Replicas behind a load balancer may run different builds; a kiosk that
// reloaded once for a build and still sees it must not reload forever.
function alreadyReloadedFor(build: string) {
  try {
    return sessionStorage.getItem(RELOADED_FOR) === build;
  } catch {
    return false;
  }
}

function markReloadedFor(build: string) {
  try {
    sessionStorage.setItem(RELOADED_FOR, build);
  } catch {
    // Without storage a kiosk may reload more than once.
  }
}

/** The build the server named when it served this page; null on the dev server. */
export function runningBuildId(): string | null {
  return (
    document.querySelector('meta[name="sb-build"]')?.getAttribute("content") ??
    null
  );
}

function useServerRunsAnotherBuild(api: ApiClient, running: string | null) {
  const [outdated, setOutdated] = useState<string | null>(null);

  useEffect(() => {
    if (running === null) return;
    let stale = false;
    const check = () => {
      api
        .GET("/api/v1/health")
        .then(({ data }) => {
          if (!stale && data && data.buildId !== running)
            setOutdated(data.buildId);
        })
        .catch(() => {});
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    check();
    const timer = setInterval(check, CHECK_EVERY_MS);
    window.addEventListener("online", check);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stale = true;
      clearInterval(timer);
      window.removeEventListener("online", check);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [api, running]);

  return outdated;
}

/** Offers a reload when the server runs a newer build; a kiosk takes it unasked. */
export function ReloadOffer({
  api,
  kiosk,
  onReload,
  running = runningBuildId(),
}: {
  api: ApiClient;
  kiosk: boolean;
  onReload: () => void;
  running?: string | null;
}) {
  const outdated = useServerRunsAnotherBuild(api, running);

  useEffect(() => {
    if (outdated === null || !kiosk || alreadyReloadedFor(outdated)) return;
    markReloadedFor(outdated);
    onReload();
  }, [outdated, kiosk, onReload]);

  if (outdated === null || kiosk) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md flex-wrap items-center justify-center gap-3 rounded border border-warning bg-warning-tint px-4 py-2 text-sm text-warning-fg shadow"
    >
      A new version of SchellingBoard is available.
      <button
        type="button"
        onClick={onReload}
        className="font-medium underline"
      >
        Reload
      </button>
    </div>
  );
}
