// @module-tag 010-US6
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
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
import { siteAuthenticate } from "../helpers/site-auth";
import { createEvent, createGuest, createProposal } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";
import { commentApi } from "../helpers/comment-api";

import { proposalApi } from "../helpers/proposal-api";

const { deleteComment, likeComment, unlikeComment } = commentApi(cookieJar);

const { createProposalComment: createComment } = proposalApi(cookieJar);

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

function act(guestId: string): void {
  cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(guestId));
}

async function setup() {
  const event = await createEvent({ phase: "voting" });
  const guest = await createGuest({ eventId: event.id });
  const proposal = await createProposal(event.id, []);
  act(guest.id);
  await createComment({
    proposalId: proposal.id,
    body: "worth liking",
  });
  const [comment] = await getRepositories().proposalComments.list(proposal.id);
  return { event, guest, proposal, comment };
}

async function likesOn(proposalId: string, commentId: string) {
  const comments = await getRepositories().proposalComments.list(proposalId);
  return comments.find((c) => c.id === commentId)!.likes;
}

describe("proposal comment likes", () => {
  beforeAll(() => setupTestDb());
  beforeEach(async () => {
    resetTestDb();
    cookieJar.clear();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await siteAuthenticate(cookieJar);
  });

  it("starts with no likes", async () => {
    const { proposal, comment } = await setup();

    expect(await likesOn(proposal.id, comment.id)).toEqual([]);
  });

  it("records who liked the comment", async () => {
    const { guest, proposal, comment } = await setup();

    const result = await likeComment({
      commentId: comment.id,
    });

    expect(result).toEqual({ success: true });
    expect(await likesOn(proposal.id, comment.id)).toEqual([
      { id: guest.id, name: guest.name, avatarUrl: null },
    ]);
  });

  it("carries each liker's avatar, so it can be shown next to their name", async () => {
    const { guest, proposal, comment } = await setup();
    await getRepositories().guests.updateProfile(
      guest.id,
      {
        name: guest.name,
        aboutMe: null,
        avatarUrl: "/uploads/avatar.webp",
        pronouns: null,
        basedIn: null,
        prompts: null,
        languages: null,
        contacts: null,
      },
      new Date()
    );

    await likeComment({ commentId: comment.id });

    expect(await likesOn(proposal.id, comment.id)).toEqual([
      { id: guest.id, name: guest.name, avatarUrl: "/uploads/avatar.webp" },
    ]);
  });

  it("takes the like back when unliked", async () => {
    const { proposal, comment } = await setup();
    await likeComment({ commentId: comment.id });

    const result = await unlikeComment({ commentId: comment.id });

    expect(result).toEqual({ success: true });
    expect(await likesOn(proposal.id, comment.id)).toEqual([]);
  });

  it("keeps every guest's like, oldest first", async () => {
    const { event, guest, proposal, comment } = await setup();
    const other = await createGuest({ eventId: event.id });

    await likeComment({ commentId: comment.id });
    act(other.id);
    await likeComment({ commentId: comment.id });

    expect(await likesOn(proposal.id, comment.id)).toEqual([
      { id: guest.id, name: guest.name, avatarUrl: null },
      { id: other.id, name: other.name, avatarUrl: null },
    ]);
  });

  it("keeps the pressing order for likes that land in the same millisecond", async () => {
    const { event, proposal, comment } = await setup();
    const guests = [
      await createGuest({ eventId: event.id }),
      await createGuest({ eventId: event.id }),
    ];
    // Press in descending id order, so a tiebreak on the (random) guest id
    // would hand back the reverse of the order they were pressed in.
    const likers = guests.sort((a, b) => (a.id < b.id ? 1 : -1));
    const sameMillisecond = new Date();

    for (const liker of likers) {
      await getRepositories().comments.setLike({
        commentId: comment.id,
        guestId: liker.id,
        liked: true,
        createdTime: sameMillisecond,
      });
    }

    expect(await likesOn(proposal.id, comment.id)).toEqual(
      likers.map((liker) => ({
        id: liker.id,
        name: liker.name,
        avatarUrl: null,
      }))
    );
  });

  it("refuses to like without a selected name", async () => {
    const { proposal, comment } = await setup();
    // Drop only the name, not site auth: this is about the identity gate.
    cookieJar.delete(GUEST_COOKIE_NAME);

    const result = await likeComment({
      commentId: comment.id,
    });

    expect(result).toHaveProperty("error");
    expect(await likesOn(proposal.id, comment.id)).toEqual([]);
  });

  it("refuses to like as a protected guest without a verified session", async () => {
    const { guest, proposal, comment } = await setup();
    await getRepositories().guests.setAuthProtection(guest.id, {
      authProtected: true,
      passwordHash: null,
    });

    const result = await likeComment({
      commentId: comment.id,
    });

    expect(result).toHaveProperty("error");
    expect(await likesOn(proposal.id, comment.id)).toEqual([]);
  });

  it("refuses to like a comment that does not exist", async () => {
    await setup();

    const result = await likeComment({
      commentId: "does-not-exist",
    });

    expect(result).toHaveProperty("error");
  });

  it("refuses to like a deleted comment kept as a tombstone", async () => {
    const { event, guest, proposal, comment } = await setup();
    const other = await createGuest({ eventId: event.id });
    act(other.id);
    await createComment({
      proposalId: proposal.id,
      parentId: comment.id,
      body: "a surviving reply",
    });
    act(guest.id);
    await deleteComment({ commentId: comment.id });

    const result = await likeComment({
      commentId: comment.id,
    });

    expect(result).toHaveProperty("error");
  });

  it("discards the likes of a comment deleted into a tombstone", async () => {
    const { event, guest, proposal, comment } = await setup();
    const other = await createGuest({ eventId: event.id });
    act(other.id);
    await createComment({
      proposalId: proposal.id,
      parentId: comment.id,
      body: "a surviving reply",
    });
    await likeComment({ commentId: comment.id });
    expect(await likesOn(proposal.id, comment.id)).toHaveLength(1);

    act(guest.id);
    await deleteComment({ commentId: comment.id });

    expect(await likesOn(proposal.id, comment.id)).toEqual([]);
  });

  it("discards the likes of a comment removed outright", async () => {
    const { proposal, comment } = await setup();
    await likeComment({ commentId: comment.id });

    await deleteComment({ commentId: comment.id });

    expect(await getRepositories().proposalComments.list(proposal.id)).toEqual(
      []
    );
  });
});
