import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { VoteChoice } from "@schellingboard/domain/vote";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type ProposalDetailState } from "../../queries/proposal-detail";
import { createObservable } from "../../queries/store";
import { iso, snapshot as fixture } from "../../replica/snapshot-fixture";
import { NoticeProvider } from "../../ui/notices";
import { comment, fakeComments } from "../comments/comments-test-support";
import { proposalLinks } from "./links";
import { ProposalModal, type ProposalActions } from "./proposal-modal";

afterEach(cleanup);

const proposal = (
  patch: Partial<Snapshot["proposals"][number]> = {}
): Snapshot["proposals"][number] => ({
  id: "p",
  eventId: "e",
  title: "Rust intro",
  description: "Learn **Rust**",
  durationMinutes: 90,
  createdTime: iso(1),
  updatedTime: iso(1),
  hosts: [{ id: "host", name: "HOST" }],
  cohostWanted: false,
  cohostWantedNote: null,
  version: 1,
  ...patch,
});

const phases = {
  voting: {
    proposalPhaseStart: iso(0),
    votingPhaseStart: iso(0),
    votingPhaseEnd: iso(20),
    schedulingPhaseStart: iso(20),
  },
  scheduling: {
    proposalPhaseStart: iso(0),
    votingPhaseStart: iso(0),
    votingPhaseEnd: iso(5),
    schedulingPhaseStart: iso(5),
  },
};

const breakdown = {
  attendees: 10,
  interested: 2,
  maybe: 1,
  skip: 1,
  votes: 4,
  votesPctOfAttendees: 40,
  nonVoters: 6,
  nonVotersPctOfAttendees: 60,
  interestedPctOfVotes: 50,
  maybePctOfVotes: 25,
  skipPctOfVotes: 25,
  estimatedAttendance: null,
  noEstimateReason: "low-turnout" as const,
};

function setup(
  phase: keyof typeof phases,
  {
    p = proposal(),
    patch = {},
    detail = { status: "ready", tally: null, breakdown: null },
  }: {
    p?: Snapshot["proposals"][number];
    patch?: Partial<Snapshot>;
    detail?: ProposalDetailState;
  } = {}
) {
  const snapshot: Snapshot = {
    ...fixture,
    now: iso(10),
    event: { ...fixture.event, ...phases[phase] },
    proposals: [p],
    me: { ...fixture.me!, guestId: "mia", votes: [] },
    guests: fixture.guests.map((g) => ({ ...g, member: true })),
    ...patch,
  };
  const store = createObservable(detail);
  const refresh = vi.fn(() => Promise.resolve());
  const actions = {
    vote: vi.fn(),
    join: vi.fn(() => Promise.resolve()),
    detail: vi.fn(() => ({
      get: store.get,
      subscribe: store.subscribe,
      refresh,
      destroy: vi.fn(),
    })),
    comments: vi.fn(() => fakeComments([comment("c1")])),
  } satisfies ProposalActions;
  const onClose = vi.fn();
  const element = (current: Snapshot) => (
    <NoticeProvider>
      <ProposalModal
        proposalId="p"
        snapshot={current}
        now={new Date(iso(10))}
        localZone="UTC"
        links={proposalLinks("conf")}
        actions={actions}
        setHash={() => {}}
        onClose={onClose}
      />
    </NoticeProvider>
  );
  const { rerender } = render(element(snapshot));
  return {
    actions,
    onClose,
    refresh,
    update: (next: Partial<Snapshot>) =>
      rerender(element({ ...snapshot, ...next })),
  };
}

const dialog = () =>
  within(screen.getByRole("dialog", { name: "Proposal details" }));

describe("the proposal modal", () => {
  it(
    "shows the title, hosts, description, duration and a co-host note",
    { tags: ["004-US4"] },
    () => {
      setup("voting", {
        p: proposal({ cohostWanted: true, cohostWantedNote: "Rust fan" }),
      });

      expect(
        dialog().getByRole("heading", { name: "Rust intro" })
      ).toBeTruthy();
      expect(
        dialog().getAllByRole("link", { name: "HOST" })[0].getAttribute("href")
      ).toBe("/guests/host");
      expect(dialog().getByText("Rust").tagName).toBe("STRONG");
      expect(dialog().getByText(/Duration: 1 hour 20 minutes/)).toBeTruthy();
      expect(
        dialog().getByText(/Looking for a co-host: Rust fan/)
      ).toBeTruthy();
    }
  );

  it("says so when the proposal is gone", { tags: ["004-US4"] }, () => {
    setup("voting", { patch: { proposals: [] } });
    expect(dialog().getByText("Proposal not found.")).toBeTruthy();
  });

  it("closes", { tags: ["004-US4"] }, async () => {
    const { onClose } = setup("voting");
    await userEvent.click(dialog().getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it(
    "offers Edit to a host and to anyone for an unhosted proposal",
    { tags: ["004-US2"] },
    () => {
      cleanup();
      setup("voting", {
        p: proposal({ hosts: [{ id: "mia", name: "MIA" }] }),
      });
      expect(
        dialog().getByRole("link", { name: "Edit" }).getAttribute("href")
      ).toBe("/conf/proposals/p/edit");
      cleanup();
      setup("voting");
      expect(dialog().queryByRole("link", { name: "Edit" })).toBeNull();
      cleanup();
      setup("voting", { p: proposal({ hosts: [] }) });
      expect(dialog().getByRole("link", { name: "Edit" })).toBeTruthy();
    }
  );
});

describe("voting in the modal", () => {
  it("lets a guest vote and withdraw", { tags: ["005-US1"] }, async () => {
    const { actions } = setup("voting", {
      patch: {
        me: {
          ...fixture.me!,
          guestId: "mia",
          votes: [{ proposalId: "p", choice: VoteChoice.maybe }],
        },
      },
    });

    await userEvent.click(
      dialog().getByRole("button", { name: /❤️ Interested/ })
    );
    await userEvent.click(dialog().getByRole("button", { name: /⭐ Maybe/ }));

    expect(actions.vote.mock.calls).toEqual([
      ["p", VoteChoice.interested],
      ["p", null],
    ]);
  });

  it("gives a host no vote buttons", { tags: ["005-US1"] }, () => {
    setup("voting", { p: proposal({ hosts: [{ id: "mia", name: "MIA" }] }) });
    expect(
      dialog().queryByRole("button", { name: /❤️ Interested/ })
    ).toBeNull();
  });

  it(
    "says why voting is unavailable, on a tap",
    { tags: ["006-US2"] },
    async () => {
      setup("voting", { patch: { me: null } });
      const button = dialog().getByRole("button", { name: /❤️ Interested/ });

      expect(button.getAttribute("aria-disabled")).toBe("true");
      await userEvent.click(button);

      expect(screen.getByRole("status").textContent).toBe(
        "Select a user first" + "Dismiss"
      );
    }
  );
});

describe("the votes after voting closed", () => {
  it("shows a host the breakdown", { tags: ["005-US3"] }, () => {
    setup("scheduling", {
      p: proposal({ hosts: [{ id: "mia", name: "MIA" }] }),
      detail: {
        status: "ready",
        tally: { interested: 2, maybe: 1 },
        breakdown,
      },
    });

    const section = within(
      dialog().getByRole("region", { name: "Vote breakdown" })
    );
    expect(section.getByText(/Votes: 4 of 10 attendees \(40%\)/)).toBeTruthy();
    expect(dialog().queryByText(/Total votes/)).toBeNull();
  });

  it(
    "shows others the tally, and their own vote",
    { tags: ["005-US3"] },
    () => {
      setup("scheduling", {
        detail: {
          status: "ready",
          tally: { interested: 2, maybe: 1 },
          breakdown: null,
        },
        patch: {
          me: {
            ...fixture.me!,
            guestId: "mia",
            votes: [{ proposalId: "p", choice: VoteChoice.maybe }],
          },
        },
      });

      expect(dialog().getByText(/Total votes/)).toBeTruthy();
      expect(dialog().getByTitle("2 interested votes")).toBeTruthy();
      expect(dialog().getByTitle("Maybe").textContent).toBe("⭐");
      expect(
        dialog().queryByRole("region", { name: "Vote breakdown" })
      ).toBeNull();
    }
  );

  it("links the sessions it was scheduled as", { tags: ["004-US4"] }, () => {
    setup("scheduling", {
      patch: {
        sessions: [{ ...fixture.sessions[0], proposalId: "p" }],
      },
    });
    const link = dialog().getByRole("link", { name: /at .*in Room/ });
    expect(link.getAttribute("href")).toBe("/conf?viewSession=s");
  });

  it("says when it was not scheduled", { tags: ["004-US4"] }, () => {
    setup("scheduling");
    expect(
      dialog().getByText("This proposal has not been scheduled yet.")
    ).toBeTruthy();
  });

  it(
    "asks for the votes only once they are shown",
    { tags: ["005-US3"] },
    () => {
      const voting = setup("voting");
      expect(voting.actions.detail).not.toHaveBeenCalled();
      cleanup();
      const sched = setup("scheduling");
      expect(sched.actions.detail).toHaveBeenCalledWith("p");
    }
  );

  it(
    "asks again when the viewer or the proposal's hosts change",
    { tags: ["005-US3"] },
    () => {
      const { actions, update } = setup("scheduling");
      expect(actions.detail).toHaveBeenCalledTimes(1);

      update({ me: { ...fixture.me!, guestId: "ben", votes: [] } });
      expect(actions.detail).toHaveBeenCalledTimes(2);

      update({
        me: { ...fixture.me!, guestId: "ben", votes: [] },
        proposals: [proposal({ hosts: [{ id: "ben", name: "BEN" }] })],
      });
      expect(actions.detail).toHaveBeenCalledTimes(3);
    }
  );

  it(
    "says when the votes could not be loaded, and tries again",
    { tags: ["005-US3"] },
    async () => {
      const { refresh } = setup("scheduling", {
        detail: { status: "error", tally: null, breakdown: null },
      });
      expect(dialog().getByText("The votes could not be loaded.")).toBeTruthy();
      const before = refresh.mock.calls.length;

      await userEvent.click(
        dialog().getByRole("button", { name: "Try again" })
      );

      expect(refresh.mock.calls.length).toBe(before + 1);
    }
  );

  it(
    "shows a dash when the viewer has not voted",
    { tags: ["005-US3"] },
    () => {
      setup("scheduling");
      expect(dialog().getByTitle("No vote").textContent).toBe("-");
    }
  );
});

describe("taking on a proposal that wants a host", () => {
  const wanted = proposal({ hosts: [], cohostWanted: true });

  it("joins as a host", { tags: ["004-US6"] }, async () => {
    const { actions } = setup("voting", { p: wanted });
    expect(
      dialog().getByText(/Nobody is offering this session yet/)
    ).toBeTruthy();

    await userEvent.click(
      dialog().getByRole("button", { name: "Host this session" })
    );

    expect(actions.join).toHaveBeenCalledWith("p");
  });

  it("says co-host when it already has hosts", { tags: ["004-US6"] }, () => {
    setup("voting", { p: proposal({ cohostWanted: true }) });
    expect(
      dialog().getByRole("button", { name: "Join as co-host" })
    ).toBeTruthy();
  });

  it("needs a user, and says so", { tags: ["004-US6"] }, async () => {
    const { actions } = setup("voting", { p: wanted, patch: { me: null } });
    const join = dialog().getByRole("button", { name: "Host this session" });

    await userEvent.click(join);

    expect(actions.join).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toContain(
      "Select a user first"
    );
  });

  it(
    "is not offered to a host or when none is wanted",
    { tags: ["004-US6"] },
    () => {
      setup("voting", {
        p: proposal({
          hosts: [{ id: "mia", name: "MIA" }],
          cohostWanted: true,
        }),
      });
      expect(dialog().queryByRole("button", { name: /co-host/ })).toBeNull();
      cleanup();
      setup("voting", { p: proposal({ cohostWanted: false }) });
      expect(dialog().queryByRole("button", { name: /co-host/ })).toBeNull();
      expect(dialog().queryByRole("button", { name: /Host this/ })).toBeNull();
    }
  );
});

describe("a proposal's comments", () => {
  it("opens the proposal's own thread", { tags: ["010-US2"] }, async () => {
    const { actions } = setup("voting");
    await waitFor(() => expect(actions.comments).toHaveBeenCalledWith("p"));
    expect(await dialog().findByText("body of c1")).toBeTruthy();
  });
});
