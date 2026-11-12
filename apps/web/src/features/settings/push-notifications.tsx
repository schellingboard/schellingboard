import { useCallback, useEffect, useRef, useState } from "react";
import { urlBase64ToUint8Array } from "@schellingboard/domain/push-key";
import { newKey } from "../../commands/keys";
import { awaitMutation } from "../../commands/mutation";
import type { SettingsCalls } from "../../commands/settings";
import { Button } from "../../ui/button";

type State =
  | "checking"
  | "unsupported"
  /** iOS only offers push to a web app that has been added to the home screen. */
  | "needs-install"
  | "blocked"
  | "off"
  | "on";

function isApplePhoneOrTablet(): boolean {
  // iPadOS reports itself as a Mac; the touch points are what give it away.
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isInstalled(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

async function subscribeHere(
  registration: ServiceWorkerRegistration,
  publicKey: string
): Promise<PushSubscription> {
  const options: PushSubscriptionOptionsInit = {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  };
  try {
    return await registration.pushManager.subscribe(options);
  } catch (err) {
    // A different server key makes subscribe() fail; only dropping the old
    // subscription gets past it.
    const stale = await registration.pushManager.getSubscription();
    if (!stale) throw err;
    await stale.unsubscribe();
    return registration.pushManager.subscribe(options);
  }
}

type Device = {
  id: string;
  host: string;
  createdAt: string;
  current: boolean;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });

const describe = (device: Device) =>
  `${device.host}, on since ${formatDate(device.createdAt)}${device.current ? ", this device" : ""}`;

export function PushNotifications({
  publicKey,
  calls,
}: {
  publicKey: string;
  calls: Pick<
    SettingsCalls,
    | "subscribe"
    | "unsubscribe"
    | "isEnabledHere"
    | "listDevices"
    | "removeDevice"
  >;
}) {
  const [state, setState] = useState<State>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [removed, setRemoved] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const fetchDevices = useCallback(async (): Promise<Device[]> => {
    const registration = await navigator.serviceWorker
      ?.getRegistration()
      .catch(() => undefined);
    const subscription = await registration?.pushManager
      .getSubscription()
      .catch(() => null);
    const answer = await calls.listDevices(subscription?.endpoint);
    return answer.data?.items ?? [];
  }, [calls]);

  useEffect(() => {
    if (state === "checking") return;
    void fetchDevices()
      .catch(() => [])
      .then(setDevices);
  }, [state, fetchDevices]);

  useEffect(() => {
    const check = async () => {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setState(
          isApplePhoneOrTablet() && !isInstalled()
            ? "needs-install"
            : "unsupported"
        );
        return;
      }
      if (Notification.permission === "denied") {
        setState("blocked");
        return;
      }
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (!subscription) {
        setState("off");
        return;
      }
      // The browser's subscription survives a name switch on a shared
      // device, so the server must confirm it is ours.
      const answer = await calls.isEnabledHere(subscription.endpoint);
      if (answer.data?.enabled === false) await subscription.unsubscribe();
      setState(answer.data?.enabled === true ? "on" : "off");
    };
    // A failed check says nothing about the browser.
    void check().catch(() => setState("off"));
  }, [calls]);

  const enable = async () => {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "off");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const subscription = await subscribeHere(registration, publicKey);
      const keys = subscription.toJSON().keys;
      const result = await awaitMutation(
        (key) =>
          calls.subscribe(
            {
              endpoint: subscription.endpoint,
              p256dh: keys?.p256dh ?? "",
              auth: keys?.auth ?? "",
            },
            key
          ),
        newKey()
      );
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setState("on");
    } catch {
      setError("Could not turn notifications on for this device.");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        const result = await awaitMutation(
          () => calls.unsubscribe(subscription.endpoint),
          newKey()
        );
        if (!result.ok) {
          setError(result.message);
          return;
        }
        await subscription.unsubscribe();
      }
      setState("off");
    } catch {
      setError("Could not turn notifications off for this device.");
    } finally {
      setBusy(false);
    }
  };

  const removeDevice = async (device: Device) => {
    setBusy(true);
    setError(null);
    setRemoved(null);
    try {
      const result = await awaitMutation(
        () => calls.removeDevice(device.id),
        newKey()
      );
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setDevices((current) => current.filter((d) => d.id !== device.id));
      setRemoved(`Turned off for ${describe(device)}.`);
      heading.current?.focus();
      if (device.current) {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        await subscription?.unsubscribe();
        setState("off");
      }
    } catch {
      setError("Could not turn notifications off for that device.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="push-heading" className="flex flex-col gap-2">
      <h2
        id="push-heading"
        ref={heading}
        tabIndex={-1}
        className="text-lg font-semibold outline-none"
      >
        Notifications on this device
      </h2>
      <p className="text-sm text-fg-subtle">
        Everything the notifications page tells you, on your phone or laptop
        while the site isn&rsquo;t open. A device gets all of them &mdash; the
        email settings above only decide what is emailed. Each device is turned
        on separately.
      </p>

      <div aria-live="polite" className="flex flex-col gap-2">
        {state === "checking" && (
          <p className="text-sm text-fg-muted">Checking&hellip;</p>
        )}

        {state === "needs-install" && (
          <p className="text-sm text-fg-muted">
            On iPhone and iPad this works once the site is on your home screen:
            tap the Share button, then <strong>Add to Home Screen</strong>, and
            open it from there.
          </p>
        )}

        {state === "unsupported" && (
          <p className="text-sm text-fg-muted">
            This browser can&rsquo;t show notifications. You&rsquo;ll still see
            everything on the notifications page.
          </p>
        )}

        {state === "blocked" && (
          <p className="text-sm text-fg-muted">
            Notifications are blocked for this site. Allow them in your
            browser&rsquo;s settings for this site, then reload this page.
          </p>
        )}

        {state === "off" && (
          <div>
            <Button
              onClick={() => void enable()}
              disabled={busy}
              className="px-6 py-2"
            >
              {busy ? "Turning on..." : "Turn on for this device"}
            </Button>
          </div>
        )}

        {state === "on" && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-success-fg">On for this device.</span>
            <Button
              variant="quiet"
              onClick={() => void disable()}
              disabled={busy}
              className="border border-line px-6 py-2"
            >
              {busy ? "Turning off..." : "Turn off"}
            </Button>
          </div>
        )}
      </div>

      {removed && (
        <p role="status" className="text-sm text-success-fg">
          {removed}
        </p>
      )}

      {devices.length > 0 && (
        <>
          <h3 id="devices-heading" className="text-base font-semibold">
            Notifications on your devices
          </h3>
          <ul
            aria-labelledby="devices-heading"
            className="flex flex-col divide-y divide-line-subtle rounded-md border border-line text-sm"
          >
            {devices.map((device) => (
              <li
                key={device.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2"
              >
                <span className="flex-1">
                  {device.host}
                  <span className="text-fg-subtle">
                    {" "}
                    &middot; on since {formatDate(device.createdAt)}
                  </span>
                  {device.current && (
                    <span className="ms-2 rounded-full bg-brand-tint-hover px-2 py-0.5 text-xs text-brand-fg">
                      This device
                    </span>
                  )}
                </span>
                <Button
                  variant="quiet"
                  onClick={() => void removeDevice(device)}
                  disabled={busy}
                  aria-label={`Turn off ${describe(device)}`}
                  className="border border-line px-3 py-1"
                >
                  Turn off
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger-fg">
          {error}
        </p>
      )}
    </section>
  );
}
