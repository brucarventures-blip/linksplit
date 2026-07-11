import { NextRequest } from "next/server";
import { handleRedirect } from "@/lib/redirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /r/<slug>  -> motor de redirect
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  return handleRedirect(req, params.slug);
}
