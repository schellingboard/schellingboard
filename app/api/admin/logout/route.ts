import { cookies } from "next/headers";
import {
  createAdminLogoutCookie,
  requireProxyVerifiedAdmin,
} from "@/utils/auth";

export async function POST(req: Request) {
  const unverified = requireProxyVerifiedAdmin(req);
  if (unverified) return unverified;
  (await cookies()).set(createAdminLogoutCookie());
  return new Response(null, { status: 204 });
}
