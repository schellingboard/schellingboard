import { serveSpaShell, spaDir } from "@/utils/spa-files";

export const dynamic = "force-dynamic";

export const GET = () => serveSpaShell(spaDir());
