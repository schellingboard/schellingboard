import { select } from "@lingui/core/macro";

export type ActingTask =
  | "editProfile"
  | "createProposal"
  | "editProposal"
  | "addSession"
  | "editSession"
  | "changeSettings"
  | "seeNotifications"
  | "seeComments"
  | "openMeetings";

export function actingGuestRefusal(code: string, task: ActingTask): string {
  if (code === "guest.protected")
    return select(task, {
      editProfile: `This name is protected. Switch to it with your password or emailed code — via the name chip in the header — before editing your profile.`,
      createProposal: `This name is protected. Switch to it with your password or emailed code — via the name chip in the header — before creating a proposal.`,
      editProposal: `This name is protected. Switch to it with your password or emailed code — via the name chip in the header — before editing this proposal.`,
      addSession: `This name is protected. Switch to it with your password or emailed code — via the name chip in the header — before adding a session.`,
      editSession: `This name is protected. Switch to it with your password or emailed code — via the name chip in the header — before editing a session.`,
      changeSettings: `This name is protected. Switch to it with your password or emailed code — via the name chip in the header — before changing your settings.`,
      seeNotifications: `This name is protected. Switch to it with your password or emailed code — via the name chip in the header — before seeing your notifications.`,
      seeComments: `This name is protected. Switch to it with your password or emailed code — via the name chip in the header — before seeing your comments.`,
      openMeetings: `This name is protected. Switch to it with your password or emailed code — via the name chip in the header — before opening your 1-on-1s.`,
      other: `This name is protected.`,
    });
  return select(task, {
    editProfile: `You need to select who you are before editing your profile. Pick your name via the “Select your name” chip in the header at the top of the page.`,
    createProposal: `You need to select who you are before creating a proposal. Pick your name via the “Select your name” chip in the header at the top of the page.`,
    editProposal: `You need to select who you are before editing this proposal. Pick your name via the “Select your name” chip in the header at the top of the page.`,
    addSession: `You need to select who you are before adding a session. Pick your name via the “Select your name” chip in the header at the top of the page.`,
    editSession: `You need to select who you are before editing a session. Pick your name via the “Select your name” chip in the header at the top of the page.`,
    changeSettings: `You need to select who you are before changing your settings. Pick your name via the “Select your name” chip in the header at the top of the page.`,
    seeNotifications: `You need to select who you are before seeing your notifications. Pick your name via the “Select your name” chip in the header at the top of the page.`,
    seeComments: `You need to select who you are before seeing your comments. Pick your name via the “Select your name” chip in the header at the top of the page.`,
    openMeetings: `You need to select who you are before opening your 1-on-1s. Pick your name via the “Select your name” chip in the header at the top of the page.`,
    other: `You need to select who you are.`,
  });
}
