import { beforeEach } from "vitest";
import { resetRateLimits } from "@/server/kernel/rate-limit";

// Every API call takes a token from its caller's bucket, so without this a
// file's earlier tests would use up its later ones' budget.
beforeEach(() => resetRateLimits());
