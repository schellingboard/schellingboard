import { useEffect, useState } from "react";
import type { ApiClient } from "@schellingboard/api-client";

/** True when unknown: a screen only hides mail options once the server says it cannot send. */
export async function fetchEmailEnabled(api: ApiClient): Promise<boolean> {
  try {
    const { data } = await api.GET("/api/v1/site");
    return data?.emailEnabled ?? true;
  } catch {
    return true;
  }
}

/** Null until the server has answered, so mail options never flash. */
export function useEmailEnabled(load: () => Promise<boolean>): boolean | null {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    let stale = false;
    void load().then((value) => {
      if (!stale) setEnabled(value);
    });
    return () => {
      stale = true;
    };
    // `load` is a stable member of a memoised calls object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return enabled;
}
