import { useMemo } from "react";
import { useRouter } from "@tanstack/react-router";
import { sessionFormCalls } from "../commands/session-form";
import { proposalLinks } from "../features/proposals/links";
import { scheduleLinks } from "../features/schedule/links";
import { SessionForm } from "../features/sessions/session-form";
import { useEventView } from "./event-page";
import { useUrlSearchParams } from "./use-url-search-params";

/** Adds a session, or edits the one `sessionID` names. */
export function SessionFormPage() {
  const { api, slug, snapshot, now } = useEventView();
  const { history } = useRouter();
  const { params } = useUrlSearchParams();
  const links = useMemo(
    () => ({
      schedule: scheduleLinks(slug).schedule,
      proposal: proposalLinks(slug).view,
      session: proposalLinks(slug).session,
    }),
    [slug]
  );
  const actions = useMemo(() => sessionFormCalls(api), [api]);
  return (
    <SessionForm
      snapshot={snapshot}
      now={now}
      sessionId={params.get("sessionID") ?? undefined}
      prefill={{
        day: params.get("day") ?? undefined,
        time: params.get("time") ?? undefined,
        location: params.get("location") ?? undefined,
        proposalId: params.get("proposalID") ?? undefined,
      }}
      links={links}
      actions={actions}
      onDone={() => history.push(links.schedule)}
    />
  );
}
