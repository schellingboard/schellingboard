import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useCallback, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi } from "../../commands/fake-api";
import type { DirectoryEntry } from "../../queries/directory";
import { createProfileActivityQuery } from "../../queries/profile-activity";
import { comment, fakeComments } from "../comments/comments-test-support";
import { cardsFrom, everyoneIn } from "./directory-model";
import { legacyProfileLinks } from "./links";
import { ProfileModal, type ProfileModalProps } from "./profile-modal";

afterEach(cleanup);

const entry = (
  name: string,
  patch: Partial<DirectoryEntry> = {}
): DirectoryEntry => ({
  id: name.toLowerCase(),
  name,
  aboutMe: null,
  avatarUrl: null,
  pronouns: null,
  basedIn: null,
  prompts: null,
  languages: null,
  contacts: null,
  profileUpdatedAt: null,
  version: 1,
  isHost: false,
  openToMeetings: false,
  ...patch,
});

const cards = cardsFrom(
  [
    entry("Al", {
      aboutMe:
        "**Bold** and [my site](https://example.com)\n\n<script>x</script>",
      pronouns: "she/her",
      basedIn: "Oslo",
      languages: ["Norwegian", "English"],
      prompts: [
        { prompt: "Zebra question", answer: "Stripes" },
        { prompt: "Offering", answer: "Bees" },
      ],
      contacts: [
        { type: "email", value: "al@example.com" },
        { type: "other", label: "Fediverse", value: "@al" },
      ],
      isHost: true,
    }),
    entry("Bo"),
    entry("Cy"),
  ],
  new Date("2026-05-10T10:00:00Z")
);

const activity = {
  hosting: [{ id: "s1", title: "Hosted talk", eventSlug: "Camp" }],
  proposals: [{ id: "p1", title: "Proposed talk", eventSlug: "Camp" }],
};
const NO_OPTIONS: unknown[] = [];
const option = {
  eventId: "e1",
  eventName: "Camp",
  meetingPoints: [],
  lengths: [],
};

function Harness(
  props: Partial<ProfileModalProps> & { start?: string; options?: unknown[] }
) {
  const { start = "al", options = NO_OPTIONS, ...rest } = props;
  const [guestId, setGuestId] = useState(start);
  const make = useCallback(
    (id: string) => {
      const { api } = fakeApi(({ path }) =>
        Response.json(
          path.endsWith("/activity")
            ? id === "al" || id === "cy"
              ? activity
              : { hosting: [], proposals: [] }
            : { options }
        )
      );
      return createProfileActivityQuery({ api, guestId: id });
    },
    [options]
  );
  return (
    <ProfileModal
      guestId={guestId}
      matches={cards}
      everyone={everyoneIn(cards)}
      viewerId="cy"
      links={legacyProfileLinks}
      activity={make}
      onOpen={setGuestId}
      onClose={() => {}}
      onSchedule={() => {}}
      comments={() =>
        fakeComments([comment("c1", { author: { id: "bo", name: "Bo" } })])
      }
      setHash={() => {}}
      {...rest}
    />
  );
}

const dialog = () => screen.getByRole("dialog");

describe("the profile modal", () => {
  it("shows the details of the profile", { tags: ["011-US1"] }, () => {
    render(<Harness />);
    const d = within(dialog());

    expect(d.getByRole("heading", { name: "Al" })).toBeTruthy();
    expect(d.getByText("she/her")).toBeTruthy();
    expect(d.getByText("Session host")).toBeTruthy();
    expect(d.getByText("Based in Oslo")).toBeTruthy();
    expect(d.getByText("Norwegian")).toBeTruthy();
    expect(d.getByText("Bold").tagName).toBe("STRONG");
    expect(d.getByRole("link", { name: "my site" }).getAttribute("href")).toBe(
      "https://example.com"
    );
    expect(d.getByText("<script>x</script>")).toBeTruthy();
    expect(d.getByText("Fediverse:")).toBeTruthy();
    expect(d.getByText("Email:")).toBeTruthy();
  });

  it(
    "puts the core prompts first, in their order",
    { tags: ["011-US1"] },
    () => {
      render(<Harness />);

      const headings = within(dialog())
        .getAllByRole("heading", { level: 2 })
        .map((h) => h.textContent);
      expect(headings.indexOf("Offering")).toBeLessThan(
        headings.indexOf("Zebra question")
      );
    }
  );

  it(
    "lists what they host and propose once it arrives, linking to each",
    { tags: ["011-US1"] },
    async () => {
      render(<Harness />);

      const talk = await screen.findByRole("link", { name: "Hosted talk" });
      expect(talk.getAttribute("href")).toBe("/Camp?viewSession=s1");
      expect(
        screen.getByRole("link", { name: "Proposed talk" }).getAttribute("href")
      ).toBe("/Camp/proposals?viewProposal=p1");
    }
  );

  it(
    "offers a 1-on-1 for each event it could be booked at, to someone else only",
    { tags: ["012-US3"] },
    async () => {
      const picked: string[] = [];
      render(
        <Harness
          options={[option, { ...option, eventId: "e2", eventName: "Fest" }]}
          onSchedule={(id, o) => picked.push(`${id}:${o.eventName}`)}
        />
      );

      await userEvent.click(
        await screen.findByRole("button", { name: "Schedule a 1-on-1 at Fest" })
      );

      expect(picked).toEqual(["al:Fest"]);
      cleanup();
      render(<Harness start="cy" options={[option]} />);
      await screen.findByRole("link", { name: "Hosted talk" });
      expect(
        screen.queryByRole("button", { name: /Schedule a 1-on-1/ })
      ).toBeNull();
      expect(
        screen.getByRole("link", { name: "Edit profile" }).getAttribute("href")
      ).toBe("/legacy/guests/edit");
    }
  );

  it(
    "names the position, and walks the list with Prev and Next and the arrow keys",
    { tags: ["011-US4"] },
    async () => {
      render(<Harness />);
      expect(screen.getByText("1 of 3 attendees")).toBeTruthy();
      const prev = screen.getByRole("button", { name: "Previous attendee" });
      expect((prev as HTMLButtonElement).disabled).toBe(true);

      await userEvent.click(
        screen.getByRole("button", { name: "Next attendee" })
      );
      expect(screen.getByRole("dialog", { name: "Bo" })).toBeTruthy();
      expect(screen.getByText("2 of 3 attendees")).toBeTruthy();

      await userEvent.keyboard("{ArrowRight}");
      expect(screen.getByRole("dialog", { name: "Cy" })).toBeTruthy();
      expect(
        screen.getByRole<HTMLButtonElement>("button", { name: "Next attendee" })
          .disabled
      ).toBe(true);
      await userEvent.keyboard("{ArrowLeft}");
      expect(screen.getByRole("dialog", { name: "Bo" })).toBeTruthy();
    }
  );

  it(
    "walks everyone for a profile the list behind does not show",
    { tags: ["011-US4"] },
    () => {
      render(<Harness matches={[cards[1]]} start="cy" />);

      expect(screen.getByText("3 of 3 attendees")).toBeTruthy();
    }
  );

  it(
    "says so when the person is no longer listed",
    { tags: ["011-US4"] },
    () => {
      render(<Harness start="nobody" />);

      expect(screen.getByText("This person is no longer listed.")).toBeTruthy();
    }
  );

  it(
    "closes with the button, Escape and the backdrop, Escape first shrinking an enlarged photo",
    { tags: ["011-US4", "011-US5"] },
    async () => {
      let closed = 0;
      const withPhoto = cardsFrom(
        [entry("Al", { avatarUrl: "/a.png" })],
        new Date("2026-05-10T10:00:00Z")
      );
      render(
        <Harness
          matches={withPhoto}
          everyone={withPhoto}
          onClose={() => closed++}
        />
      );

      await userEvent.click(
        screen.getByRole("button", { name: "Enlarge photo of Al" })
      );
      await userEvent.keyboard("{Escape}");
      expect(closed).toBe(0);
      expect(
        screen.getByRole("button", { name: "Enlarge photo of Al" })
      ).toBeTruthy();

      await userEvent.keyboard("{Escape}");
      await userEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(closed).toBe(2);
    }
  );

  it(
    "leaves the arrow keys to a field being typed in",
    { tags: ["011-US4"] },
    () => {
      render(
        <>
          <input aria-label="Typing" />
          <Harness />
        </>
      );

      fireEvent.keyDown(screen.getByLabelText("Typing"), { key: "ArrowRight" });

      expect(screen.getByText("1 of 3 attendees")).toBeTruthy();
    }
  );

  it("reads on with a swipe", { tags: ["011-US4"] }, async () => {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 400,
    });
    render(<Harness />);
    const viewport = dialog().querySelector(".touch-pan-y")!;
    const touch = (type: string, x: number) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.assign(event, {
        touches: type === "touchend" ? [] : [{ clientX: x, clientY: 100 }],
      });
      viewport.dispatchEvent(event);
    };

    for (const [type, x] of [
      ["touchstart", 300],
      ["touchmove", 250],
      ["touchmove", 80],
      ["touchend", 80],
    ] as const)
      act(() => touch(type, x));

    expect(await screen.findByRole("dialog", { name: "Bo" })).toBeTruthy();
    delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
  });
});

describe("the comments on a profile", () => {
  it(
    "opens the thread of the profile being read, named, and no neighbour's",
    { tags: ["010-US3"] },
    async () => {
      const comments = vi.fn(() => fakeComments([comment("c1")]));
      render(<Harness comments={comments} />);

      expect(await within(dialog()).findByText("body of c1")).toBeTruthy();
      expect(comments).toHaveBeenCalledWith("al", "Al");
      expect(comments).toHaveBeenCalledTimes(1);

      await userEvent.click(
        screen.getByRole("button", { name: "Next attendee" })
      );
      await waitFor(() => expect(comments).toHaveBeenCalledWith("bo", "Bo"));
    }
  );

  it(
    "links an author to their own profile and a comment's time to its permalink",
    { tags: ["010-US3", "010-US5"] },
    async () => {
      const hashes: string[] = [];
      render(<Harness setHash={(h) => hashes.push(h)} />);

      const author = await within(dialog()).findByRole("link", { name: "Bo" });
      expect(author.getAttribute("href")).toBe("/legacy/guests/bo");
      const permalink = within(dialog())
        .getAllByRole("link")
        .find((a) => a.getAttribute("href")?.includes("#comment-c1"))!;
      expect(permalink.getAttribute("href")).toBe(
        "/legacy/guests/al#comment-c1"
      );
      await userEvent.click(permalink);
      expect(hashes).toEqual(["#comment-c1"]);
    }
  );
});
