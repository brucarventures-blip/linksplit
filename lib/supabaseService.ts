import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./supabase/config";

// Cliente com a chave service_role — necessário para operações de admin
// (criar/excluir usuários do Auth). Só funciona se SUPABASE_SERVICE_ROLE_KEY
// estiver configurada nas variáveis de ambiente da Vercel.
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const hasServiceKey = serviceKey.length > 0;

let _client: SupabaseClient | null = null;

// Criado sob demanda (nunca no import) — evita erro quando a chave não existe.
export function serviceClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(SUPABASE_URL, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}
