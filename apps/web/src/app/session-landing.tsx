import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { landOnPanel } from "./panel-history";

/** A session's own address opened directly: the schedule is the page behind its panel. */
export function SessionLanding({
  slug,
  sessionId,
}: {
  slug: string;
  sessionId: string;
}) {
  const { history } = useRouter();
  const landed = useRef(false);
  useEffect(() => {
    if (landed.current) return;
    landed.current = true;
    const { search, hash } = history.location;
    landOnPanel(
      history,
      {
        kind: "session",
        slug,
        id: sessionId,
        record: new URLSearchParams(search).get("record") === "count",
      },
      `/${slug}/schedule`,
      hash
    );
  }, [history, slug, sessionId]);
  return null;
}
