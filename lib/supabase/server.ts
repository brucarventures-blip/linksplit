import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY, cookieOptions } from "./config";

// Cliente Supabase para Server Components / Route Handlers, com a sessão do
// usuário lida dos cookies. Usa a chave ANON (respeita o usuário logado).
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          cookiesToSet.forEach((c) => cookieStore.set(c.name, c.value, c.options));
        } catch {
          // chamado de um Server Component — ignorado (o middleware cuida do refresh)
        }
      },
    },
  });
}
