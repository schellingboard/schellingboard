import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useEventView } from "./event-page";
import { PanelLanding } from "./panel-landing";

/** Where a 1-on-1 notification written before the panel lands: its panel over the schedule. */
export function MeetingsPage() {
  const { slug } = useEventView();
  const { history } = useRouter();
  const [id] = useState(() => {
    const params = new URLSearchParams(history.location.search);
    return params.get("viewMeeting");
  });
  useEffect(() => {
    if (!id) history.replace(`/${slug}/schedule`);
  }, [history, slug, id]);
  if (!id) return null;
  return (
    <PanelLanding
      item={{ kind: "meeting", slug, id }}
      background={`/${slug}/schedule`}
    />
  );
}
