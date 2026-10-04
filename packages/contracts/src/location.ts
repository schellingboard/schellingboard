import { z } from "zod";
import {
  DEFAULT_LOCATION_COLOR,
  LOCATION_COLOR_NAMES,
  normalizeLocationColor,
} from "@schellingboard/domain/location-colors";

// Clearing the capacity field yields NaN, and a fractional entry yields a
// non-integer; both need the same plain-language message rather than zod's
// "expected int, received NaN".
const CAPACITY_ERROR = "Capacity must be a non-negative whole number";

export const locationSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required" }),
  capacity: z.int({ error: CAPACITY_ERROR }).min(0, { error: CAPACITY_ERROR }),
  description: z.string().trim().default(""),
  // The form always submits a string; blank must stay unset, because the
  // schedule grid renders a spacer only for a missing area description.
  areaDescription: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
  color: z
    .string()
    .trim()
    .transform(normalizeLocationColor)
    .pipe(z.enum(LOCATION_COLOR_NAMES))
    .optional()
    .default(DEFAULT_LOCATION_COLOR),
  bookable: z.boolean().default(false),
  eventIds: z.string().array().default([]),
  image: z
    .instanceof(Blob)
    .transform((blob) => (blob.size > 0 ? blob : undefined))
    .nullable()
    .optional(),
});

export const updateLocationSchema = locationSchema.extend({
  id: z.string().nonempty(),
});

const instant = z.iso.datetime({ offset: true });

export const locationBodySchema = locationSchema.omit({ image: true });

export const locationViewSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  areaDescription: z.string().nullable(),
  capacity: z.number().int(),
  color: z.string(),
  bookable: z.boolean().describe("false hides it from attendees' booking"),
  imageUrl: z.string(),
  sortIndex: z.number().int(),
  eventIds: z.array(z.string()),
});

export const locationListSchema = z.object({
  locations: z.array(locationViewSchema),
});

export const locationMoveSchema = z.object({
  direction: z.enum(["up", "down"]),
});

export const eventLocationsBodySchema = z.object({
  locationIds: z.array(z.string()),
});

export const unavailabilityBodySchema = z.object({
  locationIds: z.array(z.string()),
  start: instant,
  end: instant,
});

export const unavailabilityViewSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  locationId: z.string(),
  start: instant,
  end: instant,
});

export const unavailabilityListSchema = z.object({
  periods: z.array(unavailabilityViewSchema),
});
