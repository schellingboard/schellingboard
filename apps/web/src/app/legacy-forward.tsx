import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { hardNavigate } from "./hard-navigate";
import { isLegacyPath, legacyHref } from "./legacy-href";

export function LegacyForward() {
  const where = useRouter().history.location;
  const forward = !isLegacyPath(where.pathname);
  const href = legacyHref(where);

  useEffect(() => {
    if (forward) hardNavigate(href);
  }, [forward, href]);

  return null;
}
