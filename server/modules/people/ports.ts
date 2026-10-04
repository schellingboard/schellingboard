import type { Repositories } from "@/db/container";

export interface ValidatedImage {
  ext: string;
  buffer: Buffer;
}

export interface AvatarStore {
  validate(image: Buffer): Promise<ValidatedImage | { error: string }>;
  /** Returns the photo's public URL. */
  save(guestId: string, image: Buffer, ext: string): Promise<string>;
  delete(guestId: string): Promise<void>;
}

export interface PeopleDeps {
  repos: Pick<Repositories, "events" | "guests">;
  avatars: AvatarStore;
  sendTestEmail: (to: { name: string; email: string }) => Promise<void>;
}
