import type { CropRegion } from "@schellingboard/domain/image-crop";
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

import { fakeApi, type FakeHandler, problem } from "../../commands/fake-api";
import { profileFormCalls } from "../../commands/profile-form";
import { NoticeProvider } from "../../ui/notices";
import { type ProfileDraft, ProfileForm } from "./profile-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

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
  track,
}: {
  track?: (check: () => boolean) => () => void;
  handler?: FakeHandler;
  draft?: ProfileDraft;
  prepareImage?: (
    file: Blob,
    region: CropRegion
  ) => Promise<{ blob: Blob } | { error: string }>;
} = {}) {
  const { api, calls } = fakeApi(handler);
  const onDone = vi.fn();
  const onCancel = vi.fn();
  render(
    <NoticeProvider>
      <ProfileForm
        profile={draft}
        links={{ settings: "/settings" }}
        actions={profileFormCalls(api)}
        prepareImage={prepareImage}
        onDone={onDone}
        onCancel={onCancel}
        track={track}
      />
    </NoticeProvider>
  );
  return { calls, onDone, onCancel };
}

const save = () => screen.getByRole("button", { name: "Save" });
const png = () => new File(["x"], "me.png", { type: "image/png" });
const choose = (file: File) =>
  fireEvent.change(document.querySelector('input[type="file"]')!, {
    target: { files: [file] },
  });
const pictureOf = (width: number, height: number) =>
  vi.stubGlobal("createImageBitmap", () =>
    Promise.resolve({ width, height, close: () => {} })
  );
const confirmCrop = async () => {
  const button = screen.getByRole("button", { name: "Use this part" });
  await waitFor(() => expect(button).not.toHaveProperty("disabled", true));
  await userEvent.click(button);
};
const pick = async (file: File) => {
  pictureOf(400, 200);
  choose(file);
  await confirmCrop();
};

describe("editing my profile", { tags: ["011-US1"] }, () => {
  it("leaves through the caller when Cancel is pressed", async () => {
    const { calls, onCancel } = setup();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalled();
    expect(calls).toHaveLength(0);
  });

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

  it("lets me choose which prompt to answer", async () => {
    const { calls } = setup();

    await userEvent.click(
      screen.getByRole("button", { name: "Add a conversation starter" })
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Prompt 1" }));
    await userEvent.click(
      screen.getByRole("option", { name: "When I arrive, and how I get there" })
    );
    await userEvent.type(
      screen.getByLabelText("When I arrive, and how I get there"),
      "Friday, by train"
    );
    await userEvent.click(save());

    await waitFor(() => expect(calls).toHaveLength(1));
    expect((calls[0].body as { prompts: unknown[] }).prompts).toContainEqual({
      prompt: "When I arrive, and how I get there",
      answer: "Friday, by train",
    });
  });

  it("keeps the answer when the same prompt is chosen again", async () => {
    setup();

    await userEvent.click(
      screen.getByRole("button", { name: "Add a conversation starter" })
    );
    const prompt = screen.getByRole<HTMLInputElement>("combobox", {
      name: "Prompt 1",
    });
    const chosen = prompt.value;
    await userEvent.type(screen.getByLabelText(chosen), "Friday");
    await userEvent.click(prompt);
    await userEvent.click(screen.getByRole("option", { name: chosen }));

    expect(screen.getByLabelText<HTMLTextAreaElement>(chosen).value).toBe(
      "Friday"
    );
  });

  it("keeps the line breaks of a prompt answer", async () => {
    const { calls } = setup();

    const answer = screen.getByLabelText("Ask me about");
    await userEvent.type(answer, "Rust{Enter}- Go");
    await userEvent.click(save());

    await waitFor(() => expect(calls).toHaveLength(1));
    expect((calls[0].body as { prompts: unknown[] }).prompts).toContainEqual({
      prompt: "Ask me about",
      answer: "Rust\n- Go",
    });
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

describe("unsaved changes", { tags: ["011-US1"] }, () => {
  function tracked() {
    let check = () => false;
    const track = (fn: () => boolean) => {
      check = fn;
      return () => {};
    };
    return { track, dirty: () => check() };
  }

  it("are none until something is edited", () => {
    const t = tracked();
    setup({ track: t.track });
    expect(t.dirty()).toBe(false);
  });

  it("count a new photo", async () => {
    const t = tracked();
    setup({ track: t.track });
    await pick(png());
    await waitFor(() => expect(t.dirty()).toBe(true));
  });

  it("count a removed photo", async () => {
    const t = tracked();
    setup({ track: t.track });
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(t.dirty()).toBe(true);
  });

  it("count changed pronouns", async () => {
    const t = tracked();
    setup({ track: t.track });
    await userEvent.clear(screen.getByLabelText("Pronouns"));
    await userEvent.type(screen.getByLabelText("Pronouns"), "They/Them");
    expect(t.dirty()).toBe(true);
  });

  it("count a removed language", async () => {
    const t = tracked();
    setup({ track: t.track });
    await userEvent.click(screen.getByRole("button", { name: /Languages/ }));
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(t.dirty()).toBe(true);
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

    await pick(png());
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

    await pick(png());
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

    await pick(png());
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

    await pick(png());
    expect(
      (await screen.findAllByText(/Failed to resize image/)).length
    ).toBeGreaterThan(0);
    await userEvent.click(save());

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].path).toBe("/api/v1/me/profile");
  });

  it("sends the part of the picture chosen in the crop frame", async () => {
    const prepareImage = vi.fn((file: Blob) => Promise.resolve({ blob: file }));
    setup({ prepareImage });

    pictureOf(400, 200);
    choose(png());
    await confirmCrop();

    expect(prepareImage).toHaveBeenCalledWith(expect.any(File), {
      x: 0.25,
      y: 0,
      width: 0.5,
      height: 1,
    });
  });

  it("keeps the saved picture when the crop is cancelled", async () => {
    const prepareImage = vi.fn((file: Blob) => Promise.resolve({ blob: file }));
    setup({ prepareImage });

    choose(png());
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" })
    );

    expect(
      screen.queryByRole("img", { name: "The picture you chose" })
    ).toBeNull();
    expect(prepareImage).not.toHaveBeenCalled();
  });
});
