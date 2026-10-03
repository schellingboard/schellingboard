"use client";

import { useContext, useMemo, useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";

import { Input } from "@/app/input";
import { UserContext, useBreakMinutes, useSlotIncrement } from "../context";
import {
  createProposal,
  updateProposal,
  deleteProposal,
} from "./proposals/actions";
import type { SessionProposal, Guest } from "@/db/repositories/interfaces";
import { SelectHosts } from "@/app/select-hosts";
import { ConfirmDeletionModal } from "../modals";
import { formatDuration, durationMinusBreak } from "@/utils/utils";
import { slotDurationOptions } from "@/utils/slots";
import { MarkdownHint } from "@/app/(site)/markdown";
import { ScheduledSessionsNotice } from "./scheduled-sessions-notice";
import { useController, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { COHOST_WANTED_NOTE_MAX } from "@schellingboard/domain/session";
import { sessionProposalSchema } from "@schellingboard/contracts/session";
import { z } from "zod";
import { BackLink } from "@/app/components/back-link";
import { MarkdownTextarea } from "@/app/components/markdown-textarea";
import { FormErrorSummary } from "@/app/components/form-error-summary";
import { setActionErrors } from "@/utils/forms";
import { FormActions } from "./form-actions";
import { SUBMIT_BUTTON } from "@/app/components/buttons";

export function SessionProposalForm(props: {
  eventID: string;
  eventSlug: string;
  proposal?: SessionProposal;
  guests: Guest[];
  maxSessionDuration: number;
}) {
  const { eventID, eventSlug, proposal, guests, maxSessionDuration } = props;
  const breakMinutes = useBreakMinutes();
  const slotIncrement = useSlotIncrement();
  const DURATION_OPTIONS = [
    undefined,
    ...slotDurationOptions(slotIncrement, maxSessionDuration),
  ];
  const { user: currentUserId } = useContext(UserContext);
  const router = useRouter();
  const [isDeleting, startDeleting] = useTransition();
  // The fields keep what the form loaded even when a refresh brings a newer
  // proposal, so the save must claim the loaded version, not the newest.
  const [loadedVersion] = useState(() => proposal?.updatedTime.toISOString());

  const defaultHosts = useMemo(() => {
    if (proposal) return proposal.hosts.map((h) => h.id);
    if (currentUserId) return [currentUserId];
    return [];
  }, [currentUserId, proposal]);

  const form = useForm({
    resolver: zodResolver(sessionProposalSchema),
    defaultValues: {
      eventId: eventID,
      eventSlug,
      title: proposal?.title ?? "",
      description: proposal?.description ?? "",
      hostIds: defaultHosts,
      durationMinutes: proposal?.durationMinutes,
      cohostWanted: proposal?.cohostWanted ?? false,
      cohostWantedNote: proposal?.cohostWantedNote ?? "",
    },
  });

  const hostsController = useController({
    control: form.control,
    name: "hostIds",
  });

  const durationMinutesController = useController({
    control: form.control,
    name: "durationMinutes",
  });

  // Read-only: the input itself is registered, this only drives the submit
  // button's disabled state.
  const title = useWatch({ control: form.control, name: "title" });
  const cohostWanted = useWatch({
    control: form.control,
    name: "cohostWanted",
  });
  const hostIds = hostsController.field.value ?? [];

  const handleSubmit = async (
    sessionProposal: z.infer<typeof sessionProposalSchema>
  ) => {
    try {
      let result: Awaited<ReturnType<typeof updateProposal>>;
      if (proposal) {
        result = await updateProposal(proposal.id, {
          ...sessionProposal,
          expectedUpdatedTime: loadedVersion!,
        });
      } else {
        result = await createProposal(sessionProposal);
      }

      if ("error" in result) {
        setActionErrors(form, result.error);
      } else {
        router.push(`/${eventSlug}/proposals`);
      }
    } catch (err) {
      form.setError("root", { message: "An unexpected error occurred" });
      console.error(err);
    }
  };

  // In a transition, because the action ends in a redirect: Next carries that
  // out from inside one, while a redirect thrown outside a transition is left
  // to the caller and ends up an unhandled rejection.
  const handleDelete = (): void => {
    if (!proposal) return;

    startDeleting(async () => {
      try {
        // A delete that went through redirects to the proposals list, so
        // anything that comes back here is a refusal.
        const result = await deleteProposal(proposal.id, eventSlug);

        if (result?.error) {
          form.setError("root", { message: result.error });
        }
      } catch (err) {
        // The redirect, on its way out to Next — not a failure to report.
        unstable_rethrow(err);
        form.setError("root", { message: "An unexpected error occurred" });
        console.error(err);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <BackLink href={`/${eventSlug}/proposals`}>Proposals</BackLink>
      <div>
        <h2 className="text-2xl font-bold">
          {proposal ? "Edit" : "Add"} Session Proposal
        </h2>
        <p className="text-sm text-fg-subtle mt-2">
          Share your session idea with the community. Only the title is
          required.
        </p>
      </div>
      {proposal && (
        <ScheduledSessionsNotice proposalId={proposal.id}>
          Changes here do not reach the schedule. To change a session, open it
          and edit it there.
        </ScheduledSessionsNotice>
      )}

      <form
        onSubmit={(e) => form.handleSubmit(handleSubmit)(e) as never}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label className="font-medium" htmlFor="proposal-title">
            Title
            <span className="text-brand-fg mx-1">*</span>
          </label>
          <Input
            id="proposal-title"
            {...form.register("title")}
            autoFocus
            placeholder="Enter a clear, descriptive title"
          />
          <span className="text-danger-fg text-sm">
            {form.formState.errors.title?.message}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium" htmlFor="proposal-description">
            Description
          </label>
          <MarkdownTextarea
            id="proposal-description"
            {...form.register("description")}
            placeholder="Describe what your session will cover"
          />
          <MarkdownHint />
          <span className="text-danger-fg text-sm">
            {form.formState.errors.description?.message}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium" htmlFor="proposal-hosts">
            Host(s)
          </label>
          <p className="text-sm text-fg-subtle mt-1">
            Leave empty to ask for a session without offering to give it
            yourself — anyone who can host it may add themselves here later.
          </p>
          <SelectHosts
            id="proposal-hosts"
            guests={guests}
            hosts={guests.filter((g) => hostIds.some((h) => h === g.id))}
            setHosts={(nextHosts) => {
              // Hosts forget to withdraw the request once they have found their
              // co-host, so adding one withdraws it; ticking it again asks anew.
              if (nextHosts.length > hostIds.length) {
                form.setValue("cohostWanted", false);
              }
              hostsController.field.onChange(nextHosts.map((h) => h.id));
            }}
            selectMany={true}
          />
          <span className="text-danger-fg text-sm">
            {form.formState.errors.hostIds?.message}
          </span>
          {hostIds.length > 0 && (
            <div className="mt-2 flex flex-col gap-2">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  {...form.register("cohostWanted")}
                  className="mt-0.5 h-4 w-4 rounded border-line text-brand focus:ring-brand-accent"
                />
                <span>
                  <span className="font-medium">Looking for a co-host</span>
                  <span className="block text-fg-subtle">
                    Lists the proposal under “Host wanted” and lets anyone join
                    as a co-host. Stops as soon as someone joins.
                  </span>
                </span>
              </label>
              {cohostWanted && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm" htmlFor="proposal-cohost-note">
                    Who are you looking for?
                  </label>
                  <Input
                    id="proposal-cohost-note"
                    {...form.register("cohostWantedNote")}
                    maxLength={COHOST_WANTED_NOTE_MAX}
                    placeholder="e.g. someone to take over, or a second facilitator"
                  />
                  <span className="text-danger-fg text-sm">
                    {form.formState.errors.cohostWantedNote?.message}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">Duration</label>
          <fieldset>
            <div className="grid gap-3">
              {DURATION_OPTIONS.map((value) => (
                <div key={value ?? "undecided"} className="flex items-center">
                  <input
                    id={`duration-${value ?? "undecided"}`}
                    type="radio"
                    checked={value === durationMinutesController.field.value}
                    onChange={() =>
                      durationMinutesController.field.onChange(value)
                    }
                    className="h-4 w-4 border-line text-brand focus:ring-brand-accent"
                  />
                  <label
                    htmlFor={`duration-${value ?? "undecided"}`}
                    className="ml-3 block text-sm font-medium leading-6 text-fg"
                  >
                    {value
                      ? formatDuration(
                          durationMinusBreak(value, breakMinutes),
                          true
                        )
                      : "Undecided"}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          <span className="text-danger-fg text-sm">
            {form.formState.errors.durationMinutes?.message}
          </span>
        </div>

        <FormErrorSummary form={form} />

        <FormActions
          cancelHref={`/${eventSlug}/proposals`}
          deleteButton={
            proposal && (
              <ConfirmDeletionModal
                btnDisabled={form.formState.isSubmitting || isDeleting}
                confirm={handleDelete}
                itemName="session proposal"
              />
            )
          }
        >
          <button
            type="submit"
            className={SUBMIT_BUTTON}
            disabled={!title || form.formState.isSubmitting || isDeleting}
          >
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </FormActions>
      </form>
    </div>
  );
}
