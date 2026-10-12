import { z } from "zod";
import { dayViewSchema, eventViewSchema } from "./event";
import { locationViewSchema, unavailabilityViewSchema } from "./location";
import { meetingPointSchema, meetingSchema } from "./meeting";
import { rsvpViewSchema } from "./rsvp";
import { sessionViewSchema } from "./session";

const instant = z.iso.datetime({ offset: true });

export const snapshotSessionSchema = sessionViewSchema
  .omit({ hosts: true, locations: true, numRsvps: true })
  .extend({ hostIds: z.array(z.string()), locationIds: z.array(z.string()) })
  .meta({ id: "SnapshotSession" });

export const snapshotLocationSchema = locationViewSchema
  .omit({ eventIds: true })
  .meta({ id: "SnapshotLocation" });

export const eventGuestSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().nullable(),
    aboutMe: z.string().nullable(),
    authProtected: z.boolean(),
    profileVersion: z.number().int(),
  })
  .meta({ id: "EventGuest" });

export const snapshotGuestSchema = eventGuestSchema
  .extend({ member: z.boolean().describe("false for a host who is not one") })
  .meta({ id: "SnapshotGuest" });

export const snapshotSchema = z
  .object({
    seq: z.number().int().describe("Resume the feed after this"),
    event: eventViewSchema,
    days: z.array(dayViewSchema),
    locations: z.array(snapshotLocationSchema),
    unavailability: z.array(unavailabilityViewSchema),
    guests: z.array(snapshotGuestSchema).describe("Members and session hosts"),
    sessions: z.array(snapshotSessionSchema),
    counts: z.record(z.string(), z.number().int()).describe("RSVPs by session"),
    meetingPoints: z.array(meetingPointSchema),
    me: z
      .object({
        guestId: z.string(),
        rsvps: z.array(rsvpViewSchema),
        meetings: z.array(meetingSchema),
        meetingGuests: z
          .array(eventGuestSchema)
          .describe("The other party of each own meeting"),
        availability: z.array(instant),
      })
      .nullable(),
  })
  .meta({ id: "Snapshot" });

export type Snapshot = z.infer<typeof snapshotSchema>;
