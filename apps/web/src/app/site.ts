import type { ApiClient } from "@schellingboard/api-client";
import { useEffect, useState } from "react";

type Site = { title: string; mapImageUrl?: string | null };

/** The site settings every page shows; the tab title is set here too. */
export function useSite(api: ApiClient): Site | undefined {
  const [site, setSite] = useState<Site>();
  useEffect(() => {
    let stale = false;
    api
      .GET("/api/v1/site")
      .then(({ data }) => {
        if (!stale && data) setSite(data);
      })
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [api]);
  useEffect(() => {
    // The served page already carries the title, but not a cached or dev one.
    if (site?.title) document.title = site.title;
  }, [site?.title]);
  return site;
}
