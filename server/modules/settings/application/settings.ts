import type { SiteSettings } from "@schellingboard/domain/site-settings";
import type { Actor } from "@/server/kernel/actor";
import { forbidden, invalid, ok, type Result } from "@/server/kernel/result";
import type { SettingsDeps } from "../ports";

export interface SiteSettingsInput {
  title: string;
  description: string;
  image?: Buffer;
  removeMap?: boolean;
}

const adminRequired = () => forbidden("admin.required", "Unauthorized");

export const getSiteSettings =
  ({ repos }: SettingsDeps) =>
  async (actor: Actor): Promise<Result<SiteSettings>> => {
    if (!actor.admin) return adminRequired();
    return ok(await repos.settings.get());
  };

export const updateSiteSettings =
  ({ repos, maps }: SettingsDeps) =>
  async (
    actor: Actor,
    input: SiteSettingsInput
  ): Promise<Result<SiteSettings>> => {
    if (!actor.admin) return adminRequired();
    const title = input.title.trim();
    if (!title) return invalid("settings.titleRequired", "Title is required");
    const description = input.description.trim();

    let prepared: { buffer: Buffer; ext: string } | undefined;
    if (input.image) {
      const validation = await maps.validate(input.image);
      if ("error" in validation) {
        return invalid("settings.mapInvalid", validation.error);
      }
      prepared = { buffer: input.image, ext: validation.ext };
    }

    // Left out of the patch unless it changes: the update merges into the row
    // under the write lock, so a map uploaded meanwhile survives.
    let map: { mapImageUrl: string } | undefined;
    if (prepared) {
      map = { mapImageUrl: await maps.save(prepared.buffer, prepared.ext) };
    } else if (input.removeMap) {
      await maps.delete();
      map = { mapImageUrl: "" };
    }
    return ok(await repos.settings.update({ title, description, ...map }));
  };
