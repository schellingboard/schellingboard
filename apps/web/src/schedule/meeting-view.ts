import type { z } from "zod";
import type { meetingViewSchema } from "@schellingboard/contracts/meeting";

export type MeetingView = z.infer<typeof meetingViewSchema>;
export type MeetingViewStatus = MeetingView["status"];
