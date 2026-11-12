import {
  beforeAll,
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { DELETE, GET, POST, PUT } from "@/tests/helpers/v1-route";
import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createEvent,
  createGuest,
  createProposal,
  createSession,
} from "../helpers/factories";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";

vi.mock("@/utils/mailer", () => ({ sendMail: vi.fn() }));

function request(
  method: string,
  path: string,
  { body, cookie }: { body?: unknown; cookie?: string } = {}
) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  return new Request(`http://test/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const asGuest = (id: string) => `${GUEST_COOKIE_NAME}=${openGuestValue(id)}`;

type Mine = {
  id: string;
  kind: string;
  subjectTitle: string;
  subjectId: string;
  event: { name: string; slug: string } | null;
  body: string;
  replyCount: number;
  likeCount: number;
};

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
  vi.stubEnv("SITE_URL", "https://site.example");
});
afterEach(() => vi.unstubAllEnvs());

async function comment(guestId: string, path: string, body: object) {
  const res = await POST(
    request("POST", path, { cookie: asGuest(guestId), body })
  );
  expect(res.status).toBe(201);
  return (await res.json()) as { id: string };
}

const mine = async (guestId: string) => {
  const res = await GET(
    request("GET", "/me/comments", { cookie: asGuest(guestId) })
  );
  expect(res.status).toBe(200);
  return ((await res.json()) as { items: Mine[] }).items;
};

describe("GET /api/v1/me/comments", () => {
  it(
    "lists only the caller's live comments on proposals, sessions and profiles, newest first",
    { tags: ["010-US9"] },
    async () => {
      const event = await createEvent({ name: "Alpha Conf" });
      const me = await createGuest({ eventId: event.id, name: "Me" });
      const other = await createGuest({ eventId: event.id, name: "Other" });
      const proposal = await createProposal(event.id, [other.id], {
        title: "A proposal",
      });
      const session = await createSession(event.id, {
        title: "A session",
        hostIds: [other.id],
      });

      const first = await comment(me.id, `/proposals/${proposal.id}/comments`, {
        body: "On the proposal",
      });
      await comment(other.id, `/proposals/${proposal.id}/comments`, {
        body: "Someone else's",
        parentId: first.id,
      });
      await PUT(
        request("PUT", `/comments/${first.id}/like`, {
          cookie: asGuest(other.id),
        })
      );
      await comment(me.id, `/sessions/${session.id}/comments`, {
        body: "On the session",
      });
      const gone = await comment(me.id, `/guests/${other.id}/comments`, {
        body: "Deleted soon",
      });
      await DELETE(
        request("DELETE", `/comments/${gone.id}`, { cookie: asGuest(me.id) })
      );
      await comment(me.id, `/guests/${other.id}/comments`, {
        body: "On a profile",
      });

      const items = await mine(me.id);
      expect(items.map((i) => [i.kind, i.subjectTitle, i.body])).toEqual([
        ["profile", "Other", "On a profile"],
        ["session", "A session", "On the session"],
        ["proposal", "A proposal", "On the proposal"],
      ]);
      expect(items[2]).toMatchObject({
        subjectId: proposal.id,
        event: { name: "Alpha Conf", slug: event.slug },
        replyCount: 1,
        likeCount: 1,
      });
      expect(items[0]).toMatchObject({ subjectId: other.id, event: null });
    }
  );

  it("needs a selected guest", { tags: ["010-US9"] }, async () => {
    const res = await GET(request("GET", "/me/comments"));
    expect(res.status).toBe(403);
    expect(((await res.json()) as { code: string }).code).toBe(
      "guest.unselected"
    );
  });
});
