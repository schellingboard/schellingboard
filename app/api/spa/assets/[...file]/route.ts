import { serveSpaAsset, spaDir } from "@/utils/spa-files";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string[] }> }
) {
  return serveSpaAsset(spaDir(), (await params).file);
}
