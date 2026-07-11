import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { serviceClient, hasServiceKey } from "@/lib/supabaseService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/users -> lista usuários (perfil + projetos liberados). Só admin.
export async function GET() {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: "acesso apenas para admin" }, { status: 403 });

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: true });

  const { data: links } = await supabaseAdmin
    .from("user_projects")
    .select("user_id, project_id");

  const byUser: Record<string, string[]> = {};
  (links ?? []).forEach((l: any) => {
    (byUser[l.user_id] ??= []).push(l.project_id);
  });

  const users = (profiles ?? []).map((p: any) => ({
    ...p,
    project_ids: byUser[p.id] ?? [],
  }));

  return NextResponse.json({ users });
}

// POST /api/users -> cria um operador. Só admin. Precisa da service_role.
// body: { email, password, project_ids: string[] }
export async function POST(req: NextRequest) {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: "acesso apenas para admin" }, { status: 403 });
  if (!hasServiceKey)
    return NextResponse.json(
      { error: "Configure SUPABASE_SERVICE_ROLE_KEY na Vercel para criar usuários." },
      { status: 400 }
    );

  const body = await req.json().catch(() => null);
  const email = (body?.email ?? "").trim().toLowerCase();
  const password = (body?.password ?? "").toString();
  const projectIds: string[] = Array.isArray(body?.project_ids) ? body.project_ids : [];

  if (!email || password.length < 6)
    return NextResponse.json(
      { error: "Informe email e senha (mín. 6 caracteres)." },
      { status: 400 }
    );

  const { data: created, error: cErr } = await serviceClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (cErr || !created?.user)
    return NextResponse.json({ error: cErr?.message ?? "Falha ao criar usuário" }, { status: 500 });

  const uid = created.user.id;

  // Garante papel operador (o gatilho já cria o perfil).
  await supabaseAdmin.from("profiles").upsert({ id: uid, email, role: "operador" });

  if (projectIds.length > 0) {
    await supabaseAdmin
      .from("user_projects")
      .insert(projectIds.map((pid) => ({ user_id: uid, project_id: pid })));
  }

  return NextResponse.json({ id: uid });
}
