import type { SiteSettings } from "@schellingboard/domain/site-settings";
import type { Actor } from "@/server/kernel/actor";
import { withStoredFile } from "@/server/kernel/stored-files";
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

export const getPublicSiteSettings =
  ({ repos }: SettingsDeps) =>
  async (): Promise<Result<SiteSettings>> =>
    ok(await repos.settings.get());

export const updateSiteSettings =
  ({ uow, maps }: SettingsDeps) =>
  async (
    actor: Actor,
    input: SiteSettingsInput
  ): Promise<Result<SiteSettings>> => {
    if (!actor.admin) return adminRequired();
    const title = input.title.trim();
    if (!title) return invalid("settings.titleRequired", "Title is required");
    const description = input.description.trim();

    let newMapUrl: string | null = null;
    if (input.image) {
      const validation = await maps.validate(input.image);
      if ("error" in validation) {
        return invalid("settings.mapInvalid", validation.error);
      }
      newMapUrl = await maps.saveNew(input.image, validation.ext);
    }
    const changesMap = newMapUrl !== null || input.removeMap;

    return withStoredFile(maps, newMapUrl, (replaces) =>
      uow.run(async (tx) => {
        const before = await tx.settings.get();
        const updated = await tx.settings.update({
          title,
          description,
          ...(changesMap && { mapImageUrl: newMapUrl ?? "" }),
        });
        if (changesMap) replaces(before.mapImageUrl);
        return ok(updated);
      })
    );
  };
