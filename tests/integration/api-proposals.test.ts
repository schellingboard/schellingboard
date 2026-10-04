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
import { createAdminAuthCookie } from "@/utils/auth";
import { getRepositories } from "@/db/container";
import { VoteChoice } from "@schellingboard/domain/vote";
import { setupTestDb, resetTestDb } from "../helpers/db";
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
  afterTasks.length = 0;
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
        updatedTime: string;
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
            expectedUpdatedTime: proposal.updatedTime,
          },
        })
      );
      expect(updated.status).toBe(200);
      expect(await updated.json()).toMatchObject({ title: "Sailing knots" });

      const joined = await POST(
        request("POST", `/proposals/${proposal.id}/hosts`, {
          cookie: asGuest(joiner.id),
        })
      );
      expect(joined.status).toBe(204);
      await Promise.all(afterTasks);
      expect(await getRepositories().notifications.countByGuest(host.id)).toBe(
        1
      );

      const listed = await GET(
        request("GET", `/proposals?eventId=${event.id}`)
      );
      expect(await listed.json()).toMatchObject({
        proposals: [{ id: proposal.id, hosts: expect.any(Array) as unknown }],
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
        expectedUpdatedTime: proposal.updatedTime.toISOString(),
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
