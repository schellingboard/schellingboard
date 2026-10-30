import type { Repositories } from "@/db/container";
import type { UnitOfWork } from "@/server/kernel/unit-of-work";

export interface ValidatedImage {
  ext: string;
  buffer: Buffer;
}

export interface AvatarStore {
  validate(image: Buffer): Promise<ValidatedImage | { error: string }>;
  /** Returns the new file's public URL; earlier files stay. */
  saveNew(guestId: string, image: Buffer, ext: string): Promise<string>;
  deleteByUrl(url: string): Promise<void>;
}

export interface LoginMail {
  configured(): boolean;
  send(input: {
    guestId: string;
    name: string;
    email: string;
    code: string;
    validMinutes: number;
  }): Promise<void>;
  sendResetLink(input: {
    guestId: string;
    name: string;
    email: string;
    token: string;
    validMinutes: number;
  }): Promise<void>;
  sendSecurityChanged(input: {
    name: string;
    email: string;
    change: "disabled" | "password-changed";
  }): Promise<void>;
}

export interface PeopleDeps {
  uow: UnitOfWork;
  repos: Pick<
    Repositories,
    | "authCodes"
    | "events"
    | "guests"
    | "loginSessions"
    | "sessions"
    | "sessionProposals"
  >;
  avatars: AvatarStore;
  loginMail: LoginMail;
  sendTestEmail: (to: { name: string; email: string }) => Promise<void>;
}
