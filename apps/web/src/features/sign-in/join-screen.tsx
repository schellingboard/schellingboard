import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useEffect, useRef, useState } from "react";

import type { SignInCalls } from "../../commands/sign-in";
import { useCredentialForm } from "./use-credential-form";

type Outcome =
  | { kind: "working" }
  | { kind: "signIn"; guestId: string }
  | { kind: "failed"; message: string; replaced: boolean; fixed: boolean };

export function JoinScreen({
  calls,
  token,
  guests,
  onJoined,
}: {
  calls: SignInCalls;
  token: string;
  guests: { id: string; name: string }[];
  onJoined: (eventSlug: string) => void;
}) {
  const [outcome, setOutcome] = useState<Outcome>({ kind: "working" });
  const mutation = useCredentialForm(() => calls.join({ token }));
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void mutation.submit().then((result) => {
      if (!result) return;
      if (!result.ok)
        return setOutcome({
          kind: "failed",
          message: result.message,
          replaced:
            result.kind === "refused" && result.code === "join.tokenWrong",
          fixed: result.kind === "refused" && result.code === "identity.fixed",
        });
      const joined = result.data;
      if (!joined) return;
      if (joined.joined) onJoined(joined.eventSlug);
      else setOutcome({ kind: "signIn", guestId: joined.guestId });
    });
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 sm:px-0">
      <h1 className="text-2xl font-bold">
        <Trans>Join the event</Trans>
      </h1>
      {outcome.kind === "working" && (
        <p role="status">
          <Trans>Opening your link…</Trans>
        </p>
      )}
      {outcome.kind === "signIn" && (
        <SignInAsGuest
          guestId={outcome.guestId}
          name={guests.find((g) => g.id === outcome.guestId)?.name}
          token={token}
        />
      )}
      {outcome.kind === "failed" && (
        <div className="flex flex-col gap-2">
          <p role="alert" className="text-danger-fg">
            {outcome.replaced
              ? t`This link no longer works: a newer one replaced it. Ask an organizer for a new link.`
              : outcome.fixed
                ? t`The proxy decides who you are on this site, so this link for someone else cannot sign you in.`
                : outcome.message}
          </p>
          <a href="/" className="self-start text-sm underline">
            <Trans>Go to the start page</Trans>
          </a>
        </div>
      )}
    </div>
  );
}

function SignInAsGuest({
  guestId,
  name,
  token,
}: {
  guestId: string;
  name: string | undefined;
  token: string;
}) {
  const redirect = encodeURIComponent(`/join/${encodeURIComponent(token)}`);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted">
        {name ? (
          <Trans>{name} needs to sign in first. You then join the event.</Trans>
        ) : (
          <Trans>
            This person needs to sign in first. You then join the event.
          </Trans>
        )}
      </p>
      <a
        href={`/auth/login?guest=${encodeURIComponent(guestId)}&redirect=${redirect}`}
        className="self-start rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-on-brand hover:bg-brand-hover"
      >
        {name ? t`Sign in as ${name}` : t`Sign in`}
      </a>
    </div>
  );
}
