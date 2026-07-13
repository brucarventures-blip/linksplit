import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { serviceClient, hasServiceKey } from "@/lib/supabaseService";

export const runtime = "nodejs";

// DELETE /api/users/<id> -> exclui o usuário. Só admin.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: "acesso apenas para admin" }, { status: 403 });
  if (auth.user.id === params.id)
    return NextResponse.json({ error: "Você não pode excluir a si mesmo." }, { status: 400 });
  if (!hasServiceKey)
    return NextResponse.json(
      { error: "Configure SUPABASE_SERVICE_ROLE_KEY na Vercel para excluir usuários." },
      { status: 400 }
    );

  const { error } = await serviceClient().auth.admin.deleteUser(params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH /api/users/<id> -> atualiza os projetos liberados. Só admin.
// body: { project_ids: string[] }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  const isSelf = auth.user.id === params.id;
  if (!auth.isAdmin && !isSelf)
    return NextResponse.json({ error: "acesso apenas para admin" }, { status: 403 });

  const body = await req.json().catch(() => null);

  // Upload/atualização de foto de perfil (admin p/ qualquer um, ou o próprio usuário).
  if (typeof body?.avatar === "string" && body.avatar.startsWith("data:")) {
    if (!hasServiceKey)
      return NextResponse.json(
        { error: "Configure SUPABASE_SERVICE_ROLE_KEY na Vercel para enviar fotos." },
        { status: 400 }
      );
    const m = body.avatar.match(/^data:(image\/(png|jpe?g|webp|gif));base64,(.+)$/);
    if (!m) return NextResponse.json({ error: "Imagem inválida." }, { status: 400 });
    const ext = m[2] === "jpeg" || m[2] === "jpg" ? "jpg" : m[2];
    const buf = Buffer.from(m[3], "base64");
    if (buf.length > 2_500_000)
      return NextResponse.json({ error: "Imagem muito grande (máx ~2MB)." }, { status: 400 });
    const svc = serviceClient();
    const path = `${params.id}.${ext}`;
    const up = await svc.storage
      .from("avatars")
      .upload(path, buf, { contentType: m[1], upsert: true });
    if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 });
    const { data: pub } = svc.storage.from("avatars").getPublicUrl(path);
    const url = `${pub.publicUrl}?v=${Date.now()}`;
    await supabaseAdmin.from("profiles").update({ avatar_url: url }).eq("id", params.id);
    return NextResponse.json({ ok: true, avatar_url: url });
  }

  // Daqui pra baixo é gestão de projetos: só admin.
  if (!auth.isAdmin) return NextResponse.json({ error: "acesso apenas para admin" }, { status: 403 });
  const projectIds: string[] = Array.isArray(body?.project_ids) ? body.project_ids : [];

  await supabaseAdmin.from("user_projects").delete().eq("user_id", params.id);
  if (projectIds.length > 0) {
    await supabaseAdmin
      .from("user_projects")
      .insert(projectIds.map((pid) => ({ user_id: params.id, project_id: pid })));
  }
  return NextResponse.json({ ok: true });
}
