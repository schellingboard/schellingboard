/** Ends the site login too, which the guest name's sign-out leaves alone. */
export async function endSiteSession() {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) throw new Error(`logout ${response.status}`);
}
