import { useRef, useState, type FormEvent } from "react";
import {
  DEFAULT_LOCATION_COLOR,
  LOCATION_COLOR_NAMES,
  isLocationColorName,
} from "@schellingboard/domain/location-colors";
import {
  IMAGE_REQUIREMENTS_HINT,
  MAX_IMAGE_BYTES,
} from "@schellingboard/domain/location-image-constraints";
import type { AdminLocationCalls } from "../../commands/admin-locations";
import type { FieldErrors } from "../../commands/mutation";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminLocation } from "../../queries/admin-locations";
import { Button } from "../../ui/button";
import { cx } from "../../ui/cx";
import {
  CheckboxField,
  FileField,
  SelectField,
  TextAreaField,
  TextField,
} from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { ConfirmByTyping } from "./confirm-by-typing";
import { plural } from "./list-paging";
import { shown, useJumpWithin } from "./use-section-save";

export type EventOption = { id: string; name: string };

const FIELDS = [
  "name",
  "capacity",
  "description",
  "areaDescription",
  "color",
  "bookable",
  "eventIds",
  "image",
];
const CAPACITY_ERROR = "Capacity must be a non-negative whole number";

function LocationForm({
  location,
  events,
  calls,
  submitLabel,
  pendingLabel,
  onSaved,
  onClose,
}: {
  location?: AdminLocation;
  events: EventOption[];
  calls: AdminLocationCalls;
  submitLabel: string;
  pendingLabel: string;
  onSaved: () => void;
  onClose: () => void;
}) {
  const { ref, jump } = useJumpWithin<HTMLFormElement>();
  const [name, setName] = useState(location?.name ?? "");
  const [capacity, setCapacity] = useState(String(location?.capacity ?? 0));
  const [description, setDescription] = useState(location?.description ?? "");
  const [area, setArea] = useState(location?.areaDescription ?? "");
  const [color, setColor] = useState(
    location && isLocationColorName(location.color)
      ? location.color
      : DEFAULT_LOCATION_COLOR
  );
  const [bookable, setBookable] = useState(location?.bookable ?? false);
  const [eventIds, setEventIds] = useState(location?.eventIds ?? []);
  const [image, setImage] = useState<File>();
  const [checking, setChecking] = useState(false);
  const [imageRefused, setImageRefused] = useState(false);
  const [created, setCreated] = useState(false);
  const target = useRef(
    location && { id: location.id, version: location.version }
  );
  const fieldsSaved = useRef(false);

  const capacityValue = capacity.trim() === "" ? NaN : Number(capacity);
  const invalid: FieldErrors = {};
  if (!name.trim()) invalid.name = "Name is required";
  if (!Number.isInteger(capacityValue) || capacityValue < 0)
    invalid.capacity = CAPACITY_ERROR;
  if (image && image.size >= MAX_IMAGE_BYTES)
    invalid.image = `Image exceeds ${MAX_IMAGE_BYTES / 1024 / 1024} MB limit.`;

  const mutation = useFormMutation({
    call: async (key) => {
      const body = {
        name,
        capacity: capacityValue,
        description,
        areaDescription: area,
        color,
        bookable,
        eventIds,
      };
      const at = target.current && {
        ...target.current,
        version: Math.max(target.current.version, location?.version ?? 0),
      };
      const saved = await (at
        ? calls.update(at.id, body, at.version, `${key}:update`)
        : calls.create(body, `${key}:create`));
      if (!saved.data) return saved;
      target.current = { id: saved.data.id, version: saved.data.version };
      fieldsSaved.current = true;
      if (!image) return saved;
      const sent = await calls.replaceImage(
        saved.data.id,
        image,
        saved.data.version,
        `${key}:image`
      );
      if (sent.data) target.current.version = sent.data.version;
      return sent;
    },
    fieldNames: FIELDS,
    explainRefusals: true,
  });
  const fields: FieldErrors = {
    ...(checking ? invalid : {}),
    ...mutation.fields,
    ...(imageRefused && mutation.error ? { image: mutation.error } : {}),
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setChecking(true);
    if (Object.keys(invalid).length > 0) return;
    setImageRefused(false);
    const result = await mutation.submit();
    if (!result) return;
    if (fieldsSaved.current && !location) setCreated(true);
    if (!result.ok && result.kind === "refused")
      setImageRefused(result.code === "location.imageInvalid");
    if (result.ok || fieldsSaved.current || result.kind === "conflict")
      onSaved();
    if (result.ok) onClose();
  };

  return (
    <form
      ref={ref}
      noValidate
      onSubmit={(e) => void submit(e)}
      className="space-y-3 rounded-md border border-line-subtle p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Name"
          name="name"
          required
          value={name}
          onChange={setName}
          error={fields.name}
        />
        <TextField
          label="Capacity"
          name="capacity"
          type="number"
          min={0}
          step={1}
          value={capacity}
          onChange={setCapacity}
          error={fields.capacity}
        />
      </div>
      <TextAreaField
        label="Description"
        name="description"
        rows={2}
        value={description}
        onChange={setDescription}
        error={fields.description}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Area description"
          name="areaDescription"
          value={area}
          onChange={setArea}
          error={fields.areaDescription}
        />
        <div className="flex items-end gap-2">
          <span
            aria-hidden
            className={cx(
              "h-10 w-10 shrink-0 rounded-md border border-line loc-swatch",
              `loc-${color}`
            )}
          />
          <div className="flex-1">
            <SelectField
              label="Color"
              name="color"
              value={color}
              onChange={(value) => setColor(value as typeof color)}
              options={LOCATION_COLOR_NAMES.map((c) => ({
                value: c,
                label: c,
              }))}
              error={fields.color}
            />
          </div>
        </div>
      </div>
      <CheckboxField
        label="Bookable"
        name="bookable"
        checked={bookable}
        onChange={setBookable}
        error={fields.bookable}
      />
      {events.length > 0 && (
        <fieldset className="space-y-1">
          <legend className="font-medium">Events</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {events.map((event) => (
              <CheckboxField
                key={event.id}
                label={event.name}
                checked={eventIds.includes(event.id)}
                onChange={(on) =>
                  setEventIds(
                    on
                      ? [...eventIds, event.id]
                      : eventIds.filter((id) => id !== event.id)
                  )
                }
              />
            ))}
          </div>
          {fields.eventIds && (
            <p role="alert" className="text-sm text-danger-fg">
              {fields.eventIds}
            </p>
          )}
        </fieldset>
      )}
      <div className="space-y-1">
        {location?.imageUrl && (
          <img
            src={location.imageUrl}
            alt={`Current image of ${location.name}`}
            width={160}
            height={120}
            className="rounded border border-line-subtle"
          />
        )}
        <FileField
          label="Image"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          hint={IMAGE_REQUIREMENTS_HINT}
          onChange={setImage}
          error={fields.image}
        />
      </div>
      <FormErrorSummary
        fields={fields}
        error={imageRefused ? null : shown(mutation.error)}
        onJump={jump}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? pendingLabel : created ? "Save" : submitLabel}
        </Button>
        <Button variant="quiet" disabled={mutation.pending} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function LocationRow({
  location,
  events,
  isFirst,
  isLast,
  calls,
  onChanged,
}: {
  location: AdminLocation;
  events: EventOption[];
  isFirst: boolean;
  isLast: boolean;
  calls: AdminLocationCalls;
  onChanged: () => void;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const up = useFormMutation({
    call: (key) => calls.move(location.id, "up", location.version, key),
    explainRefusals: true,
  });
  const down = useFormMutation({
    call: (key) => calls.move(location.id, "down", location.version, key),
    explainRefusals: true,
  });
  const moving = up.pending || down.pending;
  const close = () => setMode("view");

  const move = async (mutation: typeof up) => {
    const result = await mutation.submit();
    if (result && (result.ok || result.kind === "conflict")) onChanged();
  };

  if (mode === "edit")
    return (
      <li className="py-3">
        <LocationForm
          location={location}
          events={events}
          calls={calls}
          submitLabel="Save"
          pendingLabel="Saving..."
          onSaved={onChanged}
          onClose={close}
        />
      </li>
    );

  const details = [
    location.capacity ? `max ${location.capacity}` : null,
    location.bookable ? "bookable" : null,
    events
      .filter((e) => location.eventIds.includes(e.id))
      .map((e) => e.name)
      .join(", ") || null,
  ]
    .filter(Boolean)
    .join(" · ");
  const error = up.error ?? down.error;

  return (
    <li className="space-y-2 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {location.imageUrl && (
          <img
            src={location.imageUrl}
            alt={location.name}
            width={80}
            height={60}
            className="shrink-0 rounded border border-line-subtle"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate font-medium text-fg">
            {isLocationColorName(location.color) && (
              <span
                aria-hidden
                className={cx(
                  "inline-block h-3 w-3 shrink-0 rounded-full border border-line loc-swatch",
                  `loc-${location.color}`
                )}
              />
            )}
            {location.name}
          </p>
          <p className="truncate text-sm text-fg-subtle">{details}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="quiet"
            aria-label={`Move ${location.name} up`}
            disabled={isFirst || moving}
            onClick={() => void move(up)}
          >
            ↑
          </Button>
          <Button
            variant="quiet"
            aria-label={`Move ${location.name} down`}
            disabled={isLast || moving}
            onClick={() => void move(down)}
          >
            ↓
          </Button>
          <Button variant="quiet" onClick={() => setMode("edit")}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => setMode("delete")}>
            Delete
          </Button>
        </div>
      </div>
      {mode === "delete" && (
        <ConfirmByTyping
          label="Location name confirmation"
          expected={location.name}
          warning={`Deleting “${location.name}” removes it from ${plural(location.sessionCount, "session", "sessions")} and ${plural(location.eventIds.length, "event", "events")}. This cannot be undone. Type the location name to confirm.`}
          call={(key) => calls.remove(location.id, key)}
          onDeleted={onChanged}
          onCancel={close}
        />
      )}
      {error && (
        <p role="alert" className="text-sm text-danger-fg">
          {error}
        </p>
      )}
    </li>
  );
}

export function LocationsScreen({
  status,
  locations,
  events,
  calls,
  onChanged,
}: {
  status: "loading" | "ready" | "error";
  locations: AdminLocation[];
  events: EventOption[];
  calls: AdminLocationCalls;
  /** The list is out of date: load it again. */
  onChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);

  if (status === "error")
    return (
      <p role="alert" className="text-sm text-danger-fg">
        Could not load the locations.
      </p>
    );
  if (status === "loading") return <p className="text-sm">Loading…</p>;

  return (
    <section aria-label="Locations" className="space-y-4">
      <h1 className="text-2xl font-bold text-fg">Locations</h1>
      {adding ? (
        <LocationForm
          events={events}
          calls={calls}
          submitLabel="Add location"
          pendingLabel="Adding..."
          onSaved={onChanged}
          onClose={() => setAdding(false)}
        />
      ) : (
        <Button onClick={() => setAdding(true)}>New location</Button>
      )}
      {locations.length === 0 ? (
        <p className="text-sm text-fg-subtle">No locations yet.</p>
      ) : (
        <ul className="divide-y divide-line-subtle border-t border-b border-line-subtle">
          {locations.map((location, index) => (
            <LocationRow
              key={location.id}
              location={location}
              events={events}
              isFirst={index === 0}
              isLast={index === locations.length - 1}
              calls={calls}
              onChanged={onChanged}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
