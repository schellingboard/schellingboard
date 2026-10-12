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

import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "@/app/api/v1/[[...route]]/route";
import { createAdminAuthCookie } from "@/utils/auth";
import { getRepositories } from "@/db/container";
import { VoteChoice } from "@schellingboard/domain/vote";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { runJobs } from "../helpers/jobs";
import { createEvent, createGuest, createProposal } from "../helpers/factories";
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

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
});
afterEach(() => vi.unstubAllEnvs());

describe("/api/v1 proposals", () => {
  it(
    "creates, reads, edits, joins and deletes a proposal",
    { tags: ["004-US1", "004-US2", "004-US3", "004-US4", "004-US6"] },
    async () => {
      const event = await createEvent({ phase: "voting" });
      const host = await createGuest({ eventId: event.id });
      const joiner = await createGuest({ eventId: event.id });

      const created = await POST(
        request("POST", "/proposals", {
          cookie: asGuest(host.id),
          body: {
            eventId: event.id,
            title: "Knots",
            hostIds: [host.id],
            cohostWanted: true,
          },
        })
      );
      expect(created.status).toBe(201);
      const proposal = (await created.json()) as {
        id: string;
        version: number;
      };
      expect(proposal).toMatchObject({
        title: "Knots",
        hosts: [{ id: host.id }],
      });

      const updated = await PUT(
        request("PUT", `/proposals/${proposal.id}`, {
          cookie: asGuest(host.id),
          body: {
            title: "Sailing knots",
            hostIds: [host.id],
            cohostWanted: true,
            expectedVersion: proposal.version,
          },
        })
      );
      expect(updated.status).toBe(200);
      expect(await updated.json()).toMatchObject({
        title: "Sailing knots",
        version: 2,
      });

      const joined = await POST(
        request("POST", `/proposals/${proposal.id}/hosts`, {
          cookie: asGuest(joiner.id),
        })
      );
      expect(joined.status).toBe(204);
      await runJobs();
      expect(await getRepositories().notifications.countByGuest(host.id)).toBe(
        1
      );

      const listed = await GET(
        request("GET", `/proposals?eventId=${event.id}`)
      );
      expect(await listed.json()).toMatchObject({
        items: [{ id: proposal.id, hosts: expect.any(Array) as unknown }],
        nextCursor: null,
      });

      const deleted = await DELETE(
        request("DELETE", `/proposals/${proposal.id}`, {
          cookie: asGuest(joiner.id),
        })
      );
      expect(deleted.status).toBe(204);
      const gone = await GET(request("GET", `/proposals/${proposal.id}`));
      expect(gone.status).toBe(404);
      expect(await gone.json()).toMatchObject({ code: "proposal.notFound" });
    }
  );

  it(
    "refuses an edit made before a co-host joined, answering with the proposal as it is",
    { tags: ["004-US2", "004-US6"] },
    async () => {
      const event = await createEvent({ phase: "voting" });
      const host = await createGuest({ eventId: event.id });
      const joiner = await createGuest({ eventId: event.id });
      const { id, version } = await createProposal(event.id, [host.id], {
        cohostWanted: true,
      });
      await POST(
        request("POST", `/proposals/${id}/hosts`, {
          cookie: asGuest(joiner.id),
        })
      );

      const res = await PUT(
        request("PUT", `/proposals/${id}`, {
          cookie: asGuest(host.id),
          body: {
            title: "Renamed",
            hostIds: [host.id],
            cohostWanted: false,
            expectedVersion: version,
          },
        })
      );

      const body = (await res.json()) as {
        code: string;
        current: { id: string; hosts: { id: string }[]; version: number };
      };
      expect(res.status).toBe(409);
      expect(body).toMatchObject({
        code: "proposal.versionConflict",
        current: { id, version: version + 1 },
      });
      expect(body.current.hosts.map((h) => h.id).sort()).toEqual(
        [host.id, joiner.id].sort()
      );
    }
  );

  it(
    "pages an event's proposals, oldest first, ties by id",
    { tags: ["019-US8"] },
    async () => {
      const event = await createEvent();
      const day = (d: number) => new Date(`2026-03-0${d}T10:00:00Z`);
      const second = await createProposal(event.id, [], {
        createdTime: day(2),
      });
      const first = await createProposal(event.id, [], {
        createdTime: day(1),
      });
      const [third, fourth] = (
        await Promise.all([
          createProposal(event.id, [], { createdTime: day(3) }),
          createProposal(event.id, [], { createdTime: day(3) }),
        ])
      ).sort((x, y) => (x.id < y.id ? -1 : 1));
      const page = async (query: string) =>
        (await (
          await GET(request("GET", `/proposals?eventId=${event.id}${query}`))
        ).json()) as { items: { id: string }[]; nextCursor: string | null };

      const one = await page("&limit=2");
      const two = await page(`&limit=2&cursor=${one.nextCursor}`);

      expect(one.items.map((p) => p.id)).toEqual([first.id, second.id]);
      expect(two.items.map((p) => p.id)).toEqual([third.id, fourth.id]);
      expect(two.nextCursor).toBeNull();
    }
  );

  it("refuses an edit without expectedVersion", async () => {
    const event = await createEvent({ phase: "voting" });
    const host = await createGuest({ eventId: event.id });
    const proposal = await createProposal(event.id, [host.id]);

    const res = await PUT(
      request("PUT", `/proposals/${proposal.id}`, {
        cookie: asGuest(host.id),
        body: { title: "Renamed", hostIds: [host.id], cohostWanted: false },
      })
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      code: "request.invalid",
      errors: [expect.objectContaining({ path: "expectedVersion" })],
    });
  });

  it(
    "keeps a hosted proposal's breakdown from everyone but its hosts",
    { tags: ["005-US3"] },
    async () => {
      const event = await createEvent({ phase: "scheduling" });
      const host = await createGuest({ eventId: event.id });
      const voter = await createGuest({ eventId: event.id });
      const proposal = await createProposal(event.id, [host.id]);
      await getRepositories().votes.upsert({
        proposalId: proposal.id,
        guestId: voter.id,
        choice: VoteChoice.skip,
      });

      const asVoter = await GET(
        request("GET", `/proposals/${proposal.id}`, {
          cookie: asGuest(voter.id),
        })
      );
      const seen = (await asVoter.json()) as unknown;
      expect(seen).toMatchObject({
        tally: { interested: 0, maybe: 0 },
        breakdown: null,
      });
      expect(JSON.stringify(seen)).not.toMatch(/skip/i);

      const asHost = await GET(
        request("GET", `/proposals/${proposal.id}`, {
          cookie: asGuest(host.id),
        })
      );
      expect(await asHost.json()).toMatchObject({
        breakdown: {
          skip: 1,
          votes: 1,
          noEstimateReason: expect.any(String) as string,
        },
      });
    }
  );

  it(
    "lets an organizer edit and delete a proposal under /admin",
    { tags: ["018-US1"] },
    async () => {
      const event = await createEvent();
      const host = await createGuest({ eventId: event.id });
      const proposal = await createProposal(event.id, [host.id]);
      const adminCookie = await createAdminAuthCookie();
      const admin = `${adminCookie.name}=${adminCookie.value}`;
      const edit = {
        title: "By the organizer",
        description: "",
        durationMinutes: null,
        hostIds: [],
        expectedVersion: proposal.version,
      };

      const refused = await PUT(
        request("PUT", `/admin/proposals/${proposal.id}`, {
          cookie: asGuest(host.id),
          body: edit,
        })
      );
      expect(refused.status).toBe(403);
      expect(await refused.json()).toMatchObject({ code: "admin.required" });

      const updated = await PUT(
        request("PUT", `/admin/proposals/${proposal.id}`, {
          cookie: admin,
          body: edit,
        })
      );
      expect(updated.status).toBe(200);
      expect(await updated.json()).toMatchObject({
        title: "By the organizer",
        hosts: [],
      });

      const stale = await PUT(
        request("PUT", `/admin/proposals/${proposal.id}`, {
          cookie: admin,
          body: { ...edit, title: "Again" },
        })
      );
      expect(stale.status).toBe(409);
      expect(await stale.json()).toMatchObject({
        code: "proposal.versionConflict",
        current: { id: proposal.id, title: "By the organizer", version: 2 },
      });

      const deleted = await DELETE(
        request("DELETE", `/admin/proposals/${proposal.id}`, { cookie: admin })
      );
      expect(deleted.status).toBe(204);
      expect(
        await getRepositories().sessionProposals.findById(proposal.id)
      ).toBeUndefined();
    }
  );
});
