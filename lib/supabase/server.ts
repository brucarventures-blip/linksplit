import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY, cookieOptionsFor } from "./config";

// Cliente Supabase para Server Components / Route Handlers, com a sessão do
// usuário lida dos cookies. Usa a chave ANON (respeita o usuário logado).
export function createClient() {
  const cookieStore = cookies();
  const host = headers().get("host") ?? undefined;
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieOptions: cookieOptionsFor(host),
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
