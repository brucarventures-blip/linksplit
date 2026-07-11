import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getCurrentUser, type AuthContext } from "@/lib/auth";

export const runtime = "nodejs";

// Confere se o usuário pode mexer nesta campanha.
// Admin pode tudo; operador só se a campanha estiver num projeto liberado.
async function canAccess(auth: AuthContext, campaignId: string): Promise<boolean> {
  if (auth.isAdmin) return true;
  const { data } = await supabaseAdmin
    .from("campaigns")
    .select("project_id")
    .eq("id", campaignId)
    .single();
  const pid = (data as any)?.project_id;
  return !!pid && auth.allowedProjectIds.includes(pid);
}

// DELETE /api/campaigns/<id>
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  if (!(await canAccess(auth, params.id)))
    return NextResponse.json({ error: "sem acesso a esta campanha" }, { status: 403 });

  const { error } = await supabaseAdmin.from("campaigns").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH /api/campaigns/<id>  -> liga/desliga campanha ou filtro
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  if (!(await canAccess(auth, params.id)))
    return NextResponse.json({ error: "sem acesso a esta campanha" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.active === "boolean") patch.active = body.active;
  if (typeof body.filter_bots === "boolean") patch.filter_bots = body.filter_bots;
  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });

  const { error } = await supabaseAdmin.from("campaigns").update(patch).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
