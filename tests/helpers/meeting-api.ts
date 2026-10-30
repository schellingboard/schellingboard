import { callApi, type Fields } from "./api";

export type MeetingResult = { ok: true } | { ok: false; error: string };

/** The 1-on-1 routes of /api/v1 as a guest holding `cookies` calls them. */
export function meetingApi(cookies: Map<string, string>) {
  async function call(
    method: "POST" | "PUT",
    path: string,
    body?: Fields
  ): Promise<MeetingResult> {
    const result = await callApi(cookies, method, path, body);
    if ("success" in result) return { ok: true };
    return { ok: false, error: result.error.detail ?? result.error.code };
  }

  return {
    requestMeeting: (fields: Fields) => call("POST", "/meetings", fields),
    saveAvailability: (fields: Fields) =>
      call("PUT", "/meeting-availability", fields),
    respondToMeeting: ({
      meetingId,
      response,
    }: {
      meetingId: string;
      response: "accept" | "decline";
    }) => call("POST", `/meetings/${meetingId}/${response}`),
    cancelMeeting: ({
      meetingId,
      ...body
    }: {
      meetingId: string;
      note?: string;
    }) => call("POST", `/meetings/${meetingId}/cancel`, body),
  };
}
