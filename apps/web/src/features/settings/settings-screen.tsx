import type { MeetingAvailabilityCalls } from "../../commands/meeting-availability";
import type { SettingsCalls } from "../../commands/settings";
import type { SettingsState } from "../../queries/settings";
import { ThemeSelect } from "../../app/theme";
import { AvailabilityForm } from "../meetings/availability-form";
import { EmailSettingsForm } from "./email-settings-form";
import { PushNotifications } from "./push-notifications";

const SECTION = "mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 sm:px-0";

export type SettingsLinks = { profile: string };

/** The signed-in guest's private settings, and the device's own appearance. */
export function SettingsScreen({
  state,
  calls,
  availability,
  links,
}: {
  state: SettingsState;
  calls: SettingsCalls;
  availability: MeetingAvailabilityCalls;
  links: SettingsLinks;
}) {
  return (
    <div className="flex flex-col gap-8">
      {state.status === "loading" && (
        <p role="status" className="px-4 text-fg-muted">
          Loading…
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="px-4 text-danger-fg">
          Could not load your settings. Reload the page to try again.
        </p>
      )}
      {state.status === "ready" && (
        <>
          <div className={`${SECTION} gap-6`}>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-fg-subtle">
              Everything here is private and never shown to other attendees.
              Your{" "}
              <a
                href={links.profile}
                className="text-brand-fg underline hover:text-brand-fg-hover"
              >
                public profile
              </a>{" "}
              is edited separately.
            </p>
            <EmailSettingsForm initial={state.emailSettings} calls={calls} />
          </div>
          <div className={SECTION}>
            <PushNotifications publicKey={state.publicKey} calls={calls} />
          </div>
          <OneOnOnes forms={state.forms} calls={availability} />
        </>
      )}
      <Appearance />
    </div>
  );
}

// Availability is per event, so it is one panel per event rather than one
// form -- collapsed, except that a lone one starts open.
function OneOnOnes({
  forms,
  calls,
}: {
  forms: Extract<SettingsState, { status: "ready" }>["forms"];
  calls: MeetingAvailabilityCalls;
}) {
  return (
    <section aria-labelledby="one-on-ones" className={SECTION}>
      <h2 id="one-on-ones" className="text-lg font-semibold">
        1-on-1s
      </h2>
      <p className="text-sm text-fg-subtle">
        When you&apos;re free to meet other attendees, event by event. Only the
        events you&apos;re attending that offer 1-on-1s are listed.
      </p>
      {forms.length === 0 ? (
        <p className="text-sm text-fg-muted">
          None of your events offers 1-on-1s at the moment.
        </p>
      ) : (
        forms.map((form) => (
          <details
            key={form.eventId}
            open={forms.length === 1}
            className="rounded-md border border-line-subtle"
          >
            <summary className="cursor-pointer px-4 py-3 font-medium text-fg">
              {form.eventName}
            </summary>
            <div className="px-4 pb-4">
              <AvailabilityForm {...form} calls={calls} />
            </div>
          </details>
        ))
      )}
    </section>
  );
}

/** Stored per device, not on the guest: it follows the screen being read. */
export function Appearance() {
  return (
    <section aria-labelledby="appearance-heading" className={SECTION}>
      <h2 id="appearance-heading" className="text-lg font-semibold">
        Appearance (this device)
      </h2>
      <p className="text-sm text-fg-subtle">
        Following the system means the site is dark whenever your phone or
        laptop is.
      </p>
      <div>
        <ThemeSelect />
      </div>
    </section>
  );
}
