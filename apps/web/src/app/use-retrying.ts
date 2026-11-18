import { useEffect, useRef, useState } from "react";
import { retryDelayMs } from "./retry";

/**
 * `load` until it answers, again after a growing pause while it fails, and at
 * once when the device is back online or the tab is shown. `load` resolves to
 * undefined, or rejects, when it failed; keep it stable between renders.
 */
export function useRetrying<T>(load: () => Promise<T | undefined>) {
  const [data, setData] = useState<T>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const failures = useRef(0);

  useEffect(() => {
    let stale = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const fail = () => {
      if (stale) return;
      failures.current++;
      setFailed(true);
      timer = setTimeout(
        () => setAttempt((n) => n + 1),
        retryDelayMs(failures.current)
      );
    };
    load().then((value) => {
      if (stale) return;
      if (value === undefined) return fail();
      failures.current = 0;
      setFailed(false);
      setData(value);
    }, fail);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [load, attempt]);

  const retry = () => setAttempt((n) => n + 1);
  const retryRef = useRef(retry);
  const failedRef = useRef(failed);
  useEffect(() => {
    retryRef.current = retry;
    failedRef.current = failed;
  });
  useEffect(() => {
    const again = () => {
      if (failedRef.current && document.visibilityState !== "hidden")
        retryRef.current();
    };
    window.addEventListener("online", again);
    document.addEventListener("visibilitychange", again);
    return () => {
      window.removeEventListener("online", again);
      document.removeEventListener("visibilitychange", again);
    };
  }, []);

  return { data, failed, retry };
}
