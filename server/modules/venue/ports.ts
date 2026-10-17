import type { Repositories } from "@/db/container";
import type { UnitOfWork } from "@/server/kernel/unit-of-work";

export interface LocationImageStore {
  validate(
    image: Buffer
  ): Promise<{ ext: string; buffer: Buffer } | { error: string }>;
  /** Returns the image's public URL. */
  save(locationId: string, image: Buffer, ext: string): Promise<string>;
  delete(locationId: string): Promise<void>;
}

export interface VenueDeps {
  uow: UnitOfWork;
  repos: Pick<Repositories, "events" | "locations">;
  images: LocationImageStore;
}
