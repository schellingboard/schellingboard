// @module-tag 006-US1
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
}));

import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createEvent,
  createGuest,
  createLocation,
  createDay,
  slotStart,
  createProposal as createProposalFixture,
  createSession,
} from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { VoteChoice } from "@schellingboard/domain/vote";
import { addSession, type SessionParams } from "../helpers/session-form";
import { DELETE as deleteV1, PUT as putV1 } from "@/tests/helpers/v1-route";
import { apiRequest, proposalApi } from "../helpers/proposal-api";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";

const cookieJar = new Map<string, string>();
const { createProposal } = proposalApi(cookieJar);

// Server-side phase gating mirrors the UI: voting only during the voting
// phase, session creation only during the scheduling phase, and proposal
// creation during the proposal *and* voting phases (the UI's "Add Proposal"
// button is disabled only once scheduling starts).

// `actingGuestId` selects a name, which creating requires: these tests are
// about the phase gate, so they must get past the identity gate first.
function makeReq(
  url: string,
  payload: unknown,
  actingGuestId?: string
): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: actingGuestId
      ? { cookie: `${GUEST_COOKIE_NAME}=${openGuestValue(actingGuestId)}` }
      : undefined,
  });
}

async function voteOnProposalIn(phase: "proposal" | "voting" | "scheduling") {
  const event = await createEvent({ phase });
  const guest = await createGuest({ eventId: event.id });
  const proposal = await createProposalFixture(event.id, []);

  const res = await putV1(
    apiRequest("PUT", `/proposals/${proposal.id}/votes/${guest.id}`, {
      body: { choice: VoteChoice.interested },
    })
  );
  const votes = await getRepositories().votes.listByGuestAndEvent(
    guest.id,
    event.id
  );
  return { res, votes };
}

async function addSessionIn(phase: "proposal" | "voting" | "scheduling") {
  const event = await createEvent({ phase });
  const guest = await createGuest({ eventId: event.id });
  const location = await createLocation({ eventId: event.id });
  const day = await createDay(event.id);

  const payload: SessionParams = {
    title: "Premature Session",
    description: "",
    closed: false,
    hosts: [guest],
    location,
    dayId: day.id,
    startTime: slotStart(day, 60),
    duration: 60,
  };
  const res = await addSession(
    makeReq("http://test/session-form", payload, guest.id)
  );
  const sessions = await getRepositories().sessions.listByEvent(event.id);
  return { res, sessions };
}

async function proposeIn(phase: "proposal" | "voting" | "scheduling") {
  const event = await createEvent({ phase });
  const guest = await createGuest({ eventId: event.id });
  cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(guest.id));
  const fd = {
    eventId: event.id,
    title: "Late Proposal",
  };
  const result = await createProposal(fd);
  const proposals = await getRepositories().sessionProposals.listByEvent(
    event.id
  );
  return { result, proposals };
}

async function toggleRsvpIn(
  phase: "proposal" | "voting",
  opts?: { remove?: boolean }
) {
  const event = await createEvent({ phase });
  const guest = await createGuest({ eventId: event.id });
  const session = await createSession(event.id);
  const repos = getRepositories();
  if (opts?.remove) {
    await repos.rsvps.create({ sessionId: session.id, guestId: guest.id });
  }
  const res = await (opts?.remove ? deleteV1 : putV1)(
    apiRequest(
      opts?.remove ? "DELETE" : "PUT",
      `/sessions/${session.id}/rsvps/${guest.id}`
    )
  );
  const rsvps = await repos.rsvps.listBySession(session.id);
  return { res, rsvps };
}

describe("server-side phase gating", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    cookieJar.clear();
  });

  it("rejects voting during the proposal phase", async () => {
    const { res, votes } = await voteOnProposalIn("proposal");
    expect(res.ok).toBe(false);
    expect(votes).toHaveLength(0);
  });

  it("rejects voting during the scheduling phase", async () => {
    const { res, votes } = await voteOnProposalIn("scheduling");
    expect(res.ok).toBe(false);
    expect(votes).toHaveLength(0);
  });

  it("rejects session creation during the proposal phase", async () => {
    const { res, sessions } = await addSessionIn("proposal");
    expect(res.ok).toBe(false);
    expect(sessions).toHaveLength(0);
  });

  it("rejects session creation during the voting phase", async () => {
    const { res, sessions } = await addSessionIn("voting");
    expect(res.ok).toBe(false);
    expect(sessions).toHaveLength(0);
  });

  it("rejects RSVP creation during the proposal phase", async () => {
    const { res, rsvps } = await toggleRsvpIn("proposal");
    expect(res.status).toBe(403);
    expect(rsvps).toHaveLength(0);
  });

  it("rejects RSVP creation during the voting phase", async () => {
    const { res, rsvps } = await toggleRsvpIn("voting");
    expect(res.status).toBe(403);
    expect(rsvps).toHaveLength(0);
  });

  it("rejects RSVP removal outside the scheduling phase", async () => {
    const { res, rsvps } = await toggleRsvpIn("voting", { remove: true });
    expect(res.status).toBe(403);
    expect(rsvps).toHaveLength(1);
  });

  // The UI allows adding proposals during the voting phase (only scheduling
  // disables it), so the server accepts them too.
  it("allows proposal creation during the voting phase", async () => {
    const { result, proposals } = await proposeIn("voting");
    expect(result).toHaveProperty("success");
    expect(proposals).toHaveLength(1);
  });

  it("rejects proposal creation during the scheduling phase", async () => {
    const { result, proposals } = await proposeIn("scheduling");
    expect(result).toHaveProperty("error");
    expect(proposals).toHaveLength(0);
  });
  it("allows voting during the voting phase", async () => {
    const { res, votes } = await voteOnProposalIn("voting");
    expect(res.ok).toBe(true);
    expect(votes).toHaveLength(1);
  });

  it("allows session creation during the scheduling phase", async () => {
    const { res, sessions } = await addSessionIn("scheduling");
    expect(res.ok).toBe(true);
    expect(sessions).toHaveLength(1);
  });

  it("allows proposal creation during the proposal phase", async () => {
    const { result, proposals } = await proposeIn("proposal");
    expect(result).toEqual({ success: true });
    expect(proposals).toHaveLength(1);
  });
});
