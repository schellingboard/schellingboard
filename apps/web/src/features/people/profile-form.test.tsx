import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { profileFormCalls } from "../../commands/profile-form";
import { NoticeProvider } from "../../ui/notices";
import { ProfileForm, type ProfileDraft } from "./profile-form";

afterEach(cleanup);

const profile: ProfileDraft = {
  id: "al",
  name: "Al",
  aboutMe: "Hello",
  avatarUrl: "/uploads/al.png",
  pronouns: "She/Her",
  basedIn: "Oslo",
  prompts: [{ prompt: "Offering", answer: "Bees" }],
  languages: ["Norwegian"],
  contacts: [{ type: "signal", value: "@al" }],
  version: 4,
};

const saved = (over = {}) => Response.json({ ...profile, ...over });

function setup({
  handler = () => saved(),
  draft = profile,
  prepareImage = (file: Blob) => Promise.resolve({ blob: file }),
}: {
  handler?: FakeHandler;
  draft?: ProfileDraft;
  prepareImage?: (file: Blob) => Promise<{ blob: Blob } | { error: string }>;
} = {}) {
  const { api, calls } = fakeApi(handler);
  const onDone = vi.fn();
  render(
    <NoticeProvider>
      <ProfileForm
        profile={draft}
        links={{ people: "/guests", settings: "/settings" }}
        actions={profileFormCalls(api)}
        prepareImage={prepareImage}
        onDone={onDone}
      />
    </NoticeProvider>
  );
  return { calls, onDone };
}

const save = () => screen.getByRole("button", { name: "Save" });
const png = () => new File(["x"], "me.png", { type: "image/png" });
const pick = (file: File) =>
  fireEvent.change(document.querySelector('input[type="file"]')!, {
    target: { files: [file] },
  });

describe("editing my profile", { tags: ["011-US1"] }, () => {
  it("starts from the saved profile and saves the edits against its version", async () => {
    const { calls, onDone } = setup();
    expect(screen.getByLabelText<HTMLInputElement>(/^Name/).value).toBe("Al");

    await userEvent.type(screen.getByLabelText("Based in"), "gen");
    await userEvent.click(save());

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/me/profile",
      body: {
        name: "Al",
        aboutMe: "Hello",
        pronouns: "She/Her",
        basedIn: "Oslogen",
        languages: ["Norwegian"],
        contacts: [{ type: "signal", label: "", value: "@al" }],
        expectedVersion: 4,
      },
    });
  });

  it("shows the core prompts, answered or not, and sends the answers", async () => {
    const { calls } = setup();

    await userEvent.type(screen.getByLabelText("Ask me about"), "Rust");
    await userEvent.click(save());

    await waitFor(() => expect(calls).toHaveLength(1));
    expect((calls[0].body as { prompts: unknown[] }).prompts).toEqual([
      { prompt: "Ask me about", answer: "Rust" },
      { prompt: "Looking for", answer: "" },
      { prompt: "Offering", answer: "Bees" },
    ]);
  });

  it("adds a language and a contact, and asks for a label only on 'Other'", async () => {
    const { calls } = setup();

    await userEvent.click(screen.getByRole("button", { name: "Add language" }));
    await userEvent.type(
      screen.getAllByRole("combobox", { name: "Language" })[1],
      "Italian"
    );
    await userEvent.click(screen.getByRole("button", { name: "Add contact" }));
    const types = screen.getAllByLabelText("Contact type");
    expect(screen.queryByLabelText("Contact label")).toBeNull();
    await userEvent.selectOptions(types[1], "Other");
    await userEvent.type(screen.getByLabelText("Contact label"), "Mastodon");
    await userEvent.type(screen.getAllByLabelText("Contact value")[1], "@a");
    await userEvent.click(save());

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toMatchObject({
      languages: ["Norwegian", "Italian"],
      contacts: [
        { type: "signal", value: "@al" },
        { type: "other", label: "Mastodon", value: "@a" },
      ],
    });
  });

  it("keeps what is typed as pronouns when Enter follows a hover over a suggestion", async () => {
    setup();
    const pronouns = screen.getByLabelText("Pronouns");

    await userEvent.click(pronouns);
    await userEvent.hover(screen.getByRole("option", { name: "He/Him" }));
    await userEvent.clear(pronouns);
    await userEvent.type(pronouns, "Zie/Zir{Enter}");

    expect((pronouns as HTMLInputElement).value).toBe("Zie/Zir");
  });

  it("takes a suggestion reached with the arrow keys", async () => {
    setup();
    const pronouns = screen.getByLabelText("Pronouns");

    await userEvent.clear(pronouns);
    await userEvent.keyboard("{ArrowDown}{Enter}");

    expect((pronouns as HTMLInputElement).value).toBe("He/Him");
  });

  it("summarizes a bad value, reopens its section and focuses the field", async () => {
    const draft = { ...profile, languages: null };
    const { calls } = setup({ draft });
    await userEvent.click(screen.getByRole("button", { name: /Languages/ }));
    await userEvent.click(screen.getByRole("button", { name: "Add language" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Language" }), {
      target: { value: "x".repeat(60) },
    });
    await userEvent.click(screen.getByRole("button", { name: /Languages/ }));
    expect(screen.queryByRole("button", { name: "Add language" })).toBeNull();

    await userEvent.click(save());

    const summary = await screen.findByRole("alert");
    expect(calls).toHaveLength(0);
    await userEvent.click(
      within(summary).getByRole("button", { name: /Keep language names/ })
    );
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Language" })).toBe(
        document.activeElement
      )
    );
  });

  it("says so when someone else changed the profile meanwhile", async () => {
    const { onDone } = setup({
      handler: () => problem(409, "profile.versionConflict"),
    });

    await userEvent.click(save());

    expect(await screen.findByText(/Someone else changed this/)).toBeTruthy();
    expect(onDone).not.toHaveBeenCalled();
  });
});

describe("the profile photo", { tags: ["011-US2"] }, () => {
  it("is uploaded before the profile, which is then saved against the new version", async () => {
    const { calls, onDone } = setup({
      handler: ({ path }) =>
        path.endsWith("/avatar")
          ? saved({ version: 5 })
          : saved({ version: 6 }),
    });

    pick(png());
    await userEvent.click(save());

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual([
      "PUT /api/v1/me/avatar",
      "PUT /api/v1/me/profile",
    ]);
    expect(calls[0].body).toEqual({
      avatar: expect.objectContaining({ type: "image/png" }) as unknown,
      expectedVersion: "4",
    });
    expect(calls[1].body).toMatchObject({ expectedVersion: 5 });
  });

  it("is removed when reset", async () => {
    const { calls } = setup({
      handler: ({ method }) =>
        method === "DELETE" ? saved({ version: 5 }) : saved(),
    });

    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    await userEvent.click(save());

    await waitFor(() => expect(calls).toHaveLength(2));
    expect(calls[0]).toMatchObject({
      method: "DELETE",
      path: "/api/v1/me/avatar?expectedVersion=4",
    });
  });

  it("is not deleted on reset when there is none", async () => {
    const { calls } = setup({ draft: { ...profile, avatarUrl: null } });

    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    await userEvent.click(save());

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].path).toBe("/api/v1/me/profile");
  });

  it("says so when the photo was saved and the details were not", async () => {
    setup({
      handler: ({ path }) =>
        path.endsWith("/avatar")
          ? saved({ version: 5 })
          : Response.json(
              {
                type: "about:blank",
                title: "x",
                status: 403,
                code: "guest.notInEvent",
              },
              {
                status: 403,
                headers: { "content-type": "application/problem+json" },
              }
            ),
    });

    pick(png());
    await userEvent.click(save());

    expect(
      await screen.findByText("Your photo was saved; the details were not.")
    ).toBeTruthy();
  });

  it("is left alone when only the text changes", async () => {
    const { calls } = setup();

    await userEvent.click(save());

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].path).toBe("/api/v1/me/profile");
  });

  it("sends a rejected picture back to the picker, and saves nothing", async () => {
    const { calls } = setup({
      handler: () =>
        Response.json(
          {
            type: "about:blank",
            title: "invalid",
            status: 400,
            code: "avatar.invalid",
            errors: [{ path: "avatar", message: "Image is too small" }],
          },
          {
            status: 400,
            headers: { "content-type": "application/problem+json" },
          }
        ),
    });

    pick(png());
    await userEvent.click(save());

    const summary = await screen.findByRole("alert");
    await userEvent.click(
      within(summary).getByRole("button", { name: /Image is too small/ })
    );
    expect(calls).toHaveLength(1);
    expect(screen.getByRole("button", { name: /Change profile picture/ })).toBe(
      document.activeElement
    );
  });

  it("reports a picture that cannot be prepared without sending it", async () => {
    const { calls } = setup({
      prepareImage: () => Promise.resolve({ error: "Failed to resize image" }),
    });

    pick(png());
    await userEvent.click(save());

    expect(
      (await screen.findAllByText(/Failed to resize image/)).length
    ).toBeGreaterThan(0);
    expect(calls).toHaveLength(0);
  });
});
