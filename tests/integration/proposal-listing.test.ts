// @module-tag 007-US8
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { getRepositories } from "@/db/container";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createProposal } from "../helpers/factories";

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

describe("listing an event's proposals as the change log holds them", () => {
  it("has the fields the snapshot shows, hosts included", async () => {
    const event = await createEvent();
    const host = await createGuest({ name: "Host", eventId: event.id });
    const other = await createEvent({ name: "Other" });
    await createProposal(event.id, [host.id], {
      title: "Mine",
      cohostWanted: true,
    });
    await createProposal(other.id, [], { title: "Elsewhere" });

    const proposals =
      await getRepositories().sessionProposals.listLoggedByEvent(event.id);

    expect(proposals).toHaveLength(1);
    expect(proposals[0]).toMatchObject({
      title: "Mine",
      cohostWanted: true,
      hosts: [{ id: host.id, name: "Host" }],
    });
  });
});
