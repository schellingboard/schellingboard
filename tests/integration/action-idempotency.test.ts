// @module-tag 004-US1
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/server", () => ({
  after: (task: () => unknown) => {
    void Promise.resolve(task());
  },
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
import {
  createEvent,
  createGuest,
  createProposal as createProposalRow,
  createSession,
} from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";
import { createProposal } from "@/app/legacy/(site)/[eventSlug]/proposals/actions";
import {
  createProfileComment,
  createProposalComment,
  createSessionComment,
} from "@/app/legacy/(site)/[eventSlug]/comment-actions";

describe("create proposal with an idempotency key", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    cookieJar.clear();
    vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
  });
  afterEach(() => vi.unstubAllEnvs());

  async function world() {
    await siteAuthenticate(cookieJar);
    const event = await createEvent();
    const guest = await createGuest({ eventId: event.id });
    cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(guest.id));
    const input = (title: string) => ({
      eventId: event.id,
      eventSlug: "test-event",
      title,
      hostIds: [guest.id],
    });
    const count = async () =>
      (await getRepositories().sessionProposals.listByEvent(event.id)).length;
    return { guest, input, count };
  }

  it("creates the proposal once when the same form is sent twice", async () => {
    const { input, count } = await world();
    expect(await createProposal(input("Once"), "form-1")).toEqual({
      success: true,
    });
    expect(await createProposal(input("Once"), "form-1")).toEqual({
      success: true,
    });
    expect(await count()).toBe(1);
  });

  it("refuses a key reused with different content", async () => {
    const { input, count } = await world();
    await createProposal(input("First"), "form-1");
    const second = await createProposal(input("Second"), "form-1");
    expect(second).toHaveProperty("error");
    expect(await count()).toBe(1);
  });

  it("lets a refused submit be retried under the same key", async () => {
    const { guest, input, count } = await world();
    const outsider = await createGuest();
    const refused = await createProposal(
      { ...input("Fixed"), hostIds: [outsider.id] },
      "form-1"
    );
    expect(refused).toHaveProperty("error");
    expect(await count()).toBe(0);
    expect(
      await createProposal({ ...input("Fixed"), hostIds: [guest.id] }, "form-1")
    ).toEqual({ success: true });
    expect(await count()).toBe(1);
  });

  it("creates a proposal each time when no key is sent", async () => {
    const { input, count } = await world();
    await createProposal(input("A"));
    await createProposal(input("A"));
    expect(await count()).toBe(2);
  });
});

describe("create comment with an idempotency key", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    cookieJar.clear();
    vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
  });
  afterEach(() => vi.unstubAllEnvs());

  async function world() {
    await siteAuthenticate(cookieJar);
    const event = await createEvent({ phase: "scheduling" });
    const guest = await createGuest({ eventId: event.id });
    cookieJar.set(GUEST_COOKIE_NAME, openGuestValue(guest.id));
    return { event, guest };
  }

  it("posts a session comment once when sent twice", async () => {
    const { event } = await world();
    const session = await createSession(event.id);
    const send = () =>
      createSessionComment({ sessionId: session.id, body: "Hi" }, "k1");
    expect(await send()).toEqual({ success: true });
    expect(await send()).toEqual({ success: true });
    const list = await getRepositories().sessionComments.list(session.id);
    expect(list).toHaveLength(1);
  });

  it("posts a proposal comment once when sent twice", async () => {
    const { event, guest } = await world();
    const proposal = await createProposalRow(event.id, [guest.id]);
    const send = () =>
      createProposalComment(
        { proposalId: proposal.id, eventSlug: "test-event", body: "Hi" },
        "k1"
      );
    expect(await send()).toEqual({ success: true });
    expect(await send()).toEqual({ success: true });
    const list = await getRepositories().proposalComments.list(proposal.id);
    expect(list).toHaveLength(1);
  });

  it("posts a profile comment once when sent twice", async () => {
    const { guest } = await world();
    const send = () =>
      createProfileComment({ profileId: guest.id, body: "Hi" }, "k1");
    await send();
    await send();
    const list = await getRepositories().profileComments.list(guest.id);
    expect(list).toHaveLength(1);
  });

  it("posts a comment each time when no key is sent", async () => {
    const { event } = await world();
    const session = await createSession(event.id);
    await createSessionComment({ sessionId: session.id, body: "Hi" });
    await createSessionComment({ sessionId: session.id, body: "Hi" });
    const list = await getRepositories().sessionComments.list(session.id);
    expect(list).toHaveLength(2);
  });
});
