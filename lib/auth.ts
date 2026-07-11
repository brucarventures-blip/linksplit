import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export type Profile = { id: string; email: string | null; role: "admin" | "operador" };

export type AuthContext = {
  user: { id: string; email?: string };
  profile: Profile | null;
  isAdmin: boolean;
  allowedProjectIds: string[];
};

// Retorna o usuário logado + perfil (papel) + projetos que ele pode acessar.
// Null se não houver sessão.
export async function getCurrentUser(): Promise<AuthContext | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  let allowedProjectIds: string[] = [];
  if (!isAdmin) {
    const { data } = await supabaseAdmin
      .from("user_projects")
      .select("project_id")
      .eq("user_id", user.id);
    allowedProjectIds = (data ?? []).map((r: any) => r.project_id);
  }

  return {
    user: { id: user.id, email: user.email },
    profile: (profile as Profile) ?? null,
    isAdmin,
    allowedProjectIds,
  };
}
