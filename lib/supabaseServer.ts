import { createClient } from "@supabase/supabase-js";

// Cliente do lado do servidor. A chave abaixo e a "anon" do Supabase, que e
// segura de embarcar (e usada so no servidor aqui, nunca vai pro browser).
// Pode sobrescrever por variaveis de ambiente se quiser.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://pmipauvqptxhbqqvswjz.supabase.co";

const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtaXBhdXZxcHR4aGJxcXZzd2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTg0NTEsImV4cCI6MjA5OTI3NDQ1MX0.f6-3RLKM8Tt7fGARfeCXeWkD89t05Ff3mk0qX5leENo";

// IMPORTANTE: o Next.js (App Router) cacheia requisicoes GET/HEAD por padrao.
// Isso fazia as leituras (contagens) retornarem sempre o primeiro valor.
// Forcamos no-store em toda chamada ao Supabase para ler dados sempre frescos.
export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, cache: "no-store" }),
  },
});
