import { randomBytes } from "node:crypto";

export const newEventToken = () => randomBytes(16).toString("hex");
