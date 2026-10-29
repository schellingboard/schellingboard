// @module-tag 010-US1
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
}));

const cookieJar = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) => {
        const value = cookieJar.get(name);
        return value === undefined ? undefined : { name, value };
      },
    }),
}));

import { setupTestDb, resetTestDb } from "../helpers/db";
import { runJobs } from "../helpers/jobs";
import { siteAuthenticate } from "../helpers/site-auth";
import { createEvent, createGuest, createProposal } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import {
  GUEST_COOKIE_NAME,
  openGuestValue,
  verifiedGuestValue,
} from "../helpers/guest-cookie";
import { commentApi } from "../helpers/comment-api";
import { sendMail } from "@/utils/mailer";

import { proposalApi } from "../helpers/proposal-api";

const { updateComment, deleteComment } = commentApi(cookieJar);

const { createProposalComment: createComment } = proposalApi(cookieJar);

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

async function setup() {
  const event = await createEvent({ phase: "voting" });
  const guest = await createGuest({ eventId: event.id });
  const proposal = await createProposal(event.id, []);
  return { event, guest, proposal };
}

function act(guestId: string): void {
  cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(guestId));
}

describe("proposal comments", () => {
  beforeAll(() => setupTestDb());
  beforeEach(async () => {
    resetTestDb();
    cookieJar.clear();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    vi.mocked(sendMail).mockReset();
    await siteAuthenticate(cookieJar);
  });

  it("emails the proposal's host about a new comment", async () => {
    const event = await createEvent({ phase: "voting" });
    const host = await createGuest({
      eventId: event.id,
      email: "host@test.example",
    });
    const commenter = await createGuest({ eventId: event.id });
    const proposal = await createProposal(event.id, [host.id]);
    act(commenter.id);
    vi.stubEnv("SITE_URL", "https://site.example");

    await createComment({
      proposalId: proposal.id,
      body: "Sounds great",
    });
    await runJobs();

    await runJobs();
    expect(vi.mocked(sendMail).mock.calls.map((c) => c[0].to)).toEqual([
      "host@test.example",
    ]);
  });

  it("stores a comment and reads it back with its author and time", async () => {
    const { guest, proposal } = await setup();
    act(guest.id);
    const before = new Date();

    const result = await createComment({
      proposalId: proposal.id,
      body: "Sounds **great**",
    });

    expect(result).toEqual({ success: true });
    const comments = await getRepositories().proposalComments.list(proposal.id);
    expect(comments).toHaveLength(1);
    expect(comments[0].body).toBe("Sounds **great**");
    expect(comments[0].author).toEqual({ id: guest.id, name: guest.name });
    expect(comments[0].createdTime.getTime()).toBeGreaterThanOrEqual(
      before.getTime() - 1000
    );
  });

  it("lists comments oldest first", async () => {
    const { guest, proposal } = await setup();
    act(guest.id);

    await createComment({
      proposalId: proposal.id,
      body: "first",
    });
    await createComment({
      proposalId: proposal.id,
      body: "second",
    });

    const comments = await getRepositories().proposalComments.list(proposal.id);
    expect(comments.map((c) => c.body)).toEqual(["first", "second"]);
  });

  it("lists comments posted in the same millisecond in the order they were posted", async () => {
    const { guest, proposal } = await setup();
    const { proposalComments } = getRepositories();
    const sameMillisecond = new Date();
    const bodies = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

    for (const body of bodies) {
      await proposalComments.create({
        subjectId: proposal.id,
        authorId: guest.id,
        body,
        createdTime: sameMillisecond,
      });
    }

    // Comment ids are random, so a tiebreak on the id would shuffle these.
    expect(
      (await proposalComments.list(proposal.id)).map((c) => c.body)
    ).toEqual(bodies);
  });

  it("keeps each proposal's comments separate", async () => {
    const { event, guest, proposal } = await setup();
    const other = await createProposal(event.id, []);
    act(guest.id);

    await createComment({
      proposalId: proposal.id,
      body: "on the first",
    });

    expect(
      await getRepositories().proposalComments.list(other.id)
    ).toHaveLength(0);
  });

  it("refuses to comment without a selected name", async () => {
    const { proposal } = await setup();

    const result = await createComment({
      proposalId: proposal.id,
      body: "anonymous",
    });

    expect(result).toHaveProperty("error");
    expect(
      await getRepositories().proposalComments.list(proposal.id)
    ).toHaveLength(0);
  });

  it("tells a commenter whose guest was deleted what to do about it", async () => {
    const { guest, proposal } = await setup();
    act(guest.id);
    await getRepositories().guests.delete(guest.id);

    const result = await createComment({
      proposalId: proposal.id,
      body: "ghost",
    });

    expect("error" in result && result.error.code).toBe("guest.unselected");
    expect(
      await getRepositories().proposalComments.list(proposal.id)
    ).toHaveLength(0);
  });

  it("refuses to comment as a protected guest without a verified session", async () => {
    const { guest, proposal } = await setup();
    await getRepositories().guests.setAuthProtection(guest.id, {
      authProtected: true,
      passwordHash: null,
    });
    act(guest.id);

    const result = await createComment({
      proposalId: proposal.id,
      body: "impersonated",
    });

    expect(result).toHaveProperty("error");
    expect(
      await getRepositories().proposalComments.list(proposal.id)
    ).toHaveLength(0);
  });

  it("allows a verified protected guest to comment", async () => {
    const { guest, proposal } = await setup();
    await getRepositories().guests.setAuthProtection(guest.id, {
      authProtected: true,
      passwordHash: null,
    });
    cookieJar.set(GUEST_COOKIE_NAME, await verifiedGuestValue(guest.id));

    const result = await createComment({
      proposalId: proposal.id,
      body: "verified",
    });

    expect(result).toEqual({ success: true });
    expect(
      await getRepositories().proposalComments.list(proposal.id)
    ).toHaveLength(1);
  });

  it("rejects an empty comment", async () => {
    const { guest, proposal } = await setup();
    act(guest.id);

    const result = await createComment({
      proposalId: proposal.id,
      body: "   ",
    });

    expect(result).toHaveProperty("error");
    expect(
      await getRepositories().proposalComments.list(proposal.id)
    ).toHaveLength(0);
  });

  it("rejects a comment on an unknown proposal", async () => {
    const { guest } = await setup();
    act(guest.id);

    const result = await createComment({
      proposalId: "does-not-exist",
      body: "hello",
    });

    expect(result).toHaveProperty("error");
  });

  it("removes a proposal's comments when the proposal is deleted", async () => {
    const { event, guest, proposal } = await setup();
    act(guest.id);
    await createComment({
      proposalId: proposal.id,
      body: "doomed",
    });

    await getRepositories().sessionProposals.delete(proposal.id);

    expect(await getRepositories().proposalComments.list(proposal.id)).toEqual(
      []
    );
    expect(
      await getRepositories().sessionProposals.listByEvent(event.id)
    ).toEqual([]);
  });
});

async function onlyComment(proposalId: string) {
  const comments = await getRepositories().proposalComments.list(proposalId);
  expect(comments).toHaveLength(1);
  return comments[0];
}

describe("editing a proposal comment", () => {
  beforeAll(() => setupTestDb());
  beforeEach(async () => {
    resetTestDb();
    cookieJar.clear();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await siteAuthenticate(cookieJar);
  });

  it("replaces the body and records when it was edited", async () => {
    const { guest, proposal } = await setup();
    act(guest.id);
    await createComment({
      proposalId: proposal.id,
      body: "original",
    });
    const before = await onlyComment(proposal.id);
    expect(before.editedTime).toBeNull();

    const result = await updateComment({
      commentId: before.id,
      body: "revised",
    });

    expect(result).toEqual({ success: true });
    const after = await onlyComment(proposal.id);
    expect(after.body).toBe("revised");
    expect(after.editedTime).toBeInstanceOf(Date);
    expect(after.createdTime).toEqual(before.createdTime);
  });

  it("refuses to edit someone else's comment", async () => {
    const { event, guest, proposal } = await setup();
    const other = await createGuest({ eventId: event.id });
    act(guest.id);
    await createComment({
      proposalId: proposal.id,
      body: "mine",
    });
    const comment = await onlyComment(proposal.id);

    act(other.id);
    const result = await updateComment({
      commentId: comment.id,
      body: "hijacked",
    });

    expect(result).toHaveProperty("error");
    expect((await onlyComment(proposal.id)).body).toBe("mine");
  });

  it("rejects an empty edit", async () => {
    const { guest, proposal } = await setup();
    act(guest.id);
    await createComment({
      proposalId: proposal.id,
      body: "mine",
    });
    const comment = await onlyComment(proposal.id);

    const result = await updateComment({
      commentId: comment.id,
      body: "  ",
    });

    expect(result).toHaveProperty("error");
    expect((await onlyComment(proposal.id)).body).toBe("mine");
  });
});

describe("deleting a proposal comment", () => {
  beforeAll(() => setupTestDb());
  beforeEach(async () => {
    resetTestDb();
    cookieJar.clear();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await siteAuthenticate(cookieJar);
  });

  it("removes a childless comment outright", async () => {
    const { guest, proposal } = await setup();
    act(guest.id);
    await createComment({
      proposalId: proposal.id,
      body: "never mind",
    });
    const comment = await onlyComment(proposal.id);

    const result = await deleteComment({
      commentId: comment.id,
    });

    expect(result).toEqual({ success: true });
    expect(await getRepositories().proposalComments.list(proposal.id)).toEqual(
      []
    );
  });

  it("leaves a tombstone when the comment has replies", async () => {
    const { event, guest, proposal } = await setup();
    const other = await createGuest({ eventId: event.id });
    act(guest.id);
    await createComment({
      proposalId: proposal.id,
      body: "the question",
    });
    const parent = await onlyComment(proposal.id);
    act(other.id);
    await createComment({
      proposalId: proposal.id,
      parentId: parent.id,
      body: "the answer",
    });

    act(guest.id);
    await deleteComment({ commentId: parent.id });

    const comments = await getRepositories().proposalComments.list(proposal.id);
    expect(comments).toHaveLength(2);
    const tombstone = comments.find((c) => c.id === parent.id)!;
    expect(tombstone.deleted).toBe(true);
    expect(tombstone.body).toBe("");
    expect(tombstone.author).toBeNull();
    const reply = comments.find((c) => c.id !== parent.id)!;
    expect(reply.body).toBe("the answer");
    expect(reply.parentId).toBe(parent.id);
  });

  it("clears a tombstone once its last reply goes", async () => {
    const { guest, proposal } = await setup();
    act(guest.id);
    await createComment({
      proposalId: proposal.id,
      body: "parent",
    });
    const parent = await onlyComment(proposal.id);
    await createComment({
      proposalId: proposal.id,
      parentId: parent.id,
      body: "child",
    });
    const child = (
      await getRepositories().proposalComments.list(proposal.id)
    ).find((c) => c.id !== parent.id)!;

    await deleteComment({ commentId: parent.id });
    await deleteComment({ commentId: child.id });

    expect(await getRepositories().proposalComments.list(proposal.id)).toEqual(
      []
    );
  });

  it("refuses to delete someone else's comment", async () => {
    const { event, guest, proposal } = await setup();
    const other = await createGuest({ eventId: event.id });
    act(guest.id);
    await createComment({
      proposalId: proposal.id,
      body: "mine",
    });
    const comment = await onlyComment(proposal.id);

    act(other.id);
    const result = await deleteComment({
      commentId: comment.id,
    });

    expect(result).toHaveProperty("error");
    expect((await onlyComment(proposal.id)).body).toBe("mine");
  });

  it("refuses to edit a tombstone", async () => {
    const { guest, proposal } = await setup();
    act(guest.id);
    await createComment({
      proposalId: proposal.id,
      body: "parent",
    });
    const parent = await onlyComment(proposal.id);
    await createComment({
      proposalId: proposal.id,
      parentId: parent.id,
      body: "child",
    });
    await deleteComment({ commentId: parent.id });

    const result = await updateComment({
      commentId: parent.id,
      body: "back from the dead",
    });

    expect(result).toHaveProperty("error");
  });
});

describe("threaded proposal replies", () => {
  beforeAll(() => setupTestDb());
  beforeEach(async () => {
    resetTestDb();
    cookieJar.clear();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await siteAuthenticate(cookieJar);
  });

  it("records the parent of a reply", async () => {
    const { guest, proposal } = await setup();
    act(guest.id);
    await createComment({
      proposalId: proposal.id,
      body: "top level",
    });
    const parent = await onlyComment(proposal.id);

    await createComment({
      proposalId: proposal.id,
      parentId: parent.id,
      body: "a reply",
    });

    const comments = await getRepositories().proposalComments.list(proposal.id);
    expect(comments.map((c) => c.parentId)).toEqual([null, parent.id]);
  });

  it("rejects a reply to a comment on another proposal", async () => {
    const { event, guest, proposal } = await setup();
    const elsewhere = await createProposal(event.id, []);
    act(guest.id);
    await createComment({
      proposalId: proposal.id,
      body: "top level",
    });
    const parent = await onlyComment(proposal.id);

    const result = await createComment({
      proposalId: elsewhere.id,
      parentId: parent.id,
      body: "misfiled reply",
    });

    expect(result).toHaveProperty("error");
    expect(await getRepositories().proposalComments.list(elsewhere.id)).toEqual(
      []
    );
  });

  it("deletes a whole thread with its proposal", async () => {
    const { guest, proposal } = await setup();
    act(guest.id);
    await createComment({
      proposalId: proposal.id,
      body: "top level",
    });
    const parent = await onlyComment(proposal.id);
    await createComment({
      proposalId: proposal.id,
      parentId: parent.id,
      body: "a reply",
    });

    await getRepositories().sessionProposals.delete(proposal.id);

    expect(await getRepositories().proposalComments.list(proposal.id)).toEqual(
      []
    );
  });
});
