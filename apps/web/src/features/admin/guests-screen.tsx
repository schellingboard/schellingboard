import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { type FormEvent, Fragment, useEffect, useState } from "react";

import type { AdminGuestCalls } from "../../commands/admin-guests";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminGuest } from "../../queries/admin-guests";
import { useEmailEnabled } from "../../queries/email-enabled";
import { Button } from "../../ui/button";
import { DataTable } from "../../ui/data-table";
import { CheckboxField, TextField } from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import {
  byTitleThenId,
  type OnParams,
  pageOf,
  tableHandlers,
} from "../../ui/list-paging";
import { useRowMode } from "./row-mode";
import { shown, useJumpWithin } from "./use-section-save";

type EventOption = { id: string; name: string };

function EventChoices({
  events,
  selected,
  onChange,
}: {
  events: EventOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  if (events.length === 0) return null;
  return (
    <fieldset className="space-y-1">
      <legend className="text-sm font-medium text-fg">
        <Trans>Events</Trans>
      </legend>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {events.map((event) => (
          <CheckboxField
            key={event.id}
            label={event.name}
            name={`event-${event.id}`}
            checked={selected.includes(event.id)}
            onChange={(on) =>
              onChange(
                events
                  .map((e) => e.id)
                  .filter((id) =>
                    id === event.id ? on : selected.includes(id)
                  )
              )
            }
          />
        ))}
      </div>
    </fieldset>
  );
}

function AddGuestForm({
  events,
  calls,
  onChanged,
}: {
  events: EventOption[];
  calls: AdminGuestCalls;
  onChanged: () => void;
}) {
  const { ref, jump } = useJumpWithin<HTMLFormElement>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [eventIds, setEventIds] = useState<string[]>([]);
  const mutation = useFormMutation({
    call: (key) => calls.create({ name, email, username, eventIds }, key),
    fieldNames: ["name", "email", "username"],
    explainRefusals: true,
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!(await mutation.submit())?.ok) return;
    setName("");
    setEmail("");
    setUsername("");
    onChanged();
  };

  return (
    <form
      ref={ref}
      noValidate
      onSubmit={(e) => void submit(e)}
      className="max-w-2xl space-y-2"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <TextField
            label={t`Name`}
            name="name"
            value={name}
            onChange={setName}
            error={mutation.fields.name}
          />
        </div>
        <div className="flex-1">
          <TextField
            label={t`Email`}
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            error={mutation.fields.email}
          />
        </div>
        <div className="flex-1">
          <TextField
            label={t`Username`}
            name="username"
            value={username}
            onChange={setUsername}
            error={mutation.fields.username}
          />
        </div>
      </div>
      <EventChoices
        events={events}
        selected={eventIds}
        onChange={setEventIds}
      />
      <Button type="submit" disabled={mutation.pending}>
        {mutation.pending ? t`Adding...` : t`Add user`}
      </Button>
      <FormErrorSummary
        fields={mutation.fields}
        error={shown(mutation)}
        onJump={jump}
      />
    </form>
  );
}

function EditForm({
  guest,
  events,
  calls,
  onChanged,
  onClose,
}: {
  guest: AdminGuest;
  events: EventOption[];
  calls: AdminGuestCalls;
  onChanged: () => void;
  onClose: () => void;
}) {
  const { ref, jump } = useJumpWithin<HTMLFormElement>();
  const [name, setName] = useState(guest.name);
  const [email, setEmail] = useState(guest.email);
  const [username, setUsername] = useState(guest.username);
  const [eventIds, setEventIds] = useState(guest.eventIds);
  const mutation = useFormMutation({
    call: (key) =>
      calls.update(
        guest.id,
        { name, email, username, eventIds },
        guest.version,
        key
      ),
    fieldNames: ["name", "email", "username"],
    explainRefusals: true,
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await mutation.submit();
    if (!result) return;
    if (result.ok) {
      onChanged();
      onClose();
    } else if (result.kind === "conflict") onChanged();
  };

  return (
    <form ref={ref} noValidate onSubmit={(e) => void submit(e)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <TextField
          label={t`Name`}
          name="name"
          hideLabel
          value={name}
          onChange={setName}
          error={mutation.fields.name}
        />
        <TextField
          label={t`Email`}
          name="email"
          type="email"
          hideLabel
          value={email}
          onChange={setEmail}
          error={mutation.fields.email}
        />
        <TextField
          label={t`Username`}
          name="username"
          hideLabel
          value={username}
          onChange={setUsername}
          error={mutation.fields.username}
        />
      </div>
      <EventChoices
        events={events}
        selected={eventIds}
        onChange={setEventIds}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? t`Saving...` : t`Save`}
        </Button>
        <Button variant="quiet" disabled={mutation.pending} onClick={onClose}>
          <Trans>Cancel</Trans>
        </Button>
      </div>
      <FormErrorSummary
        fields={mutation.fields}
        error={shown(mutation)}
        onJump={jump}
      />
    </form>
  );
}

function GuestRow({
  guest,
  events,
  calls,
  onChanged,
  emailEnabled,
}: {
  guest: AdminGuest;
  events: EventOption[];
  calls: AdminGuestCalls;
  onChanged: () => void;
  emailEnabled: boolean | null;
}) {
  const { mode, close, edit, remove: startDelete } = useRowMode();
  const [sent, setSent] = useState(false);
  const remove = useFormMutation({
    call: (key) => calls.remove(guest.id, key),
    explainRefusals: true,
  });
  const email = useFormMutation({
    call: (key) => calls.sendTestEmail(guest.id, key),
    explainRefusals: true,
  });
  const role = useFormMutation({
    call: (key) => calls.setSiteAdmin(guest.id, !guest.siteAdmin, key),
    explainRefusals: true,
  });

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => setSent(false), 3000);
    return () => clearTimeout(timer);
  }, [sent]);

  if (mode === "edit")
    return (
      <EditForm
        guest={guest}
        events={events}
        calls={calls}
        onChanged={onChanged}
        onClose={() => {
          setSent(false);
          close();
        }}
      />
    );

  const sendTestEmail = async () => {
    setSent(false);
    if ((await email.submit())?.ok) setSent(true);
  };
  const confirmDelete = async () => {
    if ((await remove.submit())?.ok) onChanged();
  };
  const toggleRole = async () => {
    if ((await role.submit())?.ok) onChanged();
  };
  const memberOf = events.filter((e) => guest.eventIds.includes(e.id));
  const error = email.error ?? remove.error ?? role.error;

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="min-w-0 truncate font-medium text-fg">{guest.name}</p>
            {guest.siteAdmin && (
              <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-xs font-normal text-fg-muted">
                <Trans>Site admin</Trans>
              </span>
            )}
            {guest.siteAdmin && !guest.hasPassword && (
              <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-xs font-normal text-fg-muted">
                <Trans>No password yet</Trans>
              </span>
            )}
          </div>
          <p className="truncate text-sm text-fg-subtle">
            {guest.email || t`No email`}
            {guest.username && <> · @{guest.username}</>}
          </p>
          {memberOf.length > 0 && (
            <p className="truncate text-sm text-fg-subtle">
              {memberOf.map((event, i) => (
                <Fragment key={event.id}>
                  {i > 0 && " · "}
                  <a
                    href={`/admin/events/${event.id}`}
                    className="underline hover:text-fg-muted"
                  >
                    {event.name}
                  </a>
                </Fragment>
              ))}
            </p>
          )}
        </div>
        {mode === "delete" ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-danger-fg">
              <Trans>Delete this user?</Trans>
            </span>
            <Button
              variant="danger"
              disabled={remove.pending}
              onClick={() => void confirmDelete()}
            >
              {remove.pending ? t`Deleting...` : t`Confirm delete`}
            </Button>
            <Button variant="quiet" disabled={remove.pending} onClick={close}>
              <Trans>Cancel</Trans>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button variant="quiet" onClick={edit}>
              <Trans>Edit</Trans>
            </Button>
            <Button
              variant="quiet"
              disabled={
                email.pending || sent || emailEnabled !== true || !guest.email
              }
              onClick={() => void sendTestEmail()}
            >
              {email.pending
                ? t`Sending...`
                : sent
                  ? t`Sent!`
                  : t`Send test email`}
            </Button>
            <Button
              variant="quiet"
              disabled={role.pending}
              onClick={() => void toggleRole()}
            >
              {guest.siteAdmin ? t`Remove site admin` : t`Make site admin`}
            </Button>
            <Button variant="danger" onClick={startDelete}>
              <Trans>Delete</Trans>
            </Button>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger-fg">
          {error}
        </p>
      )}
    </div>
  );
}

export function AdminGuestsScreen({
  status,
  guests,
  events,
  params,
  onParams,
  calls,
  onChanged,
}: {
  status: "loading" | "ready" | "error";
  guests: AdminGuest[];
  events: EventOption[];
  params: URLSearchParams;
  onParams: OnParams;
  calls: AdminGuestCalls;
  /** The users are out of date: load them again. */
  onChanged: () => void;
}) {
  const emailEnabled = useEmailEnabled(calls.emailEnabled);
  if (status === "error")
    return (
      <p role="alert" className="text-sm text-danger-fg">
        <Trans>Could not load the users.</Trans>
      </p>
    );
  if (status === "loading")
    return (
      <p className="text-sm">
        <Trans>Loading…</Trans>
      </p>
    );

  const query = params.get("q")?.trim() ?? "";
  const needle = query.toLowerCase();
  const matching = guests
    .filter(
      (g) =>
        !needle ||
        [g.name, g.email, g.username].some((text) =>
          text.toLowerCase().includes(needle)
        )
    )
    .sort(byTitleThenId((g) => g.name));
  const { page, pageSize, visible } = pageOf(matching, params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-fg">
          <Trans>Users</Trans>
        </h1>
        <a
          href="/admin/users/import"
          className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-surface-muted"
        >
          <Trans>Import CSV</Trans>
        </a>
      </div>
      <section aria-label={t`Users`} className="space-y-4">
        <AddGuestForm events={events} calls={calls} onChanged={onChanged} />
        <DataTable
          rows={visible}
          rowKey={(g) => g.id}
          total={matching.length}
          page={page}
          pageSize={pageSize}
          searchQuery={query}
          {...tableHandlers(onParams)}
          searchPlaceholder={t`Search name or email…`}
          emptyMessage={t`No users match.`}
          listItem={(g) => (
            <GuestRow
              guest={g}
              events={events}
              calls={calls}
              onChanged={onChanged}
              emailEnabled={emailEnabled}
            />
          )}
        />
      </section>
    </div>
  );
}
