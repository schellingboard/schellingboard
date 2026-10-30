import { useState, type KeyboardEvent } from "react";
import type { AdminEventCalls } from "../../commands/admin-events";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminEvent } from "../../queries/admin-events";
import type { MeetingPoint } from "../../queries/admin-meeting-points";
import { Button } from "../../ui/button";
import { CheckboxField, TextField } from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { useEventSection } from "./use-event-section";
import { jumpTo, shown, useSectionSave } from "./use-section-save";

/** The points sit inside the settings form, so Enter must not save the settings. */
const submitOnEnter = (submit: () => void) => (e: KeyboardEvent) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  submit();
};

function PointRow({
  point,
  eventId,
  calls,
  onChanged,
}: {
  point: MeetingPoint;
  eventId: string;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [name, setName] = useState(point.name);
  const [description, setDescription] = useState(point.description);
  const [version, setVersion] = useState(point.version);
  const save = useFormMutation({
    call: (key) =>
      calls.updatePoint(eventId, point.id, { name, description }, version, key),
    explainRefusals: true,
  });
  const remove = useFormMutation({
    call: (key) => calls.deletePoint(eventId, point.id, key),
    explainRefusals: true,
  });
  const pending = save.pending || remove.pending;

  const handleSave = async () => {
    const result = await save.submit();
    if (!result) return;
    if (result.ok) setMode("view");
    if (result.ok || result.kind === "conflict") onChanged();
  };
  const handleDelete = async () => {
    const result = await remove.submit();
    if (result?.ok || (result && result.kind === "conflict")) onChanged();
  };
  const error = shown(save.error ?? remove.error);

  if (mode === "edit")
    return (
      <li className="space-y-2 p-3">
        <div className="space-y-2 sm:flex sm:items-start sm:gap-3 sm:space-y-0">
          <div
            className="sm:w-1/3"
            onKeyDown={submitOnEnter(() => void handleSave())}
          >
            <TextField
              label={`Name of ${point.name}`}
              hideLabel
              value={name}
              onChange={setName}
              error={save.fields.name}
            />
          </div>
          <div
            className="sm:flex-1"
            onKeyDown={submitOnEnter(() => void handleSave())}
          >
            <TextField
              label={`Description of ${point.name}`}
              hideLabel
              value={description}
              onChange={setDescription}
              error={save.fields.description}
            />
          </div>
          <div className="flex gap-2">
            <Button disabled={pending} onClick={() => void handleSave()}>
              {save.pending ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="quiet"
              disabled={pending}
              onClick={() => {
                setName(point.name);
                setDescription(point.description);
                setMode("view");
                save.reset();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
        <FormErrorSummary fields={{}} error={error} onJump={jumpTo} />
      </li>
    );

  return (
    <li className="space-y-2 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 sm:flex sm:flex-1 sm:gap-3">
          <p className="break-words text-sm font-medium text-fg sm:w-1/3">
            {point.name}
          </p>
          {point.description && (
            <p className="break-words text-sm text-fg-subtle sm:flex-1">
              {point.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="quiet"
            disabled={pending}
            onClick={() => {
              setName(point.name);
              setDescription(point.description);
              setVersion(point.version);
              remove.reset();
              setMode("edit");
            }}
          >
            Edit
          </Button>
          {mode === "delete" ? (
            <>
              <Button
                variant="danger"
                disabled={pending}
                aria-label={`Confirm delete ${point.name}`}
                onClick={() => void handleDelete()}
              >
                {remove.pending ? "Deleting..." : "Confirm delete"}
              </Button>
              <Button
                variant="quiet"
                disabled={pending}
                onClick={() => {
                  setMode("view");
                  remove.reset();
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="danger"
              disabled={pending}
              aria-label={`Delete ${point.name}`}
              onClick={() => setMode("delete")}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
      <FormErrorSummary fields={{}} error={error} onJump={jumpTo} />
    </li>
  );
}

function AddPoint({
  eventId,
  calls,
  onChanged,
}: {
  eventId: string;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const mutation = useFormMutation({
    call: (key) => calls.createPoint(eventId, { name, description }, key),
    explainRefusals: true,
  });

  const close = () => {
    setOpen(false);
    setName("");
    setDescription("");
    mutation.reset();
  };
  const add = async () => {
    if ((await mutation.submit())?.ok) {
      onChanged();
      close();
    }
  };

  if (!open)
    return (
      <Button variant="quiet" onClick={() => setOpen(true)}>
        + Add meeting point
      </Button>
    );

  return (
    <div className="space-y-3 rounded-md border border-line-subtle p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div onKeyDown={submitOnEnter(() => void add())}>
          <TextField
            label="Name"
            name="meetingPointName"
            required
            placeholder="Coffee bar"
            value={name}
            onChange={setName}
            error={mutation.fields.name}
          />
        </div>
        <div
          className="sm:col-span-2"
          onKeyDown={submitOnEnter(() => void add())}
        >
          <TextField
            label="Description"
            name="meetingPointDescription"
            placeholder="Ground floor, next to reception"
            value={description}
            onChange={setDescription}
            error={mutation.fields.description}
          />
        </div>
      </div>
      <FormErrorSummary
        fields={{}}
        error={shown(mutation.error)}
        onJump={jumpTo}
      />
      <div className="flex gap-2">
        <Button disabled={mutation.pending} onClick={() => void add()}>
          {mutation.pending ? "Adding..." : "Add meeting point"}
        </Button>
        <Button variant="quiet" disabled={mutation.pending} onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function EventMeetingsForm({
  event,
  points,
  calls,
  onChanged,
  onPointsChanged,
}: {
  event: AdminEvent;
  points: MeetingPoint[];
  calls: AdminEventCalls;
  /** The event is out of date: load it again. */
  onChanged: () => void;
  onPointsChanged: () => void;
}) {
  const { form, setForm, version, markSaved } = useEventSection(
    {
      meetingsEnabled: event.meetingsEnabled,
      maxOpenMeetingRequests: String(event.maxOpenMeetingRequests),
    },
    event.version
  );
  const section = useSectionSave({
    call: (key) =>
      calls.updateMeetings(
        event.id,
        {
          meetingsEnabled: form.meetingsEnabled,
          ...(form.meetingsEnabled && {
            maxOpenMeetingRequests: Number(form.maxOpenMeetingRequests),
          }),
        },
        version,
        key
      ),
    fieldNames: ["maxOpenMeetingRequests"],
    onSaved: () => markSaved(form),
    onChanged,
  });
  const set = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    section.clearSaved();
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const { fields, error } = section;

  return (
    <form
      aria-label="Meetings"
      onSubmit={(e) => void section.save(e)}
      noValidate
      className="space-y-4"
    >
      <h2 className="text-lg font-semibold text-fg">Meetings</h2>
      <p className="text-sm text-fg-subtle">
        Lets attendees book short 1-on-1s with each other in the gaps between
        sessions.
      </p>
      <div className="rounded-md border border-line-subtle p-4">
        <CheckboxField
          label="Enable meetings"
          hint="Attendees choose their own availability once this is on."
          checked={form.meetingsEnabled}
          onChange={(v) => set("meetingsEnabled", v)}
        />
      </div>

      {form.meetingsEnabled && (
        <>
          <section aria-label="Suggested meeting points" className="space-y-2">
            <h3 className="text-sm font-medium text-fg-muted">
              Suggested meeting points
            </h3>
            <p className="text-sm text-fg-subtle">
              Presets attendees can pick when booking. Nothing is reserved —
              several pairs can use the same spot at the same time.
            </p>
            {points.length > 0 && (
              <ul className="divide-y divide-line-subtle rounded-md border border-line-subtle">
                {points.map((point) => (
                  <PointRow
                    key={point.id}
                    point={point}
                    eventId={event.id}
                    calls={calls}
                    onChanged={onPointsChanged}
                  />
                ))}
              </ul>
            )}
            <AddPoint
              eventId={event.id}
              calls={calls}
              onChanged={onPointsChanged}
            />
          </section>

          <div className="sm:max-w-xs">
            <TextField
              label="Maximum open requests per attendee"
              name="maxOpenMeetingRequests"
              type="number"
              min={1}
              required
              hint="How many unanswered requests one person can have outstanding at once. It caps what they send, never what they receive."
              value={form.maxOpenMeetingRequests}
              onChange={(v) => set("maxOpenMeetingRequests", v)}
              error={fields.maxOpenMeetingRequests}
            />
          </div>
        </>
      )}

      <FormErrorSummary fields={fields} error={error} onJump={jumpTo} />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={section.pending}>
          {section.pending ? "Saving..." : "Save meetings"}
        </Button>
        {section.saved && (
          <span className="text-sm text-success-fg">Saved!</span>
        )}
      </div>
    </form>
  );
}
