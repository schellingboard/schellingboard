import { Fragment, useEffect, useState, type FormEvent } from "react";
import type { AdminGuestCalls } from "../../commands/admin-guests";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminGuest } from "../../queries/admin-guests";
import { Button } from "../../ui/button";
import { DataTable } from "../../ui/data-table";
import { TextField } from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import {
  LIST_PAGE_SIZE,
  byTitleThenId,
  pageOf,
  tableHandlers,
  type OnParams,
} from "./list-paging";
import { shown, useJumpWithin } from "./use-section-save";

const FIELDS = ["name", "email"];

type EventOption = { id: string; name: string };

function AddGuestForm({
  calls,
  onChanged,
}: {
  calls: AdminGuestCalls;
  onChanged: () => void;
}) {
  const { ref, jump } = useJumpWithin<HTMLFormElement>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const mutation = useFormMutation({
    call: (key) => calls.create({ name, email }, key),
    fieldNames: FIELDS,
    explainRefusals: true,
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!(await mutation.submit())?.ok) return;
    setName("");
    setEmail("");
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
            label="Name"
            name="name"
            value={name}
            onChange={setName}
            error={mutation.fields.name}
          />
        </div>
        <div className="flex-1">
          <TextField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            error={mutation.fields.email}
          />
        </div>
        <Button type="submit" disabled={mutation.pending} className="sm:mt-7">
          {mutation.pending ? "Adding..." : "Add user"}
        </Button>
      </div>
      <FormErrorSummary
        fields={mutation.fields}
        error={shown(mutation.error)}
        onJump={jump}
      />
    </form>
  );
}

function EditForm({
  guest,
  calls,
  onChanged,
  onClose,
}: {
  guest: AdminGuest;
  calls: AdminGuestCalls;
  onChanged: () => void;
  onClose: () => void;
}) {
  const { ref, jump } = useJumpWithin<HTMLFormElement>();
  const [name, setName] = useState(guest.name);
  const [email, setEmail] = useState(guest.email);
  const mutation = useFormMutation({
    call: (key) => calls.update(guest.id, { name, email }, guest.version, key),
    fieldNames: FIELDS,
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
          label="Name"
          name="name"
          hideLabel
          value={name}
          onChange={setName}
          error={mutation.fields.name}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          hideLabel
          value={email}
          onChange={setEmail}
          error={mutation.fields.email}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.pending}>
            {mutation.pending ? "Saving..." : "Save"}
          </Button>
          <Button variant="quiet" disabled={mutation.pending} onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
      <FormErrorSummary
        fields={mutation.fields}
        error={shown(mutation.error)}
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
}: {
  guest: AdminGuest;
  events: EventOption[];
  calls: AdminGuestCalls;
  onChanged: () => void;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [sent, setSent] = useState(false);
  const remove = useFormMutation({
    call: (key) => calls.remove(guest.id, key),
    explainRefusals: true,
  });
  const email = useFormMutation({
    call: (key) => calls.sendTestEmail(guest.id, key),
    explainRefusals: true,
  });
  const close = () => setMode("view");

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => setSent(false), 3000);
    return () => clearTimeout(timer);
  }, [sent]);

  if (mode === "edit")
    return (
      <EditForm
        guest={guest}
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
  const memberOf = events.filter((e) => guest.eventIds.includes(e.id));
  const error = email.error ?? remove.error;

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-fg">{guest.name}</p>
          <p className="truncate text-sm text-fg-subtle">{guest.email}</p>
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
            <span className="text-sm text-danger-fg">Delete this user?</span>
            <Button
              variant="danger"
              disabled={remove.pending}
              onClick={() => void confirmDelete()}
            >
              {remove.pending ? "Deleting..." : "Confirm delete"}
            </Button>
            <Button variant="quiet" disabled={remove.pending} onClick={close}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="quiet" onClick={() => setMode("edit")}>
              Edit
            </Button>
            <Button
              variant="quiet"
              disabled={email.pending || sent}
              onClick={() => void sendTestEmail()}
            >
              {email.pending
                ? "Sending..."
                : sent
                  ? "Sent!"
                  : "Send test email"}
            </Button>
            <Button variant="danger" onClick={() => setMode("delete")}>
              Delete
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
  if (status === "error")
    return (
      <p role="alert" className="text-sm text-danger-fg">
        Could not load the users.
      </p>
    );
  if (status === "loading") return <p className="text-sm">Loading…</p>;

  const query = params.get("q")?.trim() ?? "";
  const needle = query.toLowerCase();
  const matching = guests
    .filter(
      (g) =>
        !needle ||
        [g.name, g.email].some((text) => text.toLowerCase().includes(needle))
    )
    .sort(byTitleThenId((g) => g.name));
  const { page, visible } = pageOf(matching, params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-fg">Users</h1>
        <a
          href="/admin/users/import"
          className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-surface-muted"
        >
          Import CSV
        </a>
      </div>
      <section aria-label="Users" className="space-y-4">
        <AddGuestForm calls={calls} onChanged={onChanged} />
        <DataTable
          rows={visible}
          rowKey={(g) => g.id}
          total={matching.length}
          page={page}
          pageSize={LIST_PAGE_SIZE}
          searchQuery={query}
          {...tableHandlers(onParams)}
          searchPlaceholder="Search name or email…"
          emptyMessage="No users match."
          listItem={(g) => (
            <GuestRow
              guest={g}
              events={events}
              calls={calls}
              onChanged={onChanged}
            />
          )}
        />
      </section>
    </div>
  );
}
