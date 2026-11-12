import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { IdentityMode } from "@schellingboard/domain/event";
import { formatEventDates } from "@schellingboard/domain/time";
import { type FormEvent, useMemo, useState } from "react";

import type { AdminEventCalls } from "../../commands/admin-events";
import { type FieldErrors, FIX_FIELDS_MESSAGE } from "../../commands/mutation";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminEvent } from "../../queries/admin-events";
import { Button } from "../../ui/button";
import {
  ComboboxField,
  MarkdownField,
  SelectField,
  TextField,
} from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import type { OnParams } from "../../ui/list-paging";
import { usePaging } from "../../ui/use-paging";
import { identityModeHint, identityModeOptions } from "./identity-mode-options";
import { matchingZones, timezones } from "./timezones";

const DEFAULTS = {
  name: "",
  description: "",
  website: "",
  timezone: "UTC",
  maxSessionDuration: "60",
  identityMode: "verified" as IdentityMode,
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
  const setField =
    <K extends keyof typeof DEFAULTS>(key: K) =>
    (value: (typeof DEFAULTS)[K]) =>
      setForm((prev) => ({ ...prev, [key]: value }));

  const body = {
    ...form,
    maxSessionDuration: Number(form.maxSessionDuration),
    breakMinutes: 10,
    slotIncrementMinutes: 30,
  };
  const invalid: FieldErrors = {};
  if (!form.name.trim()) invalid.name = t`Name is required`;
  if (!(body.maxSessionDuration > 0))
    invalid.maxSessionDuration = t`Max session duration must be a positive number`;
  if (!zones.includes(form.timezone))
    invalid.timezone = t`Pick a time zone from the list`;
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
      <h2 className="font-medium text-fg">
        <Trans>New event</Trans>
      </h2>
      <TextField
        label={t`Name`}
        name="name"
        required
        value={form.name}
        onChange={setField("name")}
        error={fields.name}
      />
      <MarkdownField
        label={t`Description`}
        name="description"
        value={form.description}
        onChange={setField("description")}
        error={fields.description}
      />
      <TextField
        label={t`Website`}
        name="website"
        value={form.website}
        onChange={setField("website")}
        error={fields.website}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ComboboxField
          label={t`Timezone`}
          name="timezone"
          required
          value={form.timezone}
          onChange={setField("timezone")}
          strict
          options={matchingZones(zones, form.timezone)}
          error={fields.timezone}
        />
        <TextField
          label={t`Max session duration (min)`}
          name="maxSessionDuration"
          type="number"
          required
          value={form.maxSessionDuration}
          onChange={setField("maxSessionDuration")}
          error={fields.maxSessionDuration}
        />
      </div>
      <SelectField
        label={t`Identity`}
        name="identityMode"
        value={form.identityMode}
        onChange={(v) => setField("identityMode")(v as IdentityMode)}
        options={identityModeOptions()}
        hint={identityModeHint()}
        error={fields.identityMode}
      />
      <FormErrorSummary
        fields={fields}
        error={mutation.error === FIX_FIELDS_MESSAGE ? null : mutation.error}
        onJump={(name) =>
          document.querySelector<HTMLElement>(`[name="${name}"]`)?.focus()
        }
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? t`Creating...` : t`Create event`}
        </Button>
        <Button variant="quiet" disabled={mutation.pending} onClick={onClose}>
          <Trans>Cancel</Trans>
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
  params,
  onParams,
}: {
  status: "loading" | "ready" | "error";
  events: AdminEvent[];
  params: URLSearchParams;
  onParams: OnParams;
  calls: AdminEventCalls;
  /** The list is out of date: load it again. */
  onCreated: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const { visible, pager, top } = usePaging<AdminEvent, HTMLUListElement>(
    events,
    params,
    onParams
  );

  if (status === "error")
    return (
      <p role="alert" className="text-sm text-danger-fg">
        <Trans>Could not load the events.</Trans>
      </p>
    );
  if (status === "loading")
    return (
      <p className="text-sm">
        <Trans>Loading…</Trans>
      </p>
    );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-fg">
        <Trans>Events</Trans>
      </h1>
      {adding ? (
        <NewEventForm
          calls={calls}
          onCreated={onCreated}
          onClose={() => setAdding(false)}
        />
      ) : (
        <Button onClick={() => setAdding(true)}>
          <Trans>New event</Trans>
        </Button>
      )}
      {events.length === 0 ? (
        <p className="text-sm text-fg-subtle">
          <Trans>No events yet.</Trans>
        </p>
      ) : (
        <ul
          ref={top}
          className="divide-y divide-line-subtle border-t border-b border-line-subtle"
        >
          {visible.map((e) => (
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
                  ) ?? t`No days yet`}
                  {" · "}
                  {e.timezone}
                </p>
              </div>
              <a
                href={`/admin/events/${e.id}`}
                className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-surface-muted"
              >
                <Trans>Manage</Trans>
              </a>
            </li>
          ))}
        </ul>
      )}
      {pager}
    </div>
  );
}
