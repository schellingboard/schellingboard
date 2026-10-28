// @module-tag 011-US3
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { DirectoryEntry } from "../../queries/directory";
import { DirectoryScreen, type DirectoryScreenProps } from "./directory-screen";

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
  authProtected: false,
  ...patch,
});

const entries = [
  entry("Cy", { aboutMe: "Into bees", isHost: true, pronouns: "they/them" }),
  entry("Al", { openToMeetings: true, basedIn: "Oslo" }),
  entry("Bo", { languages: ["Italian"] }),
];

const links = {
  guest: (id: string, listQuery: string) =>
    `/guests/${id}${listQuery ? `?${listQuery}` : ""}`,
  edit: "/guests/edit",
};

function Harness(props: Partial<DirectoryScreenProps>) {
  const [params, setParams] = useState(new URLSearchParams());
  return (
    <>
      <div data-testid="url">{params.toString()}</div>
      <DirectoryScreen
        entries={entries}
        status="ready"
        now={new Date("2026-05-10T10:00:00Z")}
        viewerId="al"
        meetingsEnabled
        randomSeed="seed"
        links={links}
        {...props}
        params={params}
        onParams={setParams}
      />
    </>
  );
}

const listed = () =>
  screen.getAllByRole("link", { name: /Al|Bo|Cy/ }).map((a) => a.textContent);

describe("the directory screen", () => {
  it("lists the attendees by name with what the list shows of each", () => {
    render(<Harness />);

    expect(screen.getByRole("heading", { name: "Attendees" })).toBeTruthy();
    expect(screen.getByText("3 attendees")).toBeTruthy();
    const links = screen.getAllByRole("link", { name: /^(Al|Bo|Cy)/ });
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/guests/al",
      "/guests/bo",
      "/guests/cy",
    ]);
    const cy = within(links[2]);
    expect(cy.getByText("Session host")).toBeTruthy();
    expect(cy.getByText("they/them")).toBeTruthy();
    expect(cy.getByText("Into bees")).toBeTruthy();
    expect(within(links[0]).getByText("Oslo")).toBeTruthy();
  });

  it("searches names and profile text, and carries the view onto the profile link", async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText("Search"), "bees");

    expect(await screen.findByText("1 attendee")).toBeTruthy();
    expect(screen.getByTestId("url").textContent).toBe("q=bees");
    expect(screen.getByRole("link", { name: /Cy/ }).getAttribute("href")).toBe(
      "/guests/cy?q=bees"
    );
  });

  it("filters, and says so on the toggles", async () => {
    render(<Harness />);

    await userEvent.click(
      screen.getByRole("button", { name: "Filter by Session host" })
    );

    expect(
      screen
        .getByRole("button", { name: "Filter by Session host (active)" })
        .getAttribute("aria-pressed")
    ).toBe("true");
    expect(listed()).toHaveLength(1);
    expect(screen.getByTestId("url").textContent).toBe("filter=isHost");
  });

  it("keeps a filter clicked while the search is still waiting to be sent", async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText("Search"), "bee");
    await userEvent.click(
      screen.getByRole("button", { name: "Filter by Session host" })
    );

    await waitFor(() =>
      expect(screen.getByTestId("url").textContent).toBe("filter=isHost&q=bee")
    );
  });

  it("says no one matches, not loading, while a refresh runs behind a filtered-out list", async () => {
    render(<Harness status="loading" />);

    await userEvent.type(screen.getByLabelText("Search"), "zzz");

    expect(await screen.findByText("No attendees match.")).toBeTruthy();
  });

  it("offers the 1-on-1 filter only while meetings are on", () => {
    render(<Harness meetingsEnabled={false} />);

    expect(
      screen.queryByRole("button", { name: /Filter by Open to 1-on-1s/ })
    ).toBeNull();
  });

  it("sorts, until a search ranks by relevance instead", async () => {
    render(<Harness />);
    const sort = screen.getByLabelText("Sort by");

    await userEvent.selectOptions(sort, "Random");
    expect(screen.getByTestId("url").textContent).toBe("sort=random");

    await userEvent.type(screen.getByLabelText("Search"), "o");
    await waitFor(() =>
      expect((sort as HTMLSelectElement).disabled).toBe(true)
    );
  });

  it("explains an empty list, and invites the viewer to fill in a profile", async () => {
    render(<Harness entries={[entry("Al")]} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Filter by Has profile" })
    );

    expect(screen.getByText(/Nobody has filled in a profile yet/)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Be the first!" }).getAttribute("href")
    ).toBe("/guests/edit");

    await userEvent.type(screen.getByLabelText("Search"), "zzz");
    expect(await screen.findByText("No attendees match.")).toBeTruthy();
  });

  it("offers editing the profile only to someone with a name", () => {
    const { rerender } = render(<Harness />);
    expect(
      screen.getByRole("link", { name: "Edit profile" }).getAttribute("href")
    ).toBe("/guests/edit");

    rerender(<Harness viewerId={null} />);
    expect(screen.queryByRole("link", { name: "Edit profile" })).toBeNull();
  });

  it("says when the directory is loading or could not be read", () => {
    const { rerender } = render(<Harness entries={[]} status="loading" />);
    expect(screen.getByRole("status").textContent).toMatch(/Loading/);

    rerender(<Harness entries={[]} status="error" />);
    expect(screen.getByRole("alert").textContent).toMatch(/Could not load/);
  });
});
