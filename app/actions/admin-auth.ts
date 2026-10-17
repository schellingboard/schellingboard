"use server";

import {
  verifyAdminPassword,
  createAdminAuthCookie,
  createAdminLogoutCookie,
  isAdminEnabled,
  safeRedirectPath,
} from "@/utils/auth";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import {
  TOO_MANY_ATTEMPTS_ERROR,
  clientIp,
  loginRetryAfter,
  recordLoginFailure,
} from "@/server/kernel/rate-limit";

export async function adminLoginAction(
  prevState: { error: string } | null,
  formData: FormData
) {
  const password = formData.get("admin-password") as string;
  const redirectTo = safeRedirectPath(
    formData.get("redirect") as string,
    "/legacy/admin"
  );

  if (!isAdminEnabled()) {
    return { error: "Admin access is disabled" };
  }

  if (!password) {
    return { error: "Password is required" };
  }

  const clientKey = clientIp(await headers());
  if (loginRetryAfter("admin", clientKey) > 0) {
    return { error: TOO_MANY_ATTEMPTS_ERROR };
  }

  if (verifyAdminPassword(password)) {
    (await cookies()).set(await createAdminAuthCookie());
    redirect(redirectTo);
  }

  recordLoginFailure("admin", clientKey);
  return { error: "Invalid password" };
}

export async function adminLogoutAction() {
  (await cookies()).set(createAdminLogoutCookie());
  redirect("/legacy/admin/login");
}
