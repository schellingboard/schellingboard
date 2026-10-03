import { z } from "zod";

export const newPasswordSchema = z
  .string()
  .min(8, { message: "Use at least 8 characters" })
  .max(200);
