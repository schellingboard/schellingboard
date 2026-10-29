import { useState, type FormEvent } from "react";
import type { AdminEventCalls } from "../../commands/admin-events";
import type { FieldErrors } from "../../commands/mutation";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminProposal } from "../../queries/admin-proposals";
import { Button } from "../../ui/button";
import { DataTable } from "../../ui/data-table";
import { PeopleField, TextAreaField, TextField } from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import type { Person } from "../../ui/people-picker";
import {
  LIST_PAGE_SIZE,
  pageOf,
  plural,
  searchByTitleOrHost,
  tableHandlers,
  type OnParams,
} from "./list-paging";
import { ConfirmByTyping } from "./confirm-by-typing";
import { shown, useJumpWithin } from "./use-section-save";

const FIELDS = ["title", "description", "durationMinutes", "hostIds"];

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
    fieldNames: FIELDS,
    explainRefusals: true,
  });
  const errors: FieldErrors = {
    ...(checking && parsed.bad
      ? { durationMinutes: "Duration must be a non-negative whole number" }
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
        label="Title"
        name="title"
        required
        value={title}
        onChange={setTitle}
        error={errors.title}
      />
      <TextAreaField
        label="Description"
        name="description"
        hint="Markdown supported"
        value={description}
        onChange={setDescription}
        error={errors.description}
      />
      <TextField
        label="Duration (minutes) — leave empty for undecided"
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
          No guests assigned to this event yet.
        </p>
      ) : (
        <PeopleField
          label="Hosts"
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
          {mutation.pending ? "Saving..." : "Save"}
        </Button>
        <Button variant="quiet" disabled={mutation.pending} onClick={onClose}>
          Cancel
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
  const sessions =
    proposal.sessionCount > 0
      ? ` ${plural(proposal.sessionCount, "derived session", "derived sessions")} will be kept (unlinked from this proposal).`
      : "";
  return (
    <ConfirmByTyping
      heading={proposal.title}
      label="Type the proposal title to confirm"
      expected={proposal.title}
      warning={`This will permanently delete the proposal, its ${plural(proposal.votesCount, "vote", "votes")} and ${plural(proposal.hosts.length, "host link", "host links")}.${sessions}`}
      call={(key) => calls.deleteProposal(proposal.id, key)}
      onDeleted={onChanged}
      onCancel={onClose}
    />
  );
}

function ProposalItem({
  proposal,
  guests,
  calls,
  onChanged,
}: {
  proposal: AdminProposal;
  guests: Person[];
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const close = () => setMode("view");
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
          Hosts:{" "}
          {proposal.hosts.length > 0
            ? proposal.hosts.map((h) => h.name).join(", ")
            : "—"}
          {` · ${plural(proposal.votesCount, "vote", "votes")}`}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="quiet"
          aria-label={`Edit ${proposal.title}`}
          onClick={() => setMode("edit")}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          aria-label={`Delete ${proposal.title}`}
          onClick={() => setMode("delete")}
        >
          Delete
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
}: {
  proposals: AdminProposal[];
  /** The guests assigned to the event. */
  guests: Person[];
  params: URLSearchParams;
  onParams: OnParams;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const { query, matching } = searchByTitleOrHost(proposals, params);
  const { page, visible } = pageOf(matching, params);

  return (
    <section aria-label="Proposals" className="space-y-4">
      <h2 className="text-lg font-semibold text-fg">Proposals</h2>
      <DataTable
        rows={visible}
        rowKey={(p) => p.id}
        total={matching.length}
        page={page}
        pageSize={LIST_PAGE_SIZE}
        searchQuery={query}
        {...tableHandlers(onParams)}
        searchPlaceholder="Search title or host…"
        emptyMessage="No proposals match."
        listItem={(p) => (
          <ProposalItem
            proposal={p}
            guests={guests}
            calls={calls}
            onChanged={onChanged}
          />
        )}
      />
    </section>
  );
}
