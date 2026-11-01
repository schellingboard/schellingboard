import { web } from "@/server/http/web";

export const dynamic = "force-dynamic";

const handle = (request: Request) => web.fetch(request);

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
export const HEAD = handle;
