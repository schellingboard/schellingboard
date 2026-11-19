import type { meetingViewSchema } from "@schellingboard/contracts/meeting";
import type { z } from "zod";

export type MeetingView = z.infer<typeof meetingViewSchema>;
export type MeetingViewStatus = MeetingView["status"];
