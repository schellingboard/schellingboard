import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg, plural, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  DEFAULT_LOCATION_COLOR,
  isLocationColorName,
  LOCATION_COLOR_NAMES,
  type LocationColorName,
} from "@schellingboard/domain/location-colors";
import {
  LOCATION_IMAGE_ASPECT_RATIO,
  LOCATION_IMAGE_MAX_WIDTH,
  MAX_IMAGE_BYTES,
} from "@schellingboard/domain/location-image-constraints";
import { type FormEvent, useRef, useState } from "react";

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
import { ImageCropDialog } from "../../ui/image-crop-dialog";
import { ImagePreview } from "../../ui/image-preview";
import type { OnParams } from "../../ui/list-paging";
import { LocationPlaceholder } from "../../ui/location-placeholder";
import { cropFile } from "../../ui/resize-image";
import { usePaging } from "../../ui/use-paging";
import { ConfirmByTyping } from "./confirm-by-typing";
import { useRowMode } from "./row-mode";
import { shown, useJumpWithin } from "./use-section-save";

export type EventOption = { id: string; name: string };

const COLOR_LABELS: Record<LocationColorName, MessageDescriptor> = {
  slate: msg({ message: "Slate", context: "Location colour" }),
  gray: msg({ message: "Gray", context: "Location colour" }),
  zinc: msg({ message: "Zinc", context: "Location colour" }),
  neutral: msg({ message: "Neutral", context: "Location colour" }),
  stone: msg({ message: "Stone", context: "Location colour" }),
  red: msg({ message: "Red", context: "Location colour" }),
  orange: msg({ message: "Orange", context: "Location colour" }),
  amber: msg({ message: "Amber", context: "Location colour" }),
  yellow: msg({ message: "Yellow", context: "Location colour" }),
  lime: msg({ message: "Lime", context: "Location colour" }),
  green: msg({ message: "Green", context: "Location colour" }),
  emerald: msg({ message: "Emerald", context: "Location colour" }),
  teal: msg({ message: "Teal", context: "Location colour" }),
  cyan: msg({ message: "Cyan", context: "Location colour" }),
  sky: msg({ message: "Sky", context: "Location colour" }),
  blue: msg({ message: "Blue", context: "Location colour" }),
  indigo: msg({ message: "Indigo", context: "Location colour" }),
  violet: msg({ message: "Violet", context: "Location colour" }),
  purple: msg({ message: "Purple", context: "Location colour" }),
  fuchsia: msg({ message: "Fuchsia", context: "Location colour" }),
  pink: msg({ message: "Pink", context: "Location colour" }),
  rose: msg({ message: "Rose", context: "Location colour" }),
};

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
  const locationName = location?.name ?? "";
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
  const [cropping, setCropping] = useState<File>();
  const [checking, setChecking] = useState(false);
  const [imageRefused, setImageRefused] = useState(false);
  const [created, setCreated] = useState(false);
  const target = useRef(
    location && { id: location.id, version: location.version }
  );
  const fieldsSaved = useRef(false);

  const capacityValue = capacity.trim() === "" ? NaN : Number(capacity);
  const invalid: FieldErrors = {};
  const maxImageMb = MAX_IMAGE_BYTES / 1024 / 1024;
  if (!name.trim()) invalid.name = t`Name is required`;
  if (!Number.isInteger(capacityValue) || capacityValue < 0)
    invalid.capacity = t`Capacity must be a non-negative whole number`;
  if (image && image.size >= MAX_IMAGE_BYTES)
    invalid.image = t`Image exceeds ${maxImageMb} MB limit.`;

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
    fieldNames: [
      "name",
      "capacity",
      "description",
      "areaDescription",
      "color",
      "bookable",
      "eventIds",
      "image",
    ],
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
          label={t`Name`}
          name="name"
          required
          value={name}
          onChange={setName}
          error={fields.name}
        />
        <TextField
          label={t`Capacity`}
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
        label={t`Description`}
        name="description"
        rows={2}
        value={description}
        onChange={setDescription}
        error={fields.description}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label={t`Area description`}
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
              label={t({
                message: "Color",
                comment: "Field: the colour of a location on the schedule",
              })}
              name="color"
              value={color}
              onChange={(value) => setColor(value as typeof color)}
              options={LOCATION_COLOR_NAMES.map((c) => ({
                value: c,
                label: i18n._(COLOR_LABELS[c]),
              }))}
              error={fields.color}
            />
          </div>
        </div>
      </div>
      <CheckboxField
        label={t`Bookable`}
        name="bookable"
        checked={bookable}
        onChange={setBookable}
        error={fields.bookable}
      />
      {events.length > 0 && (
        <fieldset className="space-y-1">
          <legend className="font-medium">
            <Trans>Events</Trans>
          </legend>
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
        {image ? (
          <ImagePreview
            file={image}
            label={t`New image of ${locationName}`}
            width={160}
            height={120}
            className="rounded border border-line-subtle"
          />
        ) : (
          location?.imageUrl && (
            <img
              src={location.imageUrl}
              alt={t`Current image of ${locationName}`}
              width={160}
              height={120}
              className="rounded border border-line-subtle"
            />
          )
        )}
        <FileField
          label={t`Image`}
          name="image"
          accept="image/jpeg,image/png,image/webp"
          hint={t`JPEG, PNG, or WebP, max ${maxImageMb} MB. You choose the part to show, in 4:3.`}
          onChange={(file) => (file ? setCropping(file) : setImage(undefined))}
          error={fields.image}
        />
        {cropping && (
          <ImageCropDialog
            file={cropping}
            aspectRatio={LOCATION_IMAGE_ASPECT_RATIO}
            onConfirm={(region) => {
              setCropping(undefined);
              if (!region) return setImage(cropping);
              void cropFile(
                cropping,
                {
                  aspectRatio: LOCATION_IMAGE_ASPECT_RATIO,
                  maxWidth: LOCATION_IMAGE_MAX_WIDTH,
                },
                region
              ).then(setImage);
            }}
            onCancel={() => setCropping(undefined)}
          />
        )}
      </div>
      <FormErrorSummary
        fields={fields}
        error={imageRefused ? null : shown(mutation)}
        onJump={jump}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? pendingLabel : created ? t`Save` : submitLabel}
        </Button>
        <Button variant="quiet" disabled={mutation.pending} onClick={onClose}>
          <Trans>Cancel</Trans>
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
  const { mode, close, edit, remove } = useRowMode();
  const name = location.name;
  const up = useFormMutation({
    call: (key) => calls.move(location.id, "up", location.version, key),
    explainRefusals: true,
  });
  const down = useFormMutation({
    call: (key) => calls.move(location.id, "down", location.version, key),
    explainRefusals: true,
  });
  const moving = up.pending || down.pending;

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
          submitLabel={t`Save`}
          pendingLabel={t`Saving...`}
          onSaved={onChanged}
          onClose={close}
        />
      </li>
    );

  const capacity = location.capacity;
  const details = [
    capacity
      ? t({
          message: `max ${capacity}`,
          context: "Location details: seats, lowercase in a list",
        })
      : null,
    location.bookable
      ? t({
          message: "bookable",
          comment: "Adjective in a lowercase details list",
        })
      : null,
    events
      .filter((e) => location.eventIds.includes(e.id))
      .map((e) => e.name)
      .join(", ") || null,
  ]
    .filter(Boolean)
    .join(" · ");
  const error = up.error ?? down.error;
  const sessionCount = location.sessionCount;
  const eventCount = location.eventIds.length;
  const deleteWarning =
    sessionCount > 0
      ? t`Deleting “${name}” removes it from ${plural(sessionCount, {
          one: "# session",
          other: "# sessions",
        })} and ${plural(eventCount, {
          one: "# event",
          other: "# events",
        })}. Hosts and RSVPed guests of those sessions are told. This cannot be undone. Type the location name to confirm.`
      : t`Deleting “${name}” removes it from ${plural(sessionCount, {
          one: "# session",
          other: "# sessions",
        })} and ${plural(eventCount, {
          one: "# event",
          other: "# events",
        })}. This cannot be undone. Type the location name to confirm.`;

  return (
    <li className="space-y-2 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {location.imageUrl ? (
          <img
            src={location.imageUrl}
            alt={location.name}
            width={80}
            height={60}
            className="shrink-0 rounded border border-line-subtle"
          />
        ) : (
          <LocationPlaceholder
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
            aria-label={t`Move ${name} up`}
            disabled={isFirst || moving}
            onClick={() => void move(up)}
          >
            ↑
          </Button>
          <Button
            variant="quiet"
            aria-label={t`Move ${name} down`}
            disabled={isLast || moving}
            onClick={() => void move(down)}
          >
            ↓
          </Button>
          <Button variant="quiet" onClick={edit}>
            <Trans>Edit</Trans>
          </Button>
          <Button variant="danger" onClick={remove}>
            <Trans>Delete</Trans>
          </Button>
        </div>
      </div>
      {mode === "delete" && (
        <ConfirmByTyping
          label={t`Location name confirmation`}
          expected={location.name}
          warning={deleteWarning}
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
  params,
  onParams,
}: {
  status: "loading" | "ready" | "error";
  locations: AdminLocation[];
  params: URLSearchParams;
  onParams: OnParams;
  events: EventOption[];
  calls: AdminLocationCalls;
  /** The list is out of date: load it again. */
  onChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const { visible, first, pager, top } = usePaging<
    AdminLocation,
    HTMLUListElement
  >(locations, params, onParams);

  if (status === "error")
    return (
      <p role="alert" className="text-sm text-danger-fg">
        <Trans>Could not load the locations.</Trans>
      </p>
    );
  if (status === "loading")
    return (
      <p className="text-sm">
        <Trans>Loading…</Trans>
      </p>
    );

  return (
    <section aria-label={t`Locations`} className="space-y-4">
      <h1 className="text-2xl font-bold text-fg">
        <Trans>Locations</Trans>
      </h1>
      {adding ? (
        <LocationForm
          events={events}
          calls={calls}
          submitLabel={t`Add location`}
          pendingLabel={t`Adding...`}
          onSaved={onChanged}
          onClose={() => setAdding(false)}
        />
      ) : (
        <Button onClick={() => setAdding(true)}>
          <Trans>New location</Trans>
        </Button>
      )}
      {locations.length === 0 ? (
        <p className="text-sm text-fg-subtle">
          <Trans>No locations yet.</Trans>
        </p>
      ) : (
        <ul
          ref={top}
          className="divide-y divide-line-subtle border-t border-b border-line-subtle"
        >
          {visible.map((location, index) => (
            <LocationRow
              key={location.id}
              location={location}
              events={events}
              isFirst={first + index === 0}
              isLast={first + index === locations.length - 1}
              calls={calls}
              onChanged={onChanged}
            />
          ))}
        </ul>
      )}
      {pager}
    </section>
  );
}
