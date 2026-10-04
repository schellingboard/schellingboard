import type { Repositories } from "@/db/container";

export interface LocationImageStore {
  validate(
    image: Buffer
  ): Promise<{ ext: string; buffer: Buffer } | { error: string }>;
  /** Returns the image's public URL. */
  save(locationId: string, image: Buffer, ext: string): Promise<string>;
  delete(locationId: string): Promise<void>;
}

export interface VenueDeps {
  repos: Pick<Repositories, "events" | "locations">;
  images: LocationImageStore;
}
