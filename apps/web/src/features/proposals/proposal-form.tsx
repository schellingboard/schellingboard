import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  proposalCreateSchema,
  proposalUpdateSchema,
} from "@schellingboard/contracts/proposal";
import { actingGuestRefusalMessage } from "@schellingboard/domain/acting-guest-message";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { COHOST_WANTED_NOTE_MAX } from "@schellingboard/domain/session";
import {
  durationMinusBreak,
  slotDurationOptions,
} from "@schellingboard/domain/slots";
import { formatDuration } from "@schellingboard/domain/time";
import {
  FIX_FIELDS_MESSAGE,
  validateFields,
  type FieldErrors,
} from "../../commands/mutation";
import type {
  ProposalCreateBody,
  ProposalFormCalls,
  ProposalUpdateBody,
} from "../../commands/proposal-form";
import { useFormMutation } from "../../commands/use-form-mutation";
import { BackLink } from "../../ui/back-link";
import { Button } from "../../ui/button";
import { ConfirmDialog } from "../../ui/confirm-dialog";
import {
  CheckboxField,
  MarkdownField,
  PeopleField,
  TextField,
} from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import type { ProposalLinks } from "./links";
import { ScheduledSessionsNotice } from "./scheduled-sessions-notice";

const FIELD_NAMES = [
  "title",
  "description",
  "hostIds",
  "durationMinutes",
  "cohostWanted",
  "cohostWantedNote",
];

export type ProposalFormProps = {
  snapshot: Snapshot;
  /** Edits this proposal; a new one when left out. */
  proposalId?: string;
  links: ProposalLinks;
  actions: ProposalFormCalls;
  /** Saved or deleted: the caller leaves the form. */
  onDone: () => void;
};

/** The add and edit proposal screens. */
export function ProposalForm(props: ProposalFormProps) {
  const { snapshot, proposalId, links } = props;
  const viewer = snapshot.me?.guestId ?? null;
  const proposal = proposalId
    ? snapshot.proposals.find((p) => p.id === proposalId)
    : undefined;

  const refusal = (() => {
    if (proposalId && !proposal) return "Proposal not found.";
    const task = proposal ? "editing this proposal" : "creating a proposal";
    if (!viewer && (!proposal || proposal.hosts.length > 0))
      return actingGuestRefusalMessage("guest.unselected", task);
    if (
      proposal &&
      proposal.hosts.length > 0 &&
      !proposal.hosts.some((h) => h.id === viewer)
    )
      return "Only a host of this proposal can edit it.";
    return null;
  })();

  if (refusal)
    return (
      <div className="mx-auto max-w-2xl px-4">
        <BackLink href={links.proposals}>Proposals</BackLink>
        <div className="mt-6">{refusal}</div>
      </div>
    );
  return <Fields {...props} viewer={viewer} proposal={proposal} />;
}

function Fields({
  snapshot,
  links,
  actions,
  onDone,
  viewer,
  proposal,
}: ProposalFormProps & {
  viewer: string | null;
  proposal: Snapshot["proposals"][number] | undefined;
}) {
  const { event } = snapshot;
  const formRef = useRef<HTMLFormElement>(null);
  const body = useRef<ProposalCreateBody | ProposalUpdateBody | null>(null);
  // The fields keep what the form loaded when a newer version arrives, so the
  // save must claim the loaded version for the server to refuse it.
  const [loadedVersion] = useState(proposal?.version);

  const [title, setTitle] = useState(proposal?.title ?? "");
  const [description, setDescription] = useState(proposal?.description ?? "");
  const [hostIds, setHostIds] = useState(
    proposal ? proposal.hosts.map((h) => h.id) : viewer ? [viewer] : []
  );
  const [duration, setDuration] = useState(proposal?.durationMinutes ?? null);
  const [cohostWanted, setCohostWanted] = useState(
    proposal?.cohostWanted ?? false
  );
  const [cohostNote, setCohostNote] = useState(
    proposal?.cohostWantedNote ?? ""
  );
  const [checking, setChecking] = useState(false);
  const [last, setLast] = useState<"save" | "remove">("save");
  const [confirming, setConfirming] = useState(false);

  const people = useMemo(() => {
    const byId = new Map<string, string>();
    for (const g of snapshot.guests)
      if (g.member || hostIds.includes(g.id)) byId.set(g.id, g.name);
    for (const h of proposal?.hosts ?? []) byId.set(h.id, h.name);
    return [...byId].map(([id, name]) => ({ id, name }));
  }, [snapshot.guests, hostIds, proposal]);

  const durations = [
    null,
    ...slotDurationOptions(
      event.slotIncrementMinutes,
      event.maxSessionDuration
    ),
  ];

  const save = useFormMutation({
    call: (key) =>
      proposal
        ? actions.update(proposal.id, body.current as ProposalUpdateBody, key)
        : actions.create(body.current as ProposalCreateBody, key),
    fieldNames: FIELD_NAMES,
  });
  const remove = useFormMutation({
    call: (key) => actions.remove(proposal!.id, key),
  });

  const wanted = cohostWanted && hostIds.length > 0;
  const common = {
    title,
    description,
    hostIds,
    durationMinutes: duration ?? undefined,
    cohostWanted: wanted,
    cohostWantedNote: wanted ? cohostNote : undefined,
  };
  const next = proposal
    ? { ...common, expectedVersion: loadedVersion! }
    : { ...common, eventId: event.id };
  const invalid = validateFields(
    proposal ? proposalUpdateSchema : proposalCreateSchema,
    next
  );
  // After a first refused submit the problems follow the edits, as they did
  // in the legacy form.
  const clientErrors: FieldErrors = checking ? (invalid ?? {}) : {};
  const hasClientErrors = Object.keys(clientErrors).length > 0;
  const fields = hasClientErrors ? clientErrors : save.fields;
  const failure =
    last === "remove" ? remove.error : hasClientErrors ? null : save.error;
  const busy = save.pending || remove.pending;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setChecking(!!invalid);
    setLast("save");
    if (invalid) return;
    body.current = next;
    if ((await save.submit())?.ok) onDone();
  };

  const onDelete = async () => {
    setConfirming(false);
    setLast("remove");
    if ((await remove.submit())?.ok) onDone();
  };

  const jump = (name: string) =>
    formRef.current?.querySelector<HTMLElement>(`[name="${name}"]`)?.focus();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-24">
      <BackLink href={links.proposals}>Proposals</BackLink>
      <div>
        <h2 className="text-2xl font-bold">
          {proposal ? "Edit" : "Add"} Session Proposal
        </h2>
        <p className="mt-2 text-sm text-fg-subtle">
          Share your session idea with the community. Only the title is
          required.
        </p>
      </div>
      {proposal && (
        <ScheduledSessionsNotice
          proposalId={proposal.id}
          snapshot={snapshot}
          links={links}
        >
          Changes here do not reach the schedule. To change a session, open it
          and edit it there.
        </ScheduledSessionsNotice>
      )}

      <form
        ref={formRef}
        noValidate
        onSubmit={(e) => void onSubmit(e)}
        className="flex flex-col gap-4"
      >
        <TextField
          label="Title"
          name="title"
          required
          autoFocus
          value={title}
          onChange={setTitle}
          placeholder="Enter a clear, descriptive title"
          error={fields.title}
        />
        <MarkdownField
          label="Description"
          name="description"
          value={description}
          onChange={setDescription}
          placeholder="Describe what your session will cover"
          error={fields.description}
        />
        <div className="flex flex-col gap-2">
          <PeopleField
            label="Host(s)"
            name="hostIds"
            hint="Leave empty to ask for a session without offering to give it yourself — anyone who can host it may add themselves here later."
            people={people}
            selected={hostIds}
            error={fields.hostIds}
            onChange={(next) => {
              // Hosts forget to withdraw the request once they have found
              // their co-host, so adding one withdraws it.
              if (next.length > hostIds.length) setCohostWanted(false);
              setHostIds(next);
            }}
          />
          {hostIds.length > 0 && (
            <>
              <CheckboxField
                label="Looking for a co-host"
                name="cohostWanted"
                hint="Lists the proposal under “Host wanted” and lets anyone join as a co-host. Stops as soon as someone joins."
                checked={cohostWanted}
                onChange={setCohostWanted}
              />
              {cohostWanted && (
                <TextField
                  label="Who are you looking for?"
                  name="cohostWantedNote"
                  value={cohostNote}
                  onChange={setCohostNote}
                  maxLength={COHOST_WANTED_NOTE_MAX}
                  placeholder="e.g. someone to take over, or a second facilitator"
                  error={fields.cohostWantedNote}
                />
              )}
            </>
          )}
        </div>

        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 font-medium">Duration</legend>
          <div className="grid gap-3">
            {durations.map((value) => (
              <label
                key={value ?? "undecided"}
                className="flex items-center gap-3 text-sm font-medium text-fg"
              >
                <input
                  type="radio"
                  name="durationMinutes"
                  checked={value === duration}
                  onChange={() => setDuration(value)}
                  className="h-4 w-4 border-line text-brand focus:ring-brand-accent"
                />
                {value
                  ? formatDuration(
                      durationMinusBreak(value, event.breakMinutes),
                      true
                    )
                  : "Undecided"}
              </label>
            ))}
          </div>
          {fields.durationMinutes && (
            <p role="alert" className="text-sm text-danger-fg">
              {fields.durationMinutes}
            </p>
          )}
        </fieldset>

        <FormErrorSummary
          fields={fields}
          error={failure === FIX_FIELDS_MESSAGE ? null : failure}
          onJump={jump}
        />

        <div className="flex flex-wrap-reverse items-center gap-3">
          {proposal && (
            <Button
              variant="danger"
              disabled={busy}
              onClick={() => setConfirming(true)}
            >
              Delete
            </Button>
          )}
          <div className="ml-auto flex gap-3">
            <a
              href={links.proposals}
              className="rounded px-6 py-2 font-semibold text-fg-muted bg-surface-muted hover:bg-surface-hover"
            >
              Cancel
            </a>
            <Button type="submit" disabled={!title || busy}>
              {save.pending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </form>
      <ConfirmDialog
        open={confirming}
        title="Delete session proposal?"
        message="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => void onDelete()}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
