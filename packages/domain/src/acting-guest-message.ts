/** What to tell someone a `guest.*` refusal kept from `task`, e.g. "editing your profile". */
export function actingGuestRefusalMessage(code: string, task: string): string {
  if (code === "guest.protected") {
    return `This name is protected. Switch to it with your password or emailed code — via the name chip in the header — before ${task}.`;
  }
  return `You need to select who you are before ${task}. Pick your name via the “Select your name” chip in the header at the top of the page.`;
}
