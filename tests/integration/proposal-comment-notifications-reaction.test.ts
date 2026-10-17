// @module-tag 010-US1
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

vi.mock("@/utils/mailer", () => ({
  sendMail: vi.fn(),
}));

import { sendMail } from "@/utils/mailer";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { runJobs } from "../helpers/jobs";
import { createEvent, createGuest, createProposal } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { commentUseCases, proposalUseCases } from "@/server/composition";

const open = (id: string) => ({
  admin: false,
  guest: { id, level: "open" as const },
});
const AT = new Date("2026-06-01T10:00:00.000Z");

const recipients = () =>
  vi
    .mocked(sendMail)
    .mock.calls.map(([m]) => m.to)
    .sort();

const recordedTypes = async () =>
  (await getRepositories().changes.listAfter(0)).map((c) => c.type);

describe("proposal and comment notifications from the change log", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    vi.mocked(sendMail).mockReset();
    vi.stubEnv("SITE_URL", "https://site.example");
  });

  it(
    "records a joined proposal and tells its other hosts once, however often the jobs run",
    { tags: ["004-US6"] },
    async () => {
      const event = await createEvent();
      const host = await createGuest({
        email: "host@test.example",
        eventId: event.id,
      });
      const volunteer = await createGuest({ eventId: event.id });
      const proposal = await createProposal(event.id, [host.id], {
        cohostWanted: true,
      });

      const joined = await proposalUseCases().joinProposal(
        open(volunteer.id),
        { proposalId: proposal.id },
        AT
      );

      expect(joined.ok).toBe(true);
      expect(await recordedTypes()).toContain("proposal.joined");
      await runJobs();
      await runJobs();
      expect(recipients()).toEqual(["host@test.example"]);
    }
  );

  it(
    "records a comment and tells the proposal's hosts once, however often the jobs run",
    { tags: ["010-US1"] },
    async () => {
      const event = await createEvent();
      const host = await createGuest({
        email: "host@test.example",
        eventId: event.id,
      });
      const commenter = await createGuest({ eventId: event.id });
      const proposal = await createProposal(event.id, [host.id]);

      const posted = await commentUseCases().createComment(
        open(commenter.id),
        { subject: { kind: "proposal", id: proposal.id }, body: "Nice" },
        AT
      );

      expect(posted.ok).toBe(true);
      expect(await recordedTypes()).toContain("comment.created");
      await runJobs();
      await runJobs();
      expect(recipients()).toEqual(["host@test.example"]);
    }
  );
});
