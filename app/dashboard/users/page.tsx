import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import UsersManager from "./UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login");
  if (!auth.isAdmin) redirect("/dashboard");

  const [{ data: profiles }, { data: links }, { data: projects }] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, email, role, created_at").order("created_at", { ascending: true }),
    supabaseAdmin.from("user_projects").select("user_id, project_id"),
    supabaseAdmin.from("projects").select("id, code, name").order("created_at", { ascending: false }),
  ]);

  const byUser: Record<string, string[]> = {};
  (links ?? []).forEach((l: any) => {
    (byUser[l.user_id] ??= []).push(l.project_id);
  });
  const users = (profiles ?? []).map((p: any) => ({ ...p, project_ids: byUser[p.id] ?? [] }));

  return (
    <>
      <h1>Usuários</h1>
      <p className="muted">
        Crie operadores e libere apenas os projetos que cada um deve acessar. O
        Admin vê e faz tudo.
      </p>
      <UsersManager initialUsers={users} projects={projects ?? []} meId={auth.user.id} />
    </>
  );
}
