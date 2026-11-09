import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { hasPhases, type SchedPhaseDates } from "@schellingboard/domain/phase";
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
