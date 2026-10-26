// @module-tag 010-US1
// @module-tag 010-US2
// @module-tag 010-US3
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

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
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
import {
  createProfileComment,
  createSessionComment,
} from "@/app/legacy/(site)/[eventSlug]/comment-actions";
import { proposalApi } from "../helpers/proposal-api";

const { createProposalComment } = proposalApi(cookieJar);

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
      createProposalComment({ proposalId: proposal.id, body: "Hi" }, "k1");
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
