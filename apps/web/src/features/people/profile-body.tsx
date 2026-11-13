import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { ContactType, ProfilePrompt } from "@schellingboard/domain/guest";
import { CORE_PROMPTS } from "@schellingboard/domain/prompt-pool";
import type { ComponentType, ReactNode, SVGProps } from "react";

import type { MeetingRequestCalls } from "../../commands/meeting-request";
import type { DirectoryEntry } from "../../queries/directory";
import type {
  ProfileActivityState,
  ProfileMeetingOption,
} from "../../queries/profile-activity";
import { DiscordIcon, SignalIcon, WhatsAppIcon } from "../../ui/brand-icons";
import {
  EnvelopeIcon,
  GlobeAltIcon,
  LinkIcon,
  PaperAirplaneIcon,
  PhoneIcon,
} from "../../ui/icons";
import { Markdown, MarkdownInline } from "../../ui/markdown";
import { AttendeeLabels } from "./attendee-labels";
import { contactLabel } from "./contact-labels";
import type { ProfileLinks } from "./links";
import { OpenUpNudge } from "./open-up-nudge";
import { ProfilePhoto } from "./profile-photo";
import { promptLabel } from "./prompt-text";

const LINK = "text-brand-fg hover:text-brand-fg-hover hover:underline";
const SECONDARY =
  "rounded-md border border-line bg-surface-raised px-3 py-1.5 text-sm font-medium text-fg hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand-accent";

const CONTACT_ICONS: Record<
  ContactType,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  email: EnvelopeIcon,
  phone: PhoneIcon,
  whatsapp: WhatsAppIcon,
  signal: SignalIcon,
  telegram: PaperAirplaneIcon,
  discord: DiscordIcon,
  website: GlobeAltIcon,
  other: LinkIcon,
};

/** Core prompts first, in their canonical order; the rest keep saved order. */
function orderPrompts(prompts: ProfilePrompt[]): ProfilePrompt[] {
  return [
    ...CORE_PROMPTS.flatMap((core) => prompts.filter((p) => p.prompt === core)),
    ...prompts.filter((p) => !CORE_PROMPTS.includes(p.prompt)),
  ];
}

/**
 * A guest's public profile. Everything but Hosting, Proposals and the 1-on-1
 * buttons comes from the directory entry the list already holds, so switching
 * profiles is instant and only those arrive late.
 */
export function ProfileBody({
  guest,
  isOwnProfile,
  activity,
  links,
  zoomed,
  onToggleZoom,
  onSchedule,
  meetingRequests,
  comments,
}: {
  guest: DirectoryEntry;
  isOwnProfile: boolean;
  /** Null for the neighbours a swipe mounts: only the profile being read loads. */
  activity: ProfileActivityState | null;
  links: ProfileLinks;
  zoomed: boolean;
  onToggleZoom: () => void;
  onSchedule: (guestId: string, option: ProfileMeetingOption) => void;
  meetingRequests: MeetingRequestCalls;
  /** Only the profile being read has a thread. */
  comments: ReactNode;
}) {
  const options = activity?.meetingOptions ?? [];
  const nudges = activity?.nudges ?? [];
  const basedIn = guest.basedIn;
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <ProfilePhoto
          name={guest.name}
          image={guest.avatarUrl}
          zoomed={zoomed}
          onToggleZoom={onToggleZoom}
        />
        <h1 className="text-3xl font-bold break-words max-w-full">
          {guest.name}
        </h1>
        {(guest.pronouns || guest.isHost || guest.labels.length > 0) && (
          <div className="flex flex-row flex-wrap items-center justify-center gap-2">
            {guest.pronouns && (
              <p className="text-fg-muted">{guest.pronouns}</p>
            )}
            {guest.isHost && (
              <span className="w-fit rounded-full bg-brand-tint-hover text-brand-fg text-xs font-semibold px-3 py-1">
                <Trans>Session host</Trans>
              </span>
            )}
            <AttendeeLabels labels={guest.labels} tappable />
          </div>
        )}
        {guest.basedIn && (
          <p className="text-fg-muted">
            <Trans>Based in {basedIn}</Trans>
          </p>
        )}
        {isOwnProfile && (
          <a
            href={links.edit}
            className="text-sm font-semibold text-brand-fg hover:text-brand-fg-hover"
          >
            <Trans>Edit profile</Trans>
          </a>
        )}
        {!isOwnProfile && options.length > 0 && (
          <div className="flex flex-col gap-2">
            {options.map((option) => {
              const eventName = option.eventName;
              return (
                <button
                  key={option.eventId}
                  type="button"
                  onClick={() => onSchedule(guest.id, option)}
                  className={SECONDARY}
                >
                  {options.length === 1
                    ? t`Schedule a 1-on-1`
                    : t`Schedule a 1-on-1 at ${eventName}`}
                </button>
              );
            })}
          </div>
        )}
        {!isOwnProfile && nudges.length > 0 && (
          <div className="flex flex-col gap-3">
            {nudges.map((nudge) => (
              <OpenUpNudge
                key={nudge.eventId}
                nudge={nudge}
                guestId={guest.id}
                guestName={guest.name}
                showEvent={options.length + nudges.length > 1}
                calls={meetingRequests}
              />
            ))}
          </div>
        )}
        {(guest.languages ?? []).length > 0 && (
          <section className="w-full mt-2">
            <h2 className="text-lg font-semibold mb-2">
              <Trans>Languages</Trans>
            </h2>
            <ul className="flex flex-wrap justify-center gap-2">
              {guest.languages!.map((language, i) => (
                <li
                  key={i}
                  className="rounded-full bg-surface-muted px-3 py-1 text-sm text-fg"
                >
                  {language}
                </li>
              ))}
            </ul>
          </section>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-8 min-w-0">
        {guest.aboutMe && (
          <section>
            <h2 className="text-lg font-semibold mb-2">
              <Trans>About me</Trans>
            </h2>
            <div className="text-fg">
              <Markdown className="text-base">{guest.aboutMe}</Markdown>
            </div>
          </section>
        )}

        {orderPrompts(guest.prompts ?? []).map(({ prompt, answer }) => (
          <section key={prompt}>
            <h2 className="text-lg font-semibold mb-2">
              {promptLabel(prompt)}
            </h2>
            <div className="text-fg">
              <Markdown className="text-base">{answer}</Markdown>
            </div>
          </section>
        ))}

        {(guest.contacts ?? []).length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-2">
              <Trans context="Profile section: how to reach the person">
                Contact
              </Trans>
            </h2>
            <ul className="flex flex-col gap-2">
              {guest.contacts!.map((contact, i) => {
                const Icon = CONTACT_ICONS[contact.type];
                const label =
                  (contact.type === "other" && contact.label) ||
                  contactLabel(contact.type);
                return (
                  <li key={i} className="flex items-start gap-2 text-fg">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-fg-subtle" />
                    <span className="min-w-0 break-words">
                      <span className="font-medium">
                        <Trans comment="Label of a contact detail, followed by its value">
                          {label}:
                        </Trans>
                      </span>{" "}
                      <MarkdownInline>{contact.value}</MarkdownInline>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {activity?.status === "ready" ? (
          <>
            <ActivityList
              title={t`Hosting`}
              items={activity.hosting}
              href={links.session}
            />
            <ActivityList
              title={t`Proposals`}
              items={activity.proposals}
              href={links.proposal}
            />
          </>
        ) : activity?.status === "error" ? null : (
          // Unlabelled on purpose: the sections it stands in for are hidden
          // when empty, and a "Hosting" heading that then vanished would be a
          // worse lie than a nameless placeholder.
          <div aria-hidden="true" className="flex flex-col gap-2 animate-pulse">
            <div className="h-4 w-28 rounded bg-surface-muted" />
            <div className="h-4 w-56 rounded bg-surface-muted" />
          </div>
        )}

        {comments}
      </div>
    </div>
  );
}

function ActivityList({
  title,
  items,
  href,
}: {
  title: string;
  items: { id: string; title: string; eventSlug: string }[];
  href: (eventSlug: string, id: string) => string;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <a href={href(item.eventSlug, item.id)} className={LINK}>
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
