// URL e chave ANON (pública) do Supabase — usadas pela autenticação (sessão do
// usuário via cookie). A anon key pode ir pro browser sem problema.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pmipauvqptxhbqqvswjz.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtaXBhdXZxcHR4aGJxcXZzd2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTg0NTEsImV4cCI6MjA5OTI3NDQ1MX0.f6-3RLKM8Tt7fGARfeCXeWkD89t05Ff3mk0qX5leENo";

// Domínio do cookie de sessão. Em produção defina NEXT_PUBLIC_COOKIE_DOMAIN
// = .brucarventures.com para a sessão ser compartilhada com o painel e os
// outros apps (SSO). Sem ela, o cookie fica só neste host (útil no preview).
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || "";

export const cookieOptions = COOKIE_DOMAIN
  ? { domain: COOKIE_DOMAIN, path: "/", sameSite: "lax" as const, secure: true }
  : undefined;
