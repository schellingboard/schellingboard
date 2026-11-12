import { plural, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { type FormEvent, useState } from "react";

import type { AdminEventCalls } from "../../commands/admin-events";
import type { FieldErrors } from "../../commands/mutation";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminProposal } from "../../queries/admin-proposals";
import { Button } from "../../ui/button";
import { DataTable } from "../../ui/data-table";
import { PeopleField, TextAreaField, TextField } from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import {
  type OnParams,
  pageOf,
  searchByTitleOrHost,
  tableHandlers,
} from "../../ui/list-paging";
import type { Person } from "../../ui/people-picker";
import { type DayOption, EMPTY_SESSION } from "./admin-session-model";
import { ConfirmByTyping } from "./confirm-by-typing";
import { type EventLocation, SessionForm } from "./event-sessions";
import { useRowMode } from "./row-mode";
import { shown, useJumpWithin } from "./use-section-save";

function parseDuration(text: string): { value: number | null; bad: boolean } {
  const trimmed = text.trim();
  if (trimmed === "") return { value: null, bad: false };
  const value = Number(trimmed);
  return Number.isInteger(value) && value >= 0
    ? { value, bad: false }
    : { value: null, bad: true };
}

function EditForm({
  proposal,
  candidates,
  calls,
  onChanged,
  onClose,
}: {
  proposal: AdminProposal;
  candidates: Person[];
  calls: AdminEventCalls;
  onChanged: () => void;
  onClose: () => void;
}) {
  const { ref, jump } = useJumpWithin<HTMLFormElement>();
  const [version] = useState(proposal.version);
  const [title, setTitle] = useState(proposal.title);
  const [description, setDescription] = useState(proposal.description);
  const [duration, setDuration] = useState(
    proposal.durationMinutes === null ? "" : String(proposal.durationMinutes)
  );
  const [hostIds, setHostIds] = useState(proposal.hosts.map((h) => h.id));
  const [checking, setChecking] = useState(false);
  const parsed = parseDuration(duration);
  const mutation = useFormMutation({
    call: (key) =>
      calls.updateProposal(
        proposal.id,
        {
          title,
          description,
          durationMinutes: parsed.value,
          hostIds,
        },
        version,
        key
      ),
    fieldNames: ["title", "description", "durationMinutes", "hostIds"],
    explainRefusals: true,
  });
  const errors: FieldErrors = {
    ...(checking && parsed.bad
      ? { durationMinutes: t`Duration must be a non-negative whole number` }
      : {}),
    ...mutation.fields,
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setChecking(true);
    if (parsed.bad) return;
    const result = await mutation.submit();
    if (!result) return;
    if (result.ok) {
      onChanged();
      onClose();
    } else if (result.kind === "conflict") onChanged();
  };

  return (
    <form
      ref={ref}
      noValidate
      onSubmit={(e) => void submit(e)}
      className="space-y-3"
    >
      <TextField
        label={t`Title`}
        name="title"
        required
        value={title}
        onChange={setTitle}
        error={errors.title}
      />
      <TextAreaField
        label={t`Description`}
        name="description"
        hint={t`Markdown supported`}
        value={description}
        onChange={setDescription}
        error={errors.description}
      />
      <TextField
        label={t`Duration (minutes) — leave empty for undecided`}
        name="durationMinutes"
        type="number"
        min={0}
        step={5}
        value={duration}
        onChange={setDuration}
        error={errors.durationMinutes}
      />
      {candidates.length === 0 ? (
        <p className="text-sm text-fg-subtle">
          <Trans>No guests assigned to this event yet.</Trans>
        </p>
      ) : (
        <PeopleField
          label={t`Hosts`}
          name="hostIds"
          people={candidates}
          selected={hostIds}
          onChange={setHostIds}
          error={errors.hostIds}
        />
      )}
      <FormErrorSummary
        fields={errors}
        error={shown(mutation.error)}
        onJump={jump}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? t`Saving...` : t`Save`}
        </Button>
        <Button variant="quiet" disabled={mutation.pending} onClick={onClose}>
          <Trans>Cancel</Trans>
        </Button>
      </div>
    </form>
  );
}

function DeleteConfirm({
  proposal,
  calls,
  onChanged,
  onClose,
}: {
  proposal: AdminProposal;
  calls: AdminEventCalls;
  onChanged: () => void;
  onClose: () => void;
}) {
  const { sessionCount, votesCount } = proposal;
  const hostLinks = proposal.hosts.length;
  return (
    <ConfirmByTyping
      heading={proposal.title}
      label={t`Type the proposal title to confirm`}
      expected={proposal.title}
      warning={
        <>
          {t`This will permanently delete the proposal, its ${plural(
            votesCount,
            {
              one: "# vote",
              other: "# votes",
            }
          )} and ${plural(hostLinks, {
            one: "# host link",
            other: "# host links",
          })}.`}
          {sessionCount > 0 &&
            " " +
              plural(sessionCount, {
                one: "# derived session will be kept (unlinked from this proposal).",
                other:
                  "# derived sessions will be kept (unlinked from this proposal).",
              })}
        </>
      }
      call={(key) => calls.deleteProposal(proposal.id, key)}
      onDeleted={onChanged}
      onCancel={onClose}
    />
  );
}

type Scheduling = {
  eventId: string;
  timezone: string;
  days: DayOption[];
  locations: EventLocation[];
  breakMinutes: number;
};

function ProposalItem({
  proposal,
  guests,
  calls,
  scheduling,
  onChanged,
}: {
  proposal: AdminProposal;
  guests: Person[];
  calls: AdminEventCalls;
  scheduling: Scheduling;
  onChanged: () => void;
}) {
  const { mode, close, edit, session, remove } = useRowMode();
  const proposalTitle = proposal.title;
  const { votesCount, sessionCount } = proposal;
  const hostNames =
    proposal.hosts.length > 0
      ? proposal.hosts.map((h) => h.name).join(", ")
      : "—";
  // A current host who left the event stays offered, so saving never drops them.
  const candidates = [
    ...guests,
    ...proposal.hosts.filter((h) => !guests.some((g) => g.id === h.id)),
  ];

  if (mode === "edit")
    return (
      <EditForm
        proposal={proposal}
        candidates={candidates}
        calls={calls}
        onChanged={onChanged}
        onClose={close}
      />
    );
  if (mode === "session")
    return (
      <div className="space-y-3">
        <h3 className="font-medium text-fg">
          <Trans>Session from {proposalTitle}</Trans>
        </h3>
        <SessionForm
          initial={{
            ...EMPTY_SESSION,
            title: proposal.title,
            description: proposal.description,
            hostIds: proposal.hosts.map((h) => h.id),
          }}
          label={t`Session from ${proposalTitle}`}
          timezone={scheduling.timezone}
          days={scheduling.days}
          breakMinutes={scheduling.breakMinutes}
          durationMinutes={proposal.durationMinutes}
          hosts={candidates}
          locations={scheduling.locations}
          submitLabel={t`Create`}
          pendingLabel={t`Creating...`}
          call={(body, key) =>
            calls.createSession(
              { eventId: scheduling.eventId, proposalId: proposal.id, ...body },
              key
            )
          }
          onChanged={onChanged}
          onClose={close}
        />
      </div>
    );
  if (mode === "delete")
    return (
      <DeleteConfirm
        proposal={proposal}
        calls={calls}
        onChanged={onChanged}
        onClose={close}
      />
    );
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1">
        <p className="font-medium text-fg">{proposal.title}</p>
        <p className="text-sm text-fg-subtle">
          <Trans>Hosts: {hostNames}</Trans>
          {" · "}
          {plural(votesCount, { one: "# vote", other: "# votes" })}
          {sessionCount > 0 && (
            <>
              {" · "}
              {plural(sessionCount, { one: "# session", other: "# sessions" })}
            </>
          )}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="quiet"
          aria-label={t`Create session from ${proposalTitle}`}
          onClick={session}
        >
          <Trans>Create session</Trans>
        </Button>
        <Button
          variant="quiet"
          aria-label={t`Edit ${proposalTitle}`}
          onClick={edit}
        >
          <Trans>Edit</Trans>
        </Button>
        <Button
          variant="danger"
          aria-label={t`Delete ${proposalTitle}`}
          onClick={remove}
        >
          <Trans>Delete</Trans>
        </Button>
      </div>
    </div>
  );
}

export function EventProposalsManager({
  proposals,
  guests,
  params,
  onParams,
  calls,
  onChanged,
  ...scheduling
}: Scheduling & {
  proposals: AdminProposal[];
  /** The guests assigned to the event. */
  guests: Person[];
  params: URLSearchParams;
  onParams: OnParams;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const { query, matching } = searchByTitleOrHost(proposals, params);
  const { page, pageSize, visible } = pageOf(matching, params);

  return (
    <section aria-label={t`Proposals`} className="space-y-4">
      <h2 className="text-lg font-semibold text-fg">
        <Trans>Proposals</Trans>
      </h2>
      <DataTable
        rows={visible}
        rowKey={(p) => p.id}
        total={matching.length}
        page={page}
        pageSize={pageSize}
        searchQuery={query}
        {...tableHandlers(onParams)}
        searchPlaceholder={t`Search title or host…`}
        emptyMessage={t`No proposals match.`}
        listItem={(p) => (
          <ProposalItem
            proposal={p}
            guests={guests}
            calls={calls}
            scheduling={scheduling}
            onChanged={onChanged}
          />
        )}
      />
    </section>
  );
}
