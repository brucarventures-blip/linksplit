import { NextRequest, NextResponse } from "next/server";
import { handleRedirect } from "@/lib/redirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Link limpo (encurtador de marca): seudominio.com/<slug>
// Rotas estaticas (/dashboard, /api) tem prioridade sobre este dinamico.
const RESERVED = new Set([
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "dashboard",
  "api",
  "r",
]);

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (RESERVED.has(params.slug)) {
    return new NextResponse("Not found", { status: 404 });
  }
  return handleRedirect(req, params.slug);
}
