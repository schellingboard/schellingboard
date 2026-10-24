"use client";

import { PropsWithChildren } from "react";
import { AppLink } from "@/app/components/app-link";
import type { LinkProps } from "next/link";
import {
  viewProposalLinkFromElsewhere,
  viewSessionLink,
} from "@/app/legacy/(site)/[eventSlug]/modal-nav";

export type ProfileItem = {
  eventSlug: string;
  id: string;
};

function ProfileItemLink({
  props,
  children,
}: PropsWithChildren<{ props: LinkProps }>) {
  return (
    <AppLink
      {...props}
      className="text-brand-fg hover:text-brand-fg-hover hover:underline"
    >
      {children}
    </AppLink>
  );
}

export function SessionLink({
  eventSlug,
  id,
  children,
}: PropsWithChildren<ProfileItem>) {
  return (
    <ProfileItemLink props={viewSessionLink(eventSlug, id)}>
      {children}
    </ProfileItemLink>
  );
}

export function ProposalLink({
  eventSlug,
  id,
  children,
}: PropsWithChildren<ProfileItem>) {
  return (
    <ProfileItemLink props={viewProposalLinkFromElsewhere(eventSlug, id)}>
      {children}
    </ProfileItemLink>
  );
}
