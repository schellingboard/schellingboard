import { DELETE, POST, PUT } from "@/tests/helpers/v1-route";
import type { Day } from "@schellingboard/domain/event";
import type { Guest } from "@schellingboard/domain/guest";
import type { Location } from "@schellingboard/domain/location";

/** The booking form's payload, which the tests build and these calls translate. */
export type SessionParams = {
  id?: string;
  title: string;
  description: string;
  closed: boolean;
  hosts: Guest[];
  location: Location;
  locationIds?: string[];
  dayId: Day["id"];
  startTime: string;
  duration: number;
  capacity?: number;
  proposal?: string;
  expectedVersion?: number;
};

function v1(req: Request, method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = {};
  for (const name of ["cookie", "idempotency-key"]) {
    const value = req.headers.get(name);
    if (value) headers[name] = value;
  }
  if (body !== undefined) headers["content-type"] = "application/json";
  return new Request(`http://test/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function booking(params: SessionParams) {
  return {
    dayId: params.dayId,
    title: params.title,
    description: params.description,
    closed: params.closed,
    hostIds: params.hosts.map((h) => h.id),
    startTime: params.startTime,
    durationMinutes: params.duration,
    capacity: params.capacity,
    proposalId: params.proposal,
  };
}

export async function addSession(req: Request): Promise<Response> {
  const params = (await req.json()) as SessionParams;
  return POST(
    v1(req, "POST", "/sessions", {
      ...booking(params),
      locationId: params.location.id,
    })
  );
}

export async function updateSession(req: Request): Promise<Response> {
  const params = (await req.json()) as SessionParams;
  return PUT(
    v1(req, "PUT", `/sessions/${params.id}`, {
      ...booking(params),
      locationIds: params.locationIds ?? [params.location.id],
      expectedVersion: params.expectedVersion,
    })
  );
}

export async function deleteSession(req: Request): Promise<Response> {
  const { id } = (await req.json()) as { id: string };
  return DELETE(v1(req, "DELETE", `/sessions/${id}`));
}
