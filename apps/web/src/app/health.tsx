import { useEffect, useState } from "react";
import type { ApiClient } from "@schellingboard/api-client";

export type Health = { version: string; buildId: string; devTools: boolean };

/** What the server runs; undefined until it has said, and if it cannot be reached. */
export function useHealth(api: ApiClient): Health | undefined {
  const [health, setHealth] = useState<Health>();

  useEffect(() => {
    let stale = false;
    api
      .GET("/api/v1/health")
      .then(({ data }) => {
        if (!stale && data)
          setHealth({
            version: data.version,
            buildId: data.buildId,
            devTools: data.devTools,
          });
      })
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [api]);

  return health;
}
