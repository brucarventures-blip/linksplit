// URL e chave ANON (pública) do Supabase — usadas pela autenticação (sessão do
// usuário via cookie). A anon key pode ir pro browser sem problema.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pmipauvqptxhbqqvswjz.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtaXBhdXZxcHR4aGJxcXZzd2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTg0NTEsImV4cCI6MjA5OTI3NDQ1MX0.f6-3RLKM8Tt7fGARfeCXeWkD89t05Ff3mk0qX5leENo";
