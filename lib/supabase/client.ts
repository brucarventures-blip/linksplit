import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY, cookieOptionsFor } from "./config";

// Cliente Supabase para componentes do browser (ex: tela de login).
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieOptions: cookieOptionsFor(),
  });
}
