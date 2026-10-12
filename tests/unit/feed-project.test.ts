// @module-tag 007-US8
import { describe, it, expect } from "vitest";
import {
  changes,
  reaches,
  type Actor,
  type Audience,
  type RecordedChange,
  type Viewer,
} from "@schellingboard/domain/change";
import type { Session } from "@schellingboard/domain/session";
import { project } from "@/server/feed/project";

const session: Session = {
  id: "s",
  eventId: "e",
  title: "Talk",
  description: "",
  capacity: 10,
  adminManaged: false,
  blocker: false,
  closed: false,
  hosts: [],
  locations: [],
  numRsvps: 0,
  version: 1,
};

function recorded(actor: Actor): RecordedChange {
  const change = changes.sessionChanged(session, session, {
    actor,
    at: new Date(0),
  });
  return {
    ...change,
    seq: 1,
    id: "c",
    audience: { kind: "event" },
    commandKey: "k",
  };
}

const guest = (guestId: string): Viewer => ({ guestId, admin: false });
const admin: Viewer = { guestId: null, admin: true };
const anonymous: Viewer = { guestId: null, admin: false };

describe("project", () => {
  it("sends a guest's command key to that guest only", () => {
    const change = recorded({ type: "guest", id: "mia" });

    expect(project(change, guest("mia"))?.commandKey).toBe("k");
    expect(project(change, guest("ben"))?.commandKey).toBeNull();
    expect(project(change, admin)?.commandKey).toBeNull();
    expect(project(change, anonymous)?.commandKey).toBeNull();
  });

  it("sends an admin's command key to admins only", () => {
    const change = recorded({ type: "admin" });

    expect(project(change, admin)?.commandKey).toBe("k");
    expect(project(change, guest("mia"))?.commandKey).toBeNull();
  });

  it("sends the system's command key to no one", () => {
    const change = recorded({ type: "system" });

    expect(project(change, admin)?.commandKey).toBeNull();
    expect(project(change, guest("mia"))?.commandKey).toBeNull();
  });
});

describe("reaches", () => {
  const viewers = [guest("mia"), guest("ben"), admin, anonymous];
  const reached = (audience: Audience | null) =>
    viewers.map((viewer) => reaches(audience, viewer));

  it("reaches everyone for the event", () => {
    expect(reached({ kind: "event" })).toEqual([true, true, true, true]);
  });

  it("reaches only the named guests", () => {
    expect(reached({ kind: "guests", ids: ["mia"] })).toEqual([
      true,
      false,
      false,
      false,
    ]);
  });

  it("reaches only admins", () => {
    expect(reached({ kind: "admins" })).toEqual([false, false, true, false]);
  });

  it("reaches no one for a change logged without an audience", () => {
    expect(reached(null)).toEqual([false, false, false, false]);
  });
});
