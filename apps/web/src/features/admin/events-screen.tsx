import { useMemo, useState, type FormEvent } from "react";
import { formatEventDates } from "@schellingboard/domain/time";
import type { AdminEventCalls } from "../../commands/admin-events";
import { FIX_FIELDS_MESSAGE, type FieldErrors } from "../../commands/mutation";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminEvent } from "../../queries/admin-events";
import { Button } from "../../ui/button";
import { MarkdownField, SelectField, TextField } from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { timezones } from "./timezones";

const DEFAULTS = {
  name: "",
  description: "",
  website: "",
  timezone: "UTC",
  maxSessionDuration: "60",
};

const FIELD_NAMES = Object.keys(DEFAULTS);

function NewEventForm({
  calls,
  onCreated,
  onClose,
}: {
  calls: AdminEventCalls;
  onCreated: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(DEFAULTS);
  const [checking, setChecking] = useState(false);
  const zones = useMemo(() => timezones(), []);
  const set = (key: keyof typeof DEFAULTS) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const body = {
    ...form,
    maxSessionDuration: Number(form.maxSessionDuration),
    breakMinutes: 10,
    slotIncrementMinutes: 30,
  };
  const invalid: FieldErrors = {};
  if (!form.name.trim()) invalid.name = "Name is required";
  if (!(body.maxSessionDuration > 0))
    invalid.maxSessionDuration =
      "Max session duration must be a positive number";
  const mutation = useFormMutation({
    call: (key) => calls.create(body, key),
    fieldNames: FIELD_NAMES,
    explainRefusals: true,
  });
  const fields = { ...(checking ? invalid : {}), ...mutation.fields };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setChecking(true);
    if (Object.keys(invalid).length > 0) return;
    if ((await mutation.submit())?.ok) {
      onCreated();
      onClose();
    }
  };

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      noValidate
      className="flex max-w-2xl flex-col gap-3 rounded-md border border-line-subtle p-4"
    >
      <h2 className="font-medium text-fg">New event</h2>
      <TextField
        label="Name"
        name="name"
        required
        value={form.name}
        onChange={set("name")}
        error={fields.name}
      />
      <MarkdownField
        label="Description"
        name="description"
        value={form.description}
        onChange={set("description")}
        error={fields.description}
      />
      <TextField
        label="Website"
        name="website"
        value={form.website}
        onChange={set("website")}
        error={fields.website}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SelectField
          label="Timezone"
          name="timezone"
          required
          value={form.timezone}
          onChange={set("timezone")}
          options={zones.map((tz) => ({ value: tz, label: tz }))}
          error={fields.timezone}
        />
        <TextField
          label="Max session duration (min)"
          name="maxSessionDuration"
          type="number"
          required
          value={form.maxSessionDuration}
          onChange={set("maxSessionDuration")}
          error={fields.maxSessionDuration}
        />
      </div>
      <FormErrorSummary
        fields={fields}
        error={mutation.error === FIX_FIELDS_MESSAGE ? null : mutation.error}
        onJump={(name) =>
          document.querySelector<HTMLElement>(`[name="${name}"]`)?.focus()
        }
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? "Creating..." : "Create event"}
        </Button>
        <Button variant="quiet" disabled={mutation.pending} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AdminEventsScreen({
  status,
  events,
  calls,
  onCreated,
}: {
  status: "loading" | "ready" | "error";
  events: AdminEvent[];
  calls: AdminEventCalls;
  /** The list is out of date: load it again. */
  onCreated: () => void;
}) {
  const [adding, setAdding] = useState(false);

  if (status === "error")
    return (
      <p role="alert" className="text-sm text-danger-fg">
        Could not load the events.
      </p>
    );
  if (status === "loading") return <p className="text-sm">Loading…</p>;

  return (
    <div className="space-y-4">
      {adding ? (
        <NewEventForm
          calls={calls}
          onCreated={onCreated}
          onClose={() => setAdding(false)}
        />
      ) : (
        <Button onClick={() => setAdding(true)}>New event</Button>
      )}
      {events.length === 0 ? (
        <p className="text-sm text-fg-subtle">No events yet.</p>
      ) : (
        <ul className="divide-y divide-line-subtle border-t border-b border-line-subtle">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-fg">{e.name}</p>
                <p className="text-sm text-fg-subtle">
                  {formatEventDates(
                    {
                      timezone: e.timezone,
                      firstDayStart: e.firstDayStart
                        ? new Date(e.firstDayStart)
                        : undefined,
                      lastDayStart: e.lastDayStart
                        ? new Date(e.lastDayStart)
                        : undefined,
                    },
                    "yyyy-MM-dd"
                  ) ?? "No days yet"}
                  {" · "}
                  {e.timezone}
                </p>
              </div>
              <a
                href={`/admin/events/${e.id}`}
                className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-surface-muted"
              >
                Manage
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
