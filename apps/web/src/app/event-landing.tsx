import { hasPhases, type SchedPhaseDates } from "@schellingboard/domain/phase";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { eventContextFrom } from "../replica/selectors";
import { useEventView } from "./event-page";

// Search params only come from links to the schedule, so any of them decides it.
export function landingPath(
  event: SchedPhaseDates,
  now: Date,
  search: string
): "schedule" | "proposals" {
  const started =
    !hasPhases(event) ||
    (!!event.schedulingPhaseStart &&
      now.getTime() >= event.schedulingPhaseStart.getTime());
  // eslint-disable-next-line lingui/no-unlocalized-strings -- route names
  return search !== "" || started ? "schedule" : "proposals";
}

/** The event's own address only forwards, so Back does not return to it. */
export function EventLanding() {
  const { slug, snapshot, now } = useEventView();
  const { history } = useRouter();
  const { search, hash } = history.location;
  const target = landingPath(eventContextFrom(snapshot).event, now, search);

  useEffect(() => {
    history.replace(`/${slug}/${target}${search}${hash}`);
  }, [history, slug, target, search, hash]);

  return null;
}
