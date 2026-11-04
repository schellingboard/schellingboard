import { api } from "@/server/http/app";

const handle = (request: Request) => api.fetch(request);

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
