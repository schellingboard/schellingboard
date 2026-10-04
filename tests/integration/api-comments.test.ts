import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

vi.mock("@/utils/mailer", () => ({ sendMail: vi.fn() }));

const { afterTasks } = vi.hoisted(() => ({
  afterTasks: [] as Promise<unknown>[],
}));

vi.mock("next/server", async (original) => ({
  ...(await original<typeof import("next/server")>()),
  after: (task: () => unknown) => {
    afterTasks.push(Promise.resolve(task()));
  },
}));

import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "@/app/api/v1/[[...route]]/route";
import { getRepositories } from "@/db/container";
import { sendMail } from "@/utils/mailer";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { runJobs } from "../helpers/jobs";
import {
  createEvent,
  createGuest,
  createProposal,
  createSession,
} from "../helpers/factories";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";

function request(
  method: string,
  path: string,
  { body, cookie }: { body?: unknown; cookie?: string } = {}
) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  return new NextRequest(`http://test/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const asGuest = (id: string) => `${GUEST_COOKIE_NAME}=${openGuestValue(id)}`;

type CommentBody = {
  id: string;
  parentId: string | null;
  body: string;
  deleted: boolean;
  editedTime: string | null;
  author: { id: string; name: string } | null;
  likes: { id: string; name: string }[];
};

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  afterTasks.length = 0;
  vi.mocked(sendMail).mockReset();
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
  vi.stubEnv("SITE_URL", "https://site.example");
});
afterEach(() => vi.unstubAllEnvs());

describe("/api/v1 comments", () => {
  it(
    "posts, reads, edits, likes and deletes a comment on a proposal",
    { tags: ["010-US1", "010-US4", "010-US6"] },
    async () => {
      const event = await createEvent({ phase: "voting" });
      const host = await createGuest({
        eventId: event.id,
        email: "host@example.com",
      });
      const guest = await createGuest({ eventId: event.id });
      const proposal = await createProposal(event.id, [host.id]);

      const created = await POST(
        request("POST", `/proposals/${proposal.id}/comments`, {
          cookie: asGuest(guest.id),
          body: { body: "  Count me in  " },
        })
      );
      expect(created.status).toBe(201);
      const comment = (await created.json()) as CommentBody;
      expect(comment).toMatchObject({
        body: "Count me in",
        parentId: null,
        author: { id: guest.id },
        likes: [],
      });
      await Promise.all(afterTasks);
      await runJobs();
      expect(vi.mocked(sendMail).mock.calls.map((c) => c[0].to)).toEqual([
        "host@example.com",
      ]);

      const edited = await PUT(
        request("PUT", `/comments/${comment.id}`, {
          cookie: asGuest(guest.id),
          body: { body: "Count me out" },
        })
      );
      expect(edited.status).toBe(200);
      const { body, editedTime } = (await edited.json()) as CommentBody;
      expect(body).toBe("Count me out");
      expect(editedTime).not.toBeNull();

      const liked = await PUT(
        request("PUT", `/comments/${comment.id}/like`, {
          cookie: asGuest(host.id),
        })
      );
      expect(liked.status).toBe(204);

      const listed = await GET(
        request("GET", `/proposals/${proposal.id}/comments`)
      );
      expect(listed.status).toBe(200);
      const { comments } = (await listed.json()) as {
        comments: CommentBody[];
      };
      expect(comments).toEqual([
        expect.objectContaining({
          id: comment.id,
          body: "Count me out",
          likes: [{ id: host.id, name: host.name, avatarUrl: null }],
        }),
      ]);

      const unliked = await DELETE(
        request("DELETE", `/comments/${comment.id}/like`, {
          cookie: asGuest(host.id),
        })
      );
      expect(unliked.status).toBe(204);

      const removed = await DELETE(
        request("DELETE", `/comments/${comment.id}`, {
          cookie: asGuest(guest.id),
        })
      );
      expect(removed.status).toBe(204);
      expect(
        await getRepositories().proposalComments.list(proposal.id)
      ).toEqual([]);
    }
  );

  it(
    "serves a session's and a profile's threads, replies included",
    { tags: ["010-US2", "010-US3", "010-US5"] },
    async () => {
      const event = await createEvent({ phase: "scheduling" });
      const guest = await createGuest({ eventId: event.id });
      const session = await createSession(event.id);

      for (const path of [
        `/sessions/${session.id}/comments`,
        `/guests/${guest.id}/comments`,
      ]) {
        const parent = (await (
          await POST(
            request("POST", path, {
              cookie: asGuest(guest.id),
              body: { body: "First" },
            })
          )
        ).json()) as CommentBody;
        const reply = await POST(
          request("POST", path, {
            cookie: asGuest(guest.id),
            body: { body: "Second", parentId: parent.id },
          })
        );
        expect(reply.status).toBe(201);

        const listed = (await (await GET(request("GET", path))).json()) as {
          comments: CommentBody[];
        };
        expect(
          listed.comments.map(({ body, parentId }) => ({ body, parentId }))
        ).toEqual([
          { body: "First", parentId: null },
          { body: "Second", parentId: parent.id },
        ]);
      }
    }
  );

  it(
    "answers problems with stable codes",
    { tags: ["010-US3", "010-US4"] },
    async () => {
      const event = await createEvent({ phase: "voting" });
      const author = await createGuest({ eventId: event.id });
      const other = await createGuest({ eventId: event.id });
      const proposal = await createProposal(event.id, []);
      const comment = await getRepositories().proposalComments.create({
        subjectId: proposal.id,
        authorId: author.id,
        body: "Mine",
        createdTime: new Date(),
      });

      const cases = [
        [GET(request("GET", "/guests/nope/comments")), 404, "profile.notFound"],
        [
          POST(
            request("POST", `/proposals/${proposal.id}/comments`, {
              body: { body: "Hi" },
            })
          ),
          403,
          "guest.unselected",
        ],
        [
          POST(
            request("POST", `/proposals/${proposal.id}/comments`, {
              cookie: asGuest(author.id),
              body: { body: "   " },
            })
          ),
          400,
          "request.invalid",
        ],
        [
          PUT(
            request("PUT", `/comments/${comment.id}`, {
              cookie: asGuest(other.id),
              body: { body: "Mine now" },
            })
          ),
          403,
          "comment.notAuthor",
        ],
        [
          DELETE(
            request("DELETE", "/comments/nope", { cookie: asGuest(other.id) })
          ),
          404,
          "comment.notFound",
        ],
      ] as const;

      for (const [pending, status, code] of cases) {
        const res = await pending;
        expect(res.status).toBe(status);
        expect(res.headers.get("content-type")).toBe(
          "application/problem+json"
        );
        expect(await res.json()).toMatchObject({ code });
      }
    }
  );
});
