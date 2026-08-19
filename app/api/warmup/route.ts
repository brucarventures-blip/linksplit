import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const WARMUP_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Brucar-Warmup": "linksplit",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Cookie",
};

function empty(status: number) {
  return new Response(null, { status, headers: WARMUP_HEADERS });
}

export async function GET() {
  const auth = await getCurrentUser();
  if (!auth) return empty(401);

  let query = supabaseAdmin.from("campaigns").select("id").order("created_at", { ascending: false }).limit(1);
  if (!auth.isAdmin) {
    if (!auth.allowedProjectIds.length) return empty(204);
    query = query.in("project_id", auth.allowedProjectIds);
  }

  const { error } = await query;
  return empty(error ? 503 : 204);
}
