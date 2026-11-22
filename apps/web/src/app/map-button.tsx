import { t } from "@lingui/core/macro";
import { useState } from "react";

import { Dialog } from "../ui/dialog";
import { MapIcon } from "../ui/icons";

/** The site's uploaded map, when there is one. */
export function MapButton({ url }: { url?: string | null }) {
  const [open, setOpen] = useState(false);

  if (!url) return null;
  return (
    <>
      <button
        type="button"
        aria-label={t`Show map`}
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-fg-subtle hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
      >
        <MapIcon className="h-5 w-5" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t`Map`} wide>
        <img src={url} alt={t`Map`} className="h-auto w-full" />
      </Dialog>
    </>
  );
}
