import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createEvent,
  createGuest,
  createProposal,
  createSession,
} from "../helpers/factories";
import { getRepositories } from "@/db/container";
import {
  createCommentUseCases,
  type CommentSubject,
} from "@/server/modules/comments/module";
import type { Actor } from "@/server/kernel/actor";

const NOBODY: Actor = { admin: false, guest: null };
const ADMIN: Actor = { admin: true, guest: null };
const open = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "open" },
});
const verified = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "verified" },
});
const now = () => new Date();

const notifyCommented = vi.fn();
const comments = () =>
  createCommentUseCases({ repos: getRepositories(), notifyCommented });

async function protect(guestId: string) {
  await getRepositories().guests.setAuthProtection(guestId, {
    authProtected: true,
    passwordHash: null,
  });
}

async function subjects() {
  const event = await createEvent({ phase: "scheduling" });
  const guest = await createGuest({ eventId: event.id });
  const proposal = await createProposal(event.id, []);
  const session = await createSession(event.id);
  return {
    guest,
    proposal: { kind: "proposal", id: proposal.id } as CommentSubject,
    session: { kind: "session", id: session.id } as CommentSubject,
    profile: { kind: "profile", id: guest.id } as CommentSubject,
  };
}

async function posted(authorId: string, subject: CommentSubject) {
  const result = await comments().createComment(
    open(authorId),
    { subject, body: "Hello" },
    now()
  );
  if (!result.ok) throw new Error(result.error.code);
  return result.value;
}

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  notifyCommented.mockReset();
});

describe("listing comments", () => {
  it(
    "lists the comments on a proposal, a session and a profile, each its own",
    { tags: ["010-US1", "010-US2", "010-US3"] },
    async () => {
      const { guest, proposal, session, profile } = await subjects();
      for (const subject of [proposal, session, profile])
        await comments().createComment(
          open(guest.id),
          { subject, body: `On the ${subject.kind}` },
          now()
        );

      for (const subject of [proposal, session, profile]) {
        const listed = await comments().listComments(NOBODY, subject);
        expect(listed.ok && listed.value.map((c) => c.body)).toEqual([
          `On the ${subject.kind}`,
        ]);
      }
    }
  );

  it(
    "answers not found for a subject that does not exist",
    { tags: ["010-US1", "010-US2", "010-US3"] },
    async () => {
      for (const [kind, code] of [
        ["proposal", "proposal.notFound"],
        ["session", "session.notFound"],
        ["profile", "profile.notFound"],
      ] as const) {
        const listed = await comments().listComments(NOBODY, {
          kind,
          id: "nope",
        });
        expect(!listed.ok && listed.error).toMatchObject({
          kind: "notFound",
          code,
        });
      }
    }
  );
});

describe("posting a comment", () => {
  it(
    "posts as the acting guest and notifies about it",
    { tags: ["010-US1"] },
    async () => {
      const { guest, proposal } = await subjects();
      const at = now();

      const result = await comments().createComment(
        open(guest.id),
        { subject: proposal, body: "Count me in" },
        at
      );

      expect(result.ok && result.value).toMatchObject({
        body: "Count me in",
        author: { id: guest.id },
        createdTime: at,
      });
      expect(notifyCommented).toHaveBeenCalledWith({
        subject: proposal,
        comment: result.ok && result.value,
        now: at,
      });
    }
  );

  it(
    "refuses without a selected name, and as a protected guest without its verified cookie (#370)",
    { tags: ["010-US1"] },
    async () => {
      const { guest, proposal } = await subjects();
      await protect(guest.id);

      for (const [actor, code] of [
        [NOBODY, "guest.unselected"],
        [ADMIN, "guest.unselected"],
        [open(guest.id), "guest.protected"],
      ] as const) {
        const result = await comments().createComment(
          actor,
          { subject: proposal, body: "Hi" },
          now()
        );
        expect(!result.ok && result.error.code).toBe(code);
      }
      const allowed = await comments().createComment(
        verified(guest.id),
        { subject: proposal, body: "Hi" },
        now()
      );
      expect(allowed.ok).toBe(true);
      expect(notifyCommented).toHaveBeenCalledTimes(1);
    }
  );

  it(
    "refuses a comment on a subject that does not exist",
    { tags: ["010-US3"] },
    async () => {
      const guest = await createGuest();

      const result = await comments().createComment(
        open(guest.id),
        { subject: { kind: "profile", id: "nope" }, body: "Hi" },
        now()
      );

      expect(!result.ok && result.error).toEqual({
        kind: "notFound",
        code: "profile.notFound",
        detail: "Profile not found",
      });
    }
  );

  it(
    "accepts a reply only to a comment on the same subject",
    { tags: ["010-US5"] },
    async () => {
      const { guest, proposal, session } = await subjects();
      const parent = await posted(guest.id, proposal);

      const reply = await comments().createComment(
        open(guest.id),
        { subject: proposal, parentId: parent.id, body: "Agreed" },
        now()
      );
      const astray = await comments().createComment(
        open(guest.id),
        { subject: session, parentId: parent.id, body: "Agreed" },
        now()
      );

      expect(reply.ok && reply.value.parentId).toBe(parent.id);
      expect(!astray.ok && astray.error).toEqual({
        kind: "invalid",
        code: "comment.parentInvalid",
        detail: "The comment being replied to is invalid",
      });
    }
  );
});

describe("editing and deleting a comment", () => {
  it(
    "lets the author edit their comment and records when",
    { tags: ["010-US4"] },
    async () => {
      const { guest, session } = await subjects();
      const comment = await posted(guest.id, session);
      const at = now();

      const result = await comments().editComment(
        open(guest.id),
        { commentId: comment.id, body: "Edited" },
        at
      );

      expect(result.ok && result.value).toMatchObject({
        id: comment.id,
        body: "Edited",
        editedTime: at,
      });
    }
  );

  it(
    "refuses anyone but the author, an organizer included",
    { tags: ["010-US4"] },
    async () => {
      const { guest, session } = await subjects();
      const other = await createGuest();
      const comment = await posted(guest.id, session);

      const edit = await comments().editComment(
        open(other.id),
        { commentId: comment.id, body: "Mine now" },
        now()
      );
      const remove = await comments().deleteComment(open(other.id), {
        commentId: comment.id,
      });
      const adminRemove = await comments().deleteComment(ADMIN, {
        commentId: comment.id,
      });

      expect(!edit.ok && edit.error).toEqual({
        kind: "forbidden",
        code: "comment.notAuthor",
        detail: "Comment owned by another guest",
      });
      expect(!remove.ok && remove.error.code).toBe("comment.notAuthor");
      expect(!adminRemove.ok && adminRemove.error.code).toBe(
        "guest.unselected"
      );
      const listed = await comments().listComments(NOBODY, session);
      expect(listed.ok && listed.value.map((c) => c.body)).toEqual(["Hello"]);
    }
  );

  it(
    "deletes the author's comment, keeping a tombstone nobody can edit while it has replies",
    { tags: ["010-US4"] },
    async () => {
      const { guest, profile } = await subjects();
      const comment = await posted(guest.id, profile);
      await comments().createComment(
        open(guest.id),
        { subject: profile, parentId: comment.id, body: "Reply" },
        now()
      );

      const removed = await comments().deleteComment(open(guest.id), {
        commentId: comment.id,
      });
      const edit = await comments().editComment(
        open(guest.id),
        { commentId: comment.id, body: "Back" },
        now()
      );

      expect(removed.ok).toBe(true);
      expect(!edit.ok && edit.error).toEqual({
        kind: "notFound",
        code: "comment.notFound",
        detail: "Comment not found",
      });
      const listed = await comments().listComments(NOBODY, profile);
      expect(listed.ok && listed.value[0]).toMatchObject({
        deleted: true,
        body: "",
        author: null,
      });
    }
  );
});

describe("liking a comment", () => {
  it("toggles the acting guest's like", { tags: ["010-US6"] }, async () => {
    const { guest, proposal } = await subjects();
    const comment = await posted(guest.id, proposal);

    const first = await comments().toggleCommentLike(
      open(guest.id),
      { commentId: comment.id },
      now()
    );
    const second = await comments().toggleCommentLike(
      open(guest.id),
      { commentId: comment.id },
      now()
    );

    expect(first).toEqual({ ok: true, value: true });
    expect(second).toEqual({ ok: true, value: false });
  });

  it(
    "sets a like idempotently and takes it back",
    { tags: ["010-US6"] },
    async () => {
      const { guest, proposal } = await subjects();
      const comment = await posted(guest.id, proposal);
      const likers = async () => {
        const listed = await comments().listComments(NOBODY, proposal);
        return listed.ok && listed.value[0].likes.map((l) => l.id);
      };

      for (let i = 0; i < 2; i++)
        expect(
          (
            await comments().setCommentLike(
              open(guest.id),
              { commentId: comment.id, liked: true },
              now()
            )
          ).ok
        ).toBe(true);
      expect(await likers()).toEqual([guest.id]);

      await comments().setCommentLike(
        open(guest.id),
        { commentId: comment.id, liked: false },
        now()
      );
      expect(await likers()).toEqual([]);
    }
  );

  it(
    "refuses a like on a deleted comment, and as a protected guest without its verified cookie",
    { tags: ["010-US6"] },
    async () => {
      const { guest, proposal } = await subjects();
      const liker = await createGuest();
      await protect(liker.id);
      const comment = await posted(guest.id, proposal);

      const unverified = await comments().setCommentLike(
        open(liker.id),
        { commentId: comment.id, liked: true },
        now()
      );
      await comments().deleteComment(open(guest.id), {
        commentId: comment.id,
      });
      const gone = await comments().toggleCommentLike(
        open(guest.id),
        { commentId: comment.id },
        now()
      );

      expect(!unverified.ok && unverified.error.code).toBe("guest.protected");
      expect(!gone.ok && gone.error.code).toBe("comment.notFound");
    }
  );
});
