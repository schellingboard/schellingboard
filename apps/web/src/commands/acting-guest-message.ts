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
    editProfile: `Select your name to edit your profile.`,
    createProposal: `Select your name to create a proposal.`,
    editProposal: `Select your name to edit this proposal.`,
    addSession: `Select your name to add a session.`,
    editSession: `Select your name to edit a session.`,
    changeSettings: `Select your name to change your settings.`,
    seeNotifications: `Select your name to see your notifications.`,
    seeComments: `Select your name to see your comments.`,
    openMeetings: `Select your name to open your 1-on-1s.`,
    other: `Select your name first.`,
  });
}
