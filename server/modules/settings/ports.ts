import type { Repositories } from "@/db/container";
import type { UnitOfWork } from "@/server/kernel/unit-of-work";

export interface MapImageStore {
  validate(image: Buffer): Promise<{ ext: string } | { error: string }>;
  /** Returns the new file's public URL; earlier files stay. */
  saveNew(image: Buffer, ext: string): Promise<string>;
  deleteByUrl(url: string): Promise<void>;
}

export interface SettingsDeps {
  uow: UnitOfWork;
  repos: Pick<Repositories, "settings">;
  maps: MapImageStore;
}
