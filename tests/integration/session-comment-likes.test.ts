// @module-tag 010-US6
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { resetTestDb, setupTestDb } from "../helpers/db";
import { siteAuthenticate } from "../helpers/site-auth";
import { createEvent, createGuest, createSession } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";
import { commentApi } from "../helpers/comment-api";

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

const {
  createSessionComment: createComment,
  deleteComment,
  likeComment,
  unlikeComment,
} = commentApi(cookieJar);

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

function act(guestId: string): void {
  cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(guestId));
}

async function setup() {
  const event = await createEvent({ phase: "scheduling" });
  const guest = await createGuest({ eventId: event.id });
  const session = await createSession(event.id);
  act(guest.id);
  await createComment({
    sessionId: session.id,
    body: "worth liking",
  });
  const [comment] = await getRepositories().sessionComments.list(session.id);
  return { event, guest, session, comment };
}

async function likesOn(sessionId: string, commentId: string) {
  const comments = await getRepositories().sessionComments.list(sessionId);
  return comments.find((c) => c.id === commentId)!.likes;
}

describe("session comment likes", () => {
  beforeAll(() => setupTestDb());
  beforeEach(async () => {
    resetTestDb();
    cookieJar.clear();
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    await siteAuthenticate(cookieJar);
  });

  it("starts with no likes", async () => {
    const { session, comment } = await setup();

    expect(await likesOn(session.id, comment.id)).toEqual([]);
  });

  it("records who liked the comment", async () => {
    const { guest, session, comment } = await setup();

    const result = await likeComment({
      commentId: comment.id,
    });

    expect(result).toEqual({ success: true });
    expect(await likesOn(session.id, comment.id)).toEqual([
      { id: guest.id, name: guest.name, avatarUrl: null },
    ]);
  });

  it("carries each liker's avatar, so it can be shown next to their name", async () => {
    const { guest, session, comment } = await setup();
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

    expect(await likesOn(session.id, comment.id)).toEqual([
      { id: guest.id, name: guest.name, avatarUrl: "/uploads/avatar.webp" },
    ]);
  });

  it("takes the like back when unliked", async () => {
    const { session, comment } = await setup();
    await likeComment({ commentId: comment.id });

    const result = await unlikeComment({ commentId: comment.id });

    expect(result).toEqual({ success: true });
    expect(await likesOn(session.id, comment.id)).toEqual([]);
  });

  it("keeps every guest's like, oldest first", async () => {
    const { event, guest, session, comment } = await setup();
    const other = await createGuest({ eventId: event.id });

    await likeComment({ commentId: comment.id });
    act(other.id);
    await likeComment({ commentId: comment.id });

    expect(await likesOn(session.id, comment.id)).toEqual([
      { id: guest.id, name: guest.name, avatarUrl: null },
      { id: other.id, name: other.name, avatarUrl: null },
    ]);
  });

  it("keeps the pressing order for likes that land in the same millisecond", async () => {
    const { session, comment } = await setup();
    const guests = [
      await createGuest({ eventId: session.eventId }),
      await createGuest({ eventId: session.eventId }),
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

    expect(await likesOn(session.id, comment.id)).toEqual(
      likers.map((liker) => ({
        id: liker.id,
        name: liker.name,
        avatarUrl: null,
      }))
    );
  });

  it("refuses to like without a selected name", async () => {
    const { session, comment } = await setup();
    cookieJar.delete(GUEST_COOKIE_NAME);

    const result = await likeComment({
      commentId: comment.id,
    });

    expect(result).toHaveProperty("error");
    expect(await likesOn(session.id, comment.id)).toEqual([]);
  });

  it("refuses to like as a protected guest without a verified session", async () => {
    const { guest, session, comment } = await setup();
    await getRepositories().guests.setAuthProtection(guest.id, {
      authProtected: true,
      passwordHash: null,
    });

    const result = await likeComment({
      commentId: comment.id,
    });

    expect(result).toHaveProperty("error");
    expect(await likesOn(session.id, comment.id)).toEqual([]);
  });

  it("refuses to like a comment that does not exist", async () => {
    await setup();

    const result = await likeComment({
      commentId: "does-not-exist",
    });

    expect(result).toHaveProperty("error");
  });

  it("refuses to like a deleted comment kept as a tombstone", async () => {
    const { event, guest, session, comment } = await setup();
    const other = await createGuest({ eventId: event.id });
    act(other.id);
    await createComment({
      sessionId: session.id,
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
    const { event, guest, session, comment } = await setup();
    const other = await createGuest({ eventId: event.id });
    act(other.id);
    await createComment({
      sessionId: session.id,
      parentId: comment.id,
      body: "a surviving reply",
    });
    await likeComment({ commentId: comment.id });
    expect(await likesOn(session.id, comment.id)).toHaveLength(1);

    act(guest.id);
    await deleteComment({ commentId: comment.id });

    expect(await likesOn(session.id, comment.id)).toEqual([]);
  });

  it("discards the likes of a comment removed outright", async () => {
    const { session, comment } = await setup();
    await likeComment({ commentId: comment.id });

    await deleteComment({ commentId: comment.id });

    expect(await getRepositories().sessionComments.list(session.id)).toEqual(
      []
    );
  });
});
