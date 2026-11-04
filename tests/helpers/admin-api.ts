import { NextRequest } from "next/server";
import { DELETE, GET, POST, PUT } from "@/tests/helpers/v1-route";
import { createAdminAuthCookie } from "./admin-cookie";

type Problem = {
  code: string;
  detail?: string;
  errors?: { path: string; message: string }[];
};

type Sent<T = unknown> =
  { ok: true; data: T } | { ok: false; error: string; problem: Problem };

type FieldIssue = {
  code: "custom";
  path: string[];
  message: string;
  input: undefined;
};

export type AdminResult =
  { ok: true } | { ok: false; error: string | FieldIssue[]; code?: string };

const HANDLERS = { GET, POST, PUT, DELETE } as const;

let cookie = "";

/** From here on the admin routes are called as a signed-in admin. */
export async function loginAsAdmin() {
  const c = await createAdminAuthCookie();
  cookie = `${c.name}=${c.value}`;
}

export const logoutAdmin = () => {
  cookie = "";
};

async function sendRaw<T = unknown>(
  method: keyof typeof HANDLERS,
  path: string,
  body?: unknown
): Promise<Sent<T>> {
  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = cookie;
  const form = body instanceof FormData;
  if (body !== undefined && !form) headers["content-type"] = "application/json";
  const res = await HANDLERS[method](
    new NextRequest(`http://test/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : form ? body : JSON.stringify(body),
    })
  );
  const text = await res.text();
  const json: unknown = text ? JSON.parse(text) : undefined;
  if (res.ok) return { ok: true, data: json as T };
  const problem = json as Problem;
  return {
    ok: false,
    error:
      problem.detail ??
      problem.errors?.map((e) => e.message).join("; ") ??
      problem.code,
    problem,
  };
}

async function send(
  method: keyof typeof HANDLERS,
  path: string,
  body?: unknown
): Promise<AdminResult> {
  const result = await sendRaw(method, path, body);
  if (result.ok) return { ok: true };
  // Not enumerable, so assertions on the whole result need not name it.
  return Object.defineProperty(
    { ok: false as const, error: result.error },
    "code",
    { value: result.problem.code }
  );
}

/** Field problems come back as issues, so each message can land on its input. */
function asForm(result: Sent): AdminResult {
  if (result.ok) return { ok: true };
  const { errors } = result.problem;
  if (!errors) return { ok: false, error: result.error };
  return {
    ok: false,
    error: errors.map(({ path: field, message }) => ({
      code: "custom",
      path: field ? field.split(".") : [],
      message,
      input: undefined,
    })),
  };
}

const sendForm = async (
  method: keyof typeof HANDLERS,
  path: string,
  body?: unknown
) => asForm(await sendRaw(method, path, body));

const instant = (value: string | undefined) =>
  value?.trim()
    ? value.length === 16
      ? `${value}:00.000Z`
      : value
    : undefined;

type WithId = { id: string; expectedVersion: number };

export type DayInput = {
  start: string;
  end: string;
  startBookings: string;
  endBookings: string;
};

const dayBody = (input: DayInput) => ({
  start: instant(input.start),
  end: instant(input.end),
  startBookings: instant(input.startBookings),
  endBookings: instant(input.endBookings),
});

export const createDayAction = (input: DayInput & { eventId: string }) =>
  send("POST", `/admin/events/${input.eventId}/days`, dayBody(input));

export const updateDayAction = (
  input: DayInput & WithId & { eventId?: string }
) =>
  send("PUT", `/admin/days/${input.id}`, {
    ...dayBody(input),
    expectedVersion: input.expectedVersion,
  });

export const deleteDayAction = ({ id }: { id: string; eventId?: string }) =>
  send("DELETE", `/admin/days/${id}`);

export type EventInput = {
  name: string;
  description: string;
  website: string;
  timezone: string;
  maxSessionDuration: string;
  breakMinutes: string;
  slotIncrementMinutes: string;
  rsvpCapacityHardLimit?: boolean;
  icon?: string;
};

const eventBody = ({
  maxSessionDuration,
  breakMinutes,
  slotIncrementMinutes,
  ...rest
}: EventInput) => ({
  ...rest,
  icon: rest.icon === "" ? null : rest.icon,
  maxSessionDuration: parseInt(maxSessionDuration, 10),
  breakMinutes: parseInt(breakMinutes, 10),
  slotIncrementMinutes: parseInt(slotIncrementMinutes, 10),
});

export const createEventAction = (input: EventInput) =>
  send("POST", "/admin/events", eventBody(input));

export const updateEventAction = ({
  id,
  expectedVersion,
  ...input
}: EventInput & WithId) =>
  send("PUT", `/admin/events/${id}`, { ...eventBody(input), expectedVersion });

export type EventPhasesInput = WithId & {
  proposalPhaseStart?: string;
  proposalPhaseEnd?: string;
  votingPhaseStart?: string;
  votingPhaseEnd?: string;
  schedulingPhaseStart?: string;
  schedulingPhaseEnd?: string;
};

export const updateEventPhasesAction = ({ id, ...input }: EventPhasesInput) =>
  send("PUT", `/admin/events/${id}/phases`, {
    proposalPhaseStart: instant(input.proposalPhaseStart) ?? null,
    proposalPhaseEnd: instant(input.proposalPhaseEnd) ?? null,
    votingPhaseStart: instant(input.votingPhaseStart) ?? null,
    votingPhaseEnd: instant(input.votingPhaseEnd) ?? null,
    schedulingPhaseStart: instant(input.schedulingPhaseStart) ?? null,
    schedulingPhaseEnd: instant(input.schedulingPhaseEnd) ?? null,
    expectedVersion: input.expectedVersion,
  });

export const deleteEventAction = ({ id }: { id: string }) =>
  send("DELETE", `/admin/events/${id}`);

export type EventMeetingsInput = WithId & {
  meetingsEnabled: boolean;
  maxOpenMeetingRequests: string;
};

export const updateEventMeetingsAction = (input: EventMeetingsInput) =>
  send("PUT", `/admin/events/${input.id}/meetings`, {
    meetingsEnabled: input.meetingsEnabled,
    maxOpenMeetingRequests: input.meetingsEnabled
      ? parseInt(input.maxOpenMeetingRequests, 10)
      : undefined,
    expectedVersion: input.expectedVersion,
  });

type PointInput = { eventId: string; name: string; description?: string };

export const createMeetingPointAction = ({ eventId, ...body }: PointInput) =>
  send("POST", `/admin/events/${eventId}/meeting-points`, body);

export const updateMeetingPointAction = ({
  eventId,
  id,
  ...body
}: PointInput & WithId) =>
  send("PUT", `/admin/events/${eventId}/meeting-points/${id}`, body);

export const deleteMeetingPointAction = ({
  eventId,
  id,
}: {
  eventId: string;
  id: string;
}) => send("DELETE", `/admin/events/${eventId}/meeting-points/${id}`);

type GuestBody = { name: string; email: string };

export const createGuestAction = (input: GuestBody) =>
  sendForm("POST", "/admin/guests", input);

export const updateGuestAction = ({ id, ...body }: GuestBody & WithId) =>
  sendForm("PUT", `/admin/guests/${id}`, body);

export const deleteGuestAction = ({ id }: { id: string }) =>
  send("DELETE", `/admin/guests/${id}`);

export const sendTestEmailAction = ({ id }: { id: string }) =>
  send("POST", `/admin/guests/${id}/test-email`);

export const assignGuestsToEventAction = ({
  eventId,
  guestIds,
}: {
  eventId: string;
  guestIds: string[];
}) => send("POST", `/admin/events/${eventId}/guests/assign`, { guestIds });

export const removeGuestsFromEventAction = ({
  eventId,
  guestIds,
}: {
  eventId: string;
  guestIds: string[];
}) => send("POST", `/admin/events/${eventId}/guests/remove`, { guestIds });

export async function importGuestsAction(input: {
  csvText: string;
  eventIds: string[];
}) {
  const result = await sendRaw<{ created: number; existing: number }>(
    "POST",
    "/admin/guests/import",
    { csv: input.csvText, eventIds: input.eventIds }
  );
  if (result.ok) return { ok: true as const, ...result.data };
  return {
    ok: false as const,
    error: result.problem.detail ?? result.problem.code,
    lineErrors: result.problem.errors?.map((e) => e.message),
  };
}

export const assignLocationsToEventAction = ({
  eventId,
  locationIds,
}: {
  eventId: string;
  locationIds: string[];
}) =>
  send("POST", `/admin/events/${eventId}/locations/assign`, { locationIds });

export const removeLocationsFromEventAction = ({
  eventId,
  locationIds,
}: {
  eventId: string;
  locationIds: string[];
}) =>
  send("POST", `/admin/events/${eventId}/locations/remove`, { locationIds });

export type LocationInput = {
  name: string;
  capacity: number;
  description?: string;
  areaDescription?: string;
  color?: string;
  bookable?: boolean;
  eventIds?: string[];
  image?: Blob | null;
};

/** Creating or updating with an image is two calls, as the SPA does it. */
async function withImage(
  saved: Sent<{ id: string; version: number }>,
  image: Blob | null | undefined
): Promise<AdminResult> {
  if (!saved.ok) return asForm(saved);
  if (!image || image.size === 0) return { ok: true };
  const form = new FormData();
  form.set("image", image, "image");
  form.set("expectedVersion", String(saved.data.version));
  return sendForm("PUT", `/admin/locations/${saved.data.id}/image`, form);
}

export async function createLocationAction({ image, ...body }: LocationInput) {
  return withImage(
    await sendRaw<{ id: string; version: number }>(
      "POST",
      "/admin/locations",
      body
    ),
    image
  );
}

export async function updateLocationAction({
  id,
  expectedVersion,
  image,
  ...body
}: LocationInput & WithId) {
  return withImage(
    await sendRaw<{ id: string; version: number }>(
      "PUT",
      `/admin/locations/${id}`,
      {
        ...body,
        expectedVersion,
      }
    ),
    image
  );
}

export const deleteLocationAction = ({ id }: { id: string }) =>
  send("DELETE", `/admin/locations/${id}`);

export const moveLocationAction = ({
  id,
  direction,
  expectedVersion,
}: WithId & { direction: "up" | "down" }) =>
  send("POST", `/admin/locations/${id}/move`, { direction, expectedVersion });

export const addLocationUnavailabilityAction = (input: {
  eventId: string;
  locationIds: string[];
  start: string;
  end: string;
}) =>
  send("POST", `/admin/events/${input.eventId}/location-unavailability`, {
    locationIds: input.locationIds,
    start: instant(input.start),
    end: instant(input.end),
  });

export const deleteLocationUnavailabilityAction = ({ id }: { id: string }) =>
  send("DELETE", `/admin/location-unavailability/${id}`);

export const adminUpdateProposalAction = ({
  id,
  ...body
}: {
  id: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  hostIds: string[];
  expectedVersion: number;
}) => send("PUT", `/admin/proposals/${id}`, body);

export const adminDeleteProposalAction = ({ id }: { id: string }) =>
  send("DELETE", `/admin/proposals/${id}`);

export const adminRemoveRsvpAction = ({
  sessionId,
  guestId,
}: {
  sessionId: string;
  guestId: string;
}) => send("DELETE", `/admin/sessions/${sessionId}/rsvps/${guestId}`);

export type AdminSessionInput = {
  title: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  capacity: number;
  adminManaged: boolean;
  blocker: boolean;
  closed: boolean;
  hostIds: string[];
  locationIds: string[];
};

export const adminCreateSessionAction = (
  input: AdminSessionInput & { eventId: string }
) => send("POST", "/admin/sessions", input);

export const adminUpdateSessionAction = ({
  id,
  ...body
}: AdminSessionInput & WithId) => send("PUT", `/admin/sessions/${id}`, body);

export const adminDeleteSessionAction = ({ id }: { id: string }) =>
  send("DELETE", `/admin/sessions/${id}`);

export const updateSettingsAction = (form: FormData) =>
  send("PUT", "/admin/settings", form);
