/** Ends the site login too, which the guest name's sign-out leaves alone. */
export async function endSiteSession() {
  const response = await fetch("/api/v1/auth/site", { method: "DELETE" });
  if (!response.ok) throw new Error(`logout ${response.status}`);
}
