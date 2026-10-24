import { useEffect, useState } from "react";
import type { UpdateStatus } from "@schellingboard/contracts/updates";
import type { ApiClient } from "@schellingboard/api-client";

export type { UpdateStatus };

/** What the server says about newer releases; null for anyone but the admin, or when unknown. */
export function useUpdateStatus(api: ApiClient): UpdateStatus | null {
  const [status, setStatus] = useState<UpdateStatus | null>(null);

  useEffect(() => {
    let stale = false;
    api
      .GET("/api/v1/updates")
      .then(({ data }) => {
        if (!stale && data) setStatus(data);
      })
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [api]);

  return status;
}
