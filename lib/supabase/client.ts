import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY, cookieOptions } from "./config";

// Cliente Supabase para componentes do browser (ex: tela de login).
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, { cookieOptions });
}
