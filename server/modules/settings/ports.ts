import type { Repositories } from "@/db/container";

export interface MapImageStore {
  validate(image: Buffer): Promise<{ ext: string } | { error: string }>;
  /** Replaces any previous map; returns the new map's public URL. */
  save(image: Buffer, ext: string): Promise<string>;
  delete(): Promise<void>;
}

export interface SettingsDeps {
  repos: Pick<Repositories, "settings">;
  maps: MapImageStore;
}
