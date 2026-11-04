import { useEffect, useState } from "react";
import type { ApiClient } from "@schellingboard/api-client";
import { Dialog } from "../ui/dialog";
import { MapIcon } from "../ui/icons";

/** The site's uploaded map, when there is one. */
export function MapButton({ api }: { api: ApiClient }) {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let stale = false;
    api
      .GET("/api/v1/site")
      .then(({ data }) => {
        if (!stale && data) setUrl(data.mapImageUrl ?? "");
      })
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [api]);

  if (!url) return null;
  return (
    <>
      <button
        type="button"
        aria-label="Show map"
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-fg-subtle hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
      >
        <MapIcon className="h-5 w-5" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Map" wide>
        <img src={url} alt="Map" className="h-auto w-full" />
      </Dialog>
    </>
  );
}
